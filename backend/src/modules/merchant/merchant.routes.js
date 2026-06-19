import { Router } from 'express';
import multer       from 'multer';
import fs           from 'fs';
import path         from 'path';
import { query }    from '../../db/pool.js';
import { ok, err, created, getPagination, paginate } from '../../utils/response.js';
import { authenticate, requireRole, apiKeyAuth } from '../../middleware/auth.middleware.js';
import { lookupDevice } from '../../services/deviceLookup.service.js';
import { auditLog }      from '../../utils/audit.js';
import { v4 as uuidv4 }  from 'uuid';

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

// ── Helper: generate secure API key ──────────────────────────────
function generateApiKey() {
  const segments = [uuidv4().replace(/-/g,'').slice(0,8).toUpperCase(),
                    uuidv4().replace(/-/g,'').slice(0,8).toUpperCase()];
  return `CMD-${segments.join('-')}`;
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

  const today = new Date(); today.setHours(0,0,0,0);
  const month = new Date(); month.setDate(1); month.setHours(0,0,0,0);

  const [daily, monthly, jobs] = await Promise.all([
    query('SELECT COUNT(*) as cnt FROM search_logs WHERE user_id=$1 AND created_at>=$2 AND source=\'api\'', [req.user.id, today]),
    query('SELECT COUNT(*) as cnt FROM search_logs WHERE user_id=$1 AND created_at>=$2 AND source=\'api\'', [req.user.id, month]),
    query('SELECT COUNT(*) as cnt, COUNT(*) FILTER(WHERE status=\'completed\') as done FROM bulk_search_jobs WHERE merchant_id=$1', [merchant.rows[0].id]),
  ]);

  ok(res, {
    daily_searches:   parseInt(daily.rows[0].cnt),
    monthly_searches: parseInt(monthly.rows[0].cnt),
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
  if (!merchant.rows.length) return err(res, 'NOT_MERCHANT', '', '', 404);

  // Read and parse CSV
  const content = fs.readFileSync(req.file.path, 'utf-8');
  const lines   = content.split('\n').map(l => l.trim()).filter(Boolean);

  // Skip header if present
  const startIdx  = lines[0]?.toLowerCase().includes('imei') ? 1 : 0;
  const imeiList  = lines.slice(startIdx).map(line => line.split(',')[0].trim()).filter(v => /^\d{14,16}$/.test(v));

  if (imeiList.length === 0)
    return err(res, 'NO_VALID_IMEI', 'لم يتم العثور على أرقام IMEI صحيحة في الملف');
  if (imeiList.length > 1000)
    return err(res, 'TOO_MANY', 'الحد الأقصى 1000 جهاز لكل عملية');

  // Create job record
  const jobResult = await query(
    `INSERT INTO bulk_search_jobs (merchant_id, file_url, total_count, status)
     VALUES ($1, $2, $3, 'queued') RETURNING id`,
    [merchant.rows[0].id, `/uploads/bulk/${req.file.filename}`, imeiList.length]
  );
  const jobId = jobResult.rows[0].id;

  // Process in background (non-blocking)
  processBulkJob(jobId, imeiList, req.user.id).catch(console.error);

  created(res, {
    job_id:      jobId,
    total:       imeiList.length,
    status:      'queued',
    message_ar:  `تمت إضافة ${imeiList.length} جهاز للمعالجة. ستُخطر عند الانتهاء.`,
    check_url:   `/api/merchant/bulk-search/${jobId}`,
  });
});

// Background processor
async function processBulkJob(jobId, imeiList, userId) {
  await query("UPDATE bulk_search_jobs SET status='processing', started_at=NOW() WHERE id=$1", [jobId]);

  const results = [];
  for (const imei of imeiList) {
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
      await query(
        'INSERT INTO search_logs (user_id,imei,ip_address,result,source) VALUES ($1,$2,$3,$4,$5)',
        [userId, imei, '127.0.0.1', isReported ? rep.rows[0].report_type : 'clean', 'api']
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
    'SELECT * FROM bulk_search_jobs WHERE id=$1 AND merchant_id=$2',
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
  await query(
    'INSERT INTO search_logs (user_id,imei,ip_address,result,source) VALUES ($1,$2,$3,$4,$5)',
    [req.merchant.user_id, imei, req.ip || '0.0.0.0', isReported ? rep.rows[0].report_type : 'clean', 'api']
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
  const today = new Date(); today.setHours(0,0,0,0);
  const month = new Date(); month.setDate(1); month.setHours(0,0,0,0);

  const [d, m] = await Promise.all([
    query('SELECT COUNT(*) as cnt FROM search_logs WHERE user_id=$1 AND source=\'api\' AND created_at>=$2', [req.merchant.user_id, today]),
    query('SELECT COUNT(*) as cnt FROM search_logs WHERE user_id=$1 AND source=\'api\' AND created_at>=$2', [req.merchant.user_id, month]),
  ]);

  ok(res, {
    today:         parseInt(d.rows[0].cnt),
    this_month:    parseInt(m.rows[0].cnt),
    daily_limit:   req.merchant.daily_limit,
    monthly_limit: req.merchant.monthly_limit,
  });
});

export default router;
