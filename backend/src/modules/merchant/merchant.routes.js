import { Router } from 'express';
import multer       from 'multer';
import fs           from 'fs';
import path         from 'path';
import crypto       from 'crypto';
import { getClient, query } from '../../db/pool.js';
import { ok, err, created, getPagination, paginate } from '../../utils/response.js';
import { authenticate, requireRole, apiKeyAuth } from '../../middleware/auth.middleware.js';
import { lookupDevice } from '../../services/deviceLookup.service.js';
import { auditLog }      from '../../utils/audit.js';

const router = Router();

// ── File upload for CSV ───────────────────────────────────────────
const csvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/bulk';
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-bulk.csv`),
});
const csvUpload = multer({
  storage: csvStorage,
  limits:  { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok_ = file.mimetype === 'text/csv' || file.originalname.endsWith('.csv');
    cb(null, ok_);
  },
});

async function getApiUsage(merchantId) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const month = new Date(today);
  month.setUTCDate(1);

  const { rows } = await query(
    `SELECT COUNT(*) FILTER (WHERE created_at >= $2) AS daily,
            COUNT(*) FILTER (WHERE created_at >= $3) AS monthly
     FROM merchant_api_usage WHERE merchant_id=$1`,
    [merchantId, today, month]
  );

  return {
    daily: Number(rows[0].daily),
    monthly: Number(rows[0].monthly),
  };
}

async function reserveMerchantApiUsage(merchantId, userId, count, onReserved) {
  const client = await getClient();
  let transactionOpen = false;

  try {
    await client.query('BEGIN');
    transactionOpen = true;

    const merchant = await client.query(
      `SELECT daily_limit, monthly_limit FROM merchants
       WHERE id=$1 AND is_active=TRUE FOR UPDATE`,
      [merchantId]
    );
    if (!merchant.rows.length) {
      await client.query('ROLLBACK');
      transactionOpen = false;
      return { allowed: false, unavailable: true };
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const month = new Date(today);
    month.setUTCDate(1);
    const usage = await client.query(
      `SELECT COUNT(*) FILTER (WHERE created_at >= $2) AS daily,
              COUNT(*) FILTER (WHERE created_at >= $3) AS monthly
       FROM merchant_api_usage WHERE merchant_id=$1`,
      [merchantId, today, month]
    );
    const dailyUsed = Number(usage.rows[0].daily);
    const monthlyUsed = Number(usage.rows[0].monthly);
    const { daily_limit: dailyLimit, monthly_limit: monthlyLimit } = merchant.rows[0];

    if (dailyUsed + count > dailyLimit || monthlyUsed + count > monthlyLimit) {
      await client.query('ROLLBACK');
      transactionOpen = false;
      return { allowed: false, unavailable: false };
    }

    const reservations = await client.query(
      `INSERT INTO merchant_api_usage (merchant_id, user_id, ordinal)
       SELECT $1, $2, item.ordinal FROM generate_series(1, $3) AS item(ordinal)
       RETURNING id, ordinal`,
      [merchantId, userId, count]
    );
    const value = onReserved ? await onReserved(client) : undefined;
    await client.query('COMMIT');
    transactionOpen = false;
    const reservationIds = reservations.rows
      .sort((a, b) => a.ordinal - b.ordinal)
      .map(row => row.id);
    return { allowed: true, value, reservationIds };
  } catch (error) {
    if (transactionOpen) await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function recordMerchantApiSearch(userId, imei, ip, result, reservationId) {
  const client = await getClient();
  let transactionOpen = false;
  try {
    await client.query('BEGIN');
    transactionOpen = true;
    const search = await client.query(
      `INSERT INTO search_logs (user_id,imei,ip_address,result,source)
       VALUES ($1,$2,$3,$4,'api') RETURNING id`,
      [userId, imei, ip, result]
    );
    const linked = await client.query(
      'UPDATE merchant_api_usage SET search_log_id=$1 WHERE id=$2',
      [search.rows[0].id, reservationId]
    );
    if (linked.rowCount !== 1) throw new Error('Merchant API usage reservation was not found');
    await client.query('COMMIT');
    transactionOpen = false;
  } catch (error) {
    if (transactionOpen) await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// ── Helper: generate secure API key ──────────────────────────────
function generateApiKey() {
  return `CMD-${crypto.randomBytes(30).toString('hex')}`;
}

// ── GET /merchant/profile ────────────────────────────────────────
router.get('/profile', authenticate, requireRole('merchant','admin','super_admin'), async (req, res) => {
  const result = await query(
    `SELECT m.*, u.email, u.full_name
     FROM merchants m JOIN users u ON m.user_id=u.id
     WHERE m.user_id=$1`,
    [req.user.id]
  );
  if (!result.rows.length)
    return err(res, 'NOT_MERCHANT', 'حسابك غير مسجل كتاجر، تواصل مع الدعم', '', 404);

  const m = result.rows[0];
  ok(res, { ...m, api_key: m.api_key.replace(/.(?=.{4})/g, '*') }); // mask key
});

// ── GET /merchant/api-key ────────────────────────────────────────
router.get('/api-key', authenticate, requireRole('merchant','admin','super_admin'), async (req, res) => {
  const result = await query('SELECT api_key FROM merchants WHERE user_id=$1', [req.user.id]);
  if (!result.rows.length) return err(res, 'NOT_MERCHANT', '', '', 404);
  ok(res, { api_key: result.rows[0].api_key });
});

// ── POST /merchant/api-key/regenerate ───────────────────────────
router.post('/api-key/regenerate', authenticate, requireRole('merchant','admin','super_admin'), async (req, res) => {
  const newKey = generateApiKey();
  await query('UPDATE merchants SET api_key=$1, updated_at=NOW() WHERE user_id=$2', [newKey, req.user.id]);
  await auditLog({ userId: req.user.id, action: 'merchant.api_key_regenerated', entityType: 'merchant', ip: req.ip });
  ok(res, { api_key: newKey, message_ar: 'تم تجديد الـ API Key بنجاح. احتفظ به في مكان آمن.' });
});

// ── GET /merchant/stats ──────────────────────────────────────────
router.get('/stats', authenticate, requireRole('merchant','admin','super_admin'), async (req, res) => {
  const merchant = await query('SELECT id, daily_limit, monthly_limit FROM merchants WHERE user_id=$1', [req.user.id]);
  if (!merchant.rows.length) return err(res, 'NOT_MERCHANT', '', '', 404);

  const [usage, jobs] = await Promise.all([
    getApiUsage(merchant.rows[0].id),
    query('SELECT COUNT(*) as cnt, COUNT(*) FILTER(WHERE status=\'completed\') as done FROM bulk_search_jobs WHERE merchant_id=$1', [merchant.rows[0].id]),
  ]);

  ok(res, {
    daily_searches:   usage.daily,
    monthly_searches: usage.monthly,
    daily_limit:      merchant.rows[0].daily_limit,
    monthly_limit:    merchant.rows[0].monthly_limit,
    bulk_jobs_total:  parseInt(jobs.rows[0].cnt),
    bulk_jobs_done:   parseInt(jobs.rows[0].done),
  });
});

// ── POST /merchant/bulk-search ───────────────────────────────────
router.post('/bulk-search', authenticate, requireRole('merchant','admin','super_admin'), csvUpload.single('file'), async (req, res) => {
  if (!req.file) return err(res, 'FILE_REQUIRED', 'يرجى رفع ملف CSV يحتوي على أرقام IMEI');

  const merchant = await query('SELECT id FROM merchants WHERE user_id=$1', [req.user.id]);
  if (!merchant.rows.length) {
    await fs.promises.unlink(req.file.path);
    return err(res, 'NOT_MERCHANT', '', '', 404);
  }

  // Read and parse CSV
  const content = await fs.promises.readFile(req.file.path, 'utf-8');
  await fs.promises.unlink(req.file.path);
  const lines   = content.split('\n').map(l => l.trim()).filter(Boolean);

  // Skip header if present
  const startIdx  = lines[0]?.toLowerCase().includes('imei') ? 1 : 0;
  const imeiList  = lines.slice(startIdx).map(line => line.split(',')[0].trim()).filter(v => /^\d{14,16}$/.test(v));

  if (imeiList.length === 0)
    return err(res, 'NO_VALID_IMEI', 'لم يتم العثور على أرقام IMEI صحيحة في الملف');
  if (imeiList.length > 1000)
    return err(res, 'TOO_MANY', 'الحد الأقصى 1000 جهاز لكل عملية');

  const reservation = await reserveMerchantApiUsage(
    merchant.rows[0].id,
    req.user.id,
    imeiList.length,
    async (client) => {
      const job = await client.query(
        `INSERT INTO bulk_search_jobs (merchant_id, file_url, total_count, status)
         VALUES ($1, NULL, $2, 'queued') RETURNING id`,
        [merchant.rows[0].id, imeiList.length]
      );
      return job.rows[0].id;
    }
  );
  if (!reservation.allowed) {
    if (reservation.unavailable) return err(res, 'NOT_MERCHANT', '', '', 404);
    return err(res, 'API_QUOTA_EXCEEDED', 'تجاوزت حصة البحث المتاحة لحسابك', '', 429);
  }
  const jobId = reservation.value;

  // Process in background (non-blocking)
  processBulkJob(jobId, imeiList, req.user.id, reservation.reservationIds).catch(console.error);

  created(res, {
    job_id:      jobId,
    total:       imeiList.length,
    status:      'queued',
    message_ar:  `تمت إضافة ${imeiList.length} جهاز للمعالجة. ستُخطر عند الانتهاء.`,
    check_url:   `/api/merchant/bulk-search/${jobId}`,
  });
});

// Background processor
async function processBulkJob(jobId, imeiList, userId, reservationIds) {
  await query("UPDATE bulk_search_jobs SET status='processing', started_at=NOW() WHERE id=$1", [jobId]);

  const results = [];
  for (const [index, imei] of imeiList.entries()) {
    try {
      // Check reports DB
      const rep = await query(
        `SELECT brand,model,report_type,country_code FROM devices_reports
         WHERE imei=$1 AND status='approved' LIMIT 1`,
        [imei]
      );
      const isReported = rep.rows.length > 0;

      // Get device info from cache (no API cost if cached)
      const deviceInfo = await lookupDevice(imei).catch(() => ({ found: false, data: null }));

      results.push({
        imei:        imei,
        status:      isReported ? rep.rows[0].report_type : 'clean',
        brand:       deviceInfo.data?.brand || rep.rows[0]?.brand || 'Unknown',
        model:       deviceInfo.data?.model || rep.rows[0]?.model || 'Unknown',
        country:     rep.rows[0]?.country_code || null,
        cache_source: deviceInfo.source,
      });

      // Log as API search
      await recordMerchantApiSearch(
        userId,
        imei,
        '127.0.0.1',
        isReported ? rep.rows[0].report_type : 'clean',
        reservationIds[index]
      );

      await query('UPDATE bulk_search_jobs SET processed_count=processed_count+1 WHERE id=$1', [jobId]);
    } catch (err) {
      results.push({ imei, status: 'error', error: err.message });
    }
  }

  // Save result as JSON file
  const resultPath = `uploads/bulk/result-${jobId}.json`;
  fs.writeFileSync(resultPath, JSON.stringify({ total: imeiList.length, results }, null, 2));

  await query(
    "UPDATE bulk_search_jobs SET status='completed', result_url=$1, completed_at=NOW() WHERE id=$2",
    [`/uploads/bulk/result-${jobId}.json`, jobId]
  );
}

// ── GET /merchant/bulk-search/:jobId ────────────────────────────
router.get('/bulk-search/:jobId', authenticate, requireRole('merchant','admin','super_admin'), async (req, res) => {
  const merchant = await query('SELECT id FROM merchants WHERE user_id=$1', [req.user.id]);
  if (!merchant.rows.length) return err(res, 'NOT_MERCHANT', '', '', 404);

  const job = await query(
    `SELECT id, status, total_count, processed_count, created_at, started_at, completed_at
     FROM bulk_search_jobs WHERE id=$1 AND merchant_id=$2`,
    [req.params.jobId, merchant.rows[0].id]
  );
  if (!job.rows.length) return err(res, 'NOT_FOUND', 'العملية غير موجودة', '', 404);

  ok(res, job.rows[0]);
});

// ── GET /merchant/bulk-search/:jobId/download ────────────────────
router.get('/bulk-search/:jobId/download', authenticate, requireRole('merchant','admin','super_admin'), async (req, res) => {
  const merchant = await query('SELECT id FROM merchants WHERE user_id=$1', [req.user.id]);
  const job = await query('SELECT * FROM bulk_search_jobs WHERE id=$1 AND merchant_id=$2',
    [req.params.jobId, merchant.rows[0]?.id]);

  if (!job.rows.length || job.rows[0].status !== 'completed')
    return err(res, 'NOT_READY', 'النتائج غير جاهزة بعد');

  const filePath = path.join(process.cwd(), job.rows[0].result_url);
  if (!fs.existsSync(filePath)) return err(res, 'FILE_NOT_FOUND', 'ملف النتائج غير موجود', '', 404);

  res.download(filePath, `bulk-result-${req.params.jobId}.json`);
});

// ══════════════════════════════════════════════════════════════════
// External API (for merchants with API key)
// ══════════════════════════════════════════════════════════════════

// ── POST /api/v1/check ────────────────────────────────────────────
router.post('/external/check', apiKeyAuth, async (req, res) => {
  const { imei, query_type = 'imei' } = req.body;
  if (!imei) return err(res, 'MISSING_IMEI', 'IMEI is required');
  if (!/^\d{14,16}$/.test(imei)) return err(res, 'INVALID_IMEI', 'Invalid IMEI format');

  const reservation = await reserveMerchantApiUsage(req.merchant.id, req.merchant.user_id, 1);
  if (!reservation.allowed) {
    if (reservation.unavailable) return err(res, 'ACCOUNT_UNAVAILABLE', 'حساب التاجر غير متاح', '', 403);
    return err(res, 'API_QUOTA_EXCEEDED', 'Merchant API quota exceeded', '', 429);
  }

  // Check reports
  const rep = await query(
    `SELECT brand,model,report_type,country_code,approved_at
     FROM devices_reports WHERE imei=$1 AND status='approved' LIMIT 1`,
    [imei]
  );
  const isReported = rep.rows.length > 0;

  // Device info
  const device = await lookupDevice(imei).catch(() => ({ found: false, data: null }));

  // Log usage
  await recordMerchantApiSearch(
    req.merchant.user_id,
    imei,
    req.ip || '0.0.0.0',
    isReported ? rep.rows[0].report_type : 'clean',
    reservation.reservationIds[0]
  );

  ok(res, {
    imei:        imei,
    status:      isReported ? rep.rows[0].report_type : 'clean',
    device_info: device.data,
    report:      isReported ? {
      brand:       rep.rows[0].brand,
      model:       rep.rows[0].model,
      report_type: rep.rows[0].report_type,
      country:     rep.rows[0].country_code,
      date:        rep.rows[0].approved_at,
    } : null,
    checked_at:  new Date().toISOString(),
  });
});

// ── GET /api/v1/usage ─────────────────────────────────────────────
router.get('/external/usage', apiKeyAuth, async (req, res) => {
  const today = new Date(); today.setUTCHours(0,0,0,0);
  const month = new Date(today); month.setUTCDate(1);

  const [d, m] = await Promise.all([
    query('SELECT COUNT(*) as cnt FROM merchant_api_usage WHERE merchant_id=$1 AND created_at>=$2', [req.merchant.id, today]),
    query('SELECT COUNT(*) as cnt FROM merchant_api_usage WHERE merchant_id=$1 AND created_at>=$2', [req.merchant.id, month]),
  ]);

  ok(res, {
    today:         parseInt(d.rows[0].cnt),
    this_month:    parseInt(m.rows[0].cnt),
    daily_limit:   req.merchant.daily_limit,
    monthly_limit: req.merchant.monthly_limit,
  });
});

export default router;
