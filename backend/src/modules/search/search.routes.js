import { Router } from 'express';
import { query } from '../../db/pool.js';
import { ok, err, getPagination, paginate, maskIMEI } from '../../utils/response.js';
import { authenticate, optionalAuth } from '../../middleware/auth.middleware.js';
import { searchRateLimit } from '../../middleware/rateLimit.middleware.js';
import { lookupDevice, validateIMEI } from '../../services/deviceLookup.service.js';
import { getUserSearchLimit } from '../../services/subscription.service.js';
import { sendDeviceSearchedAlert } from '../../services/email.service.js';
import { cacheGet, cacheSet, KEY, TTL } from '../../services/redis.service.js';
import geoip from 'geoip-lite';

// ─── Arabic country names (used in email notifications) ───────────
const COUNTRY_NAMES_AR = {
  EG: 'مصر', SA: 'السعودية', AE: 'الإمارات', KW: 'الكويت',
  QA: 'قطر', BH: 'البحرين', OM: 'عُمان', JO: 'الأردن',
  LB: 'لبنان', IQ: 'العراق', SY: 'سوريا', YE: 'اليمن',
  LY: 'ليبيا', TN: 'تونس', DZ: 'الجزائر', MA: 'المغرب',
  SD: 'السودان', PS: 'فلسطين', SO: 'الصومال', MR: 'موريتانيا',
  US: 'الولايات المتحدة', GB: 'المملكة المتحدة', DE: 'ألمانيا',
  FR: 'فرنسا', TR: 'تركيا', IN: 'الهند', PK: 'باكستان',
  CN: 'الصين', RU: 'روسيا', NG: 'نيجيريا', ET: 'إثيوبيا',
};

function getCountryFromIp(ip) {
  // Prefer Cloudflare header (when behind CF CDN)
  // Otherwise fall back to local geoip lookup
  if (!ip || ip === '127.0.0.1' || ip === '::1') return null;
  try {
    const geo = geoip.lookup(ip);
    if (!geo?.country) return null;
    return COUNTRY_NAMES_AR[geo.country] || geo.country;
  } catch {
    return null;
  }
}

const router = Router();

// ─── POST /search ─────────────────────────────────────────────────
router.post('/', optionalAuth, searchRateLimit, async (req, res) => {
  const { query: q, query_type = 'imei' } = req.body;
  if (!q) return err(res, 'MISSING_QUERY', 'أدخل رقم IMEI أو الرقم التسلسلي');

  const trimmed = q.trim().replace(/\s/g, '');

  if (query_type === 'imei' && !validateIMEI(trimmed)) {
    return err(res, 'INVALID_IMEI', 'رقم IMEI غير صحيح. يجب أن يكون 15 رقماً صحيحاً.');
  }

  const ip        = (req.headers['x-forwarded-for'] || req.ip || '0.0.0.0').split(',')[0].trim();
  const userAgent = req.headers['user-agent'] || '';

  // ── 1. Check Redis cache for search result ────────────────────
  const cacheKey = KEY.search(trimmed);
  const cached   = await cacheGet(cacheKey);

  let activeReports = [];
  let cacheHit      = false;

  if (cached) {
    activeReports = cached.reports;
    cacheHit      = true;
  } else {
    // ── 2. Query PostgreSQL ───────────────────────────────────────
    if (query_type === 'imei') {
      const rep = await query(
        `SELECT id,brand,model,device_type,color,report_type,country_code,city,
                incident_date,created_at,approved_at,contact_whatsapp,contact_email,
                contact_phone,reward_offered,reward_amount,reward_currency
         FROM devices_reports
         WHERE imei=$1 AND status='approved'
         ORDER BY approved_at DESC`,
        [trimmed]
      );
      activeReports = rep.rows;
    } else {
      const rep = await query(
        `SELECT id,brand,model,device_type,color,report_type,country_code,city,
                incident_date,created_at,approved_at,contact_whatsapp,contact_email,
                contact_phone,reward_offered,reward_amount,reward_currency
         FROM devices_reports
         WHERE serial_number ILIKE $1 AND status='approved'
         ORDER BY created_at DESC`,
        [trimmed]
      );
      activeReports = rep.rows;
    }

    // ── 3. Store in Redis ─────────────────────────────────────────
    await cacheSet(cacheKey, { reports: activeReports }, TTL.SEARCH_RESULT);
  }

  const isReported = activeReports.length > 0;
  const reportType = isReported ? activeReports[0].report_type : null;
  const resultCode = isReported ? reportType : 'clean';

  // ── 4. Device info (Device Lookup Service — has its own cache) ─
  let deviceInfo = null;
  if (query_type === 'imei') {
    const lookup = await lookupDevice(trimmed);
    if (lookup.found) deviceInfo = lookup.data;
  }

  // ── 5. Log search (always) ────────────────────────────────────
  await query(
    `INSERT INTO search_logs (user_id, imei, ip_address, user_agent, result, source)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [req.user?.id || null, trimmed, ip, userAgent.slice(0, 500), resultCode, 'web']
  );

  // ── 6. Notify owner if device was searched ────────────────────
  // Send regardless of cache hit — the email service has its own 24h rate limit.
  // This ensures the owner is always notified even if the DB result was cached.
  if (isReported) {
    const ownerResult = await query(
      `SELECT u.email, u.full_name, dr.contact_email
       FROM devices_reports dr JOIN users u ON dr.user_id=u.id
       WHERE dr.imei=$1 AND dr.status='approved' LIMIT 1`,
      [trimmed]
    );
    if (ownerResult.rows.length) {
      const owner       = ownerResult.rows[0];
      const notifyEmail = owner.contact_email || owner.email;
      sendDeviceSearchedAlert(notifyEmail, owner.full_name, {
        brand: activeReports[0].brand,
        model: activeReports[0].model,
        imei:  trimmed,
      }, {
        country:    req.headers['cf-ipcountry']
                      ? (COUNTRY_NAMES_AR[req.headers['cf-ipcountry']] || req.headers['cf-ipcountry'])
                      : getCountryFromIp(ip),
        searchedAt: new Date().toISOString(),
      }).catch(console.error);
    }
  }

  // ── 7. Build response ─────────────────────────────────────────
  const response = {
    status:        resultCode,
    query:         query_type === 'imei' ? maskIMEI(trimmed) : trimmed,
    query_type,
    checked_at:    new Date().toISOString(),
    device_info:   deviceInfo,
    quota:         req.searchLimit,
    cache_hit:     cacheHit,
    disclaimer_ar: 'ملاحظة: غياب الجهاز من قاعدتنا لا يعني بالضرورة أنه غير مسروق.',
  };

  if (isReported) {
    response.reports = activeReports.map(r => ({
      device_type:       r.device_type,
      brand:             r.brand,
      model:             r.model,
      color:             r.color,
      report_type:       r.report_type,
      country:           r.country_code,
      city:              r.city,
      report_date:       r.incident_date || r.created_at,
      contact_available: !!(r.contact_whatsapp || r.contact_email || r.contact_phone),
      whatsapp:          r.contact_whatsapp || null,
      email:             r.contact_email || null,
      phone:             r.contact_phone || null,
      reward_offered:    r.reward_offered,
      reward_amount:     r.reward_offered ? `${r.reward_amount} ${r.reward_currency}` : null,
    }));
    response.message_ar = reportType === 'stolen'
      ? '⚠️ تحذير: هذا الجهاز مُبلَّغ عنه كمسروق'
      : '⚠️ تحذير: هذا الجهاز مُبلَّغ عنه كمفقود';
  } else {
    response.message_ar = '✅ هذا الجهاز لم يُبلَّغ عنه في قاعدة بياناتنا';
  }

  ok(res, response);
});

// ─── GET /search/history ──────────────────────────────────────────
router.get('/history', authenticate, async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const [rows, count] = await Promise.all([
    query(
      `SELECT imei, result, created_at, source FROM search_logs
       WHERE user_id=$1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    ),
    query('SELECT COUNT(*) as cnt FROM search_logs WHERE user_id=$1', [req.user.id]),
  ]);
  ok(res, paginate(
    rows.rows.map(r => ({ ...r, imei: maskIMEI(r.imei) })),
    count.rows[0].cnt, page, limit
  ));
});

// ─── GET /search/quota ────────────────────────────────────────────
router.get('/quota', optionalAuth, async (req, res) => {
  const ip    = (req.headers['x-forwarded-for'] || req.ip || '').split(',')[0].trim();
  const limit = await getUserSearchLimit(req.user);

  // ── Try Redis first (same source as the rate limiter) ──────────
  const { rateLimitGet, KEY: RKEY, isRedisConnected } = await import('../../services/redis.service.js');

  if (isRedisConnected()) {
    const cacheKey = req.user ? RKEY.rateUser(req.user.id) : RKEY.rateIp(ip);
    const count    = await rateLimitGet(cacheKey);
    if (count !== null) {
      const used = count;
      return ok(res, { limit, used, remaining: Math.max(0, limit - used) });
    }
  }

  // ── Fallback: PostgreSQL ────────────────────────────────────────
  const today = new Date(); today.setUTCHours(0, 0, 0, 0);

  if (req.user) {
    const { rows } = await query(
      'SELECT COUNT(*) as cnt FROM search_logs WHERE user_id=$1 AND created_at>=$2',
      [req.user.id, today]
    );
    ok(res, { limit, used: parseInt(rows[0].cnt), remaining: Math.max(0, limit - parseInt(rows[0].cnt)) });
  } else {
    const { rows } = await query(
      'SELECT COUNT(*) as cnt FROM search_logs WHERE ip_address=$1 AND user_id IS NULL AND created_at>=$2',
      [ip, today]
    );
    ok(res, { limit, used: parseInt(rows[0].cnt), remaining: Math.max(0, limit - parseInt(rows[0].cnt)) });
  }
});

export default router;
