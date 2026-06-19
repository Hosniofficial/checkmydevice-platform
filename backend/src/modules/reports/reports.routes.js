import { Router }   from 'express';
import multer        from 'multer';
import path          from 'path';
import fs            from 'fs';
import { query }     from '../../db/pool.js';
import { ok, err, created, getPagination, paginate } from '../../utils/response.js';
import { authenticate }   from '../../middleware/auth.middleware.js';
import { auditLog }       from '../../utils/audit.js';
import { getDeviceFromCache } from '../../services/deviceLookup.service.js';

const router = Router();

// ── File upload config ────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/reports';
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  },
});

// ── GET /reports/device-info/:imei — IMEI auto-fill (no quota consumed) ──
router.get('/device-info/:imei', authenticate, async (req, res) => {
  const { imei } = req.params;
  if (!imei || !/^\d{14,16}$/.test(imei))
    return err(res, 'INVALID_IMEI', 'رقم IMEI غير صحيح');

  const result = await getDeviceFromCache(imei);

  if (!result.found) {
    return ok(res, {
      found:      false,
      source:     result.source,
      message_ar: 'لم يتم التعرف على هذا الجهاز — يمكنك ملء البيانات يدوياً',
    });
  }

  ok(res, {
    found:  true,
    source: result.source,
    data: {
      brand:       result.data.brand,
      model:       result.data.model,
      model_code:  result.data.model_code,
      device_type: result.data.device_type,
      storage:     result.data.storage,
      color:       result.data.color,
      network:     result.data.network,
    },
    message_ar: `تم التعرف على الجهاز: ${result.data.brand} ${result.data.model}`,
  });
});

// ── GET /reports — my reports ─────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const [rows, count] = await Promise.all([
    query(
      `SELECT id,imei,brand,model,device_type,report_type,status,country_code,created_at,approved_at
       FROM devices_reports WHERE user_id=$1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    ),
    query('SELECT COUNT(*) as cnt FROM devices_reports WHERE user_id=$1', [req.user.id]),
  ]);
  ok(res, paginate(rows.rows, count.rows[0].cnt, page, limit));
});

// ── GET /reports/:id ──────────────────────────────────────────────
router.get('/:id', authenticate, async (req, res) => {
  const result = await query(
    `SELECT dr.*, u.full_name as owner_name,
            json_agg(json_build_object('id',rd.id,'doc_type',rd.doc_type,'file_url',rd.file_url))
              FILTER (WHERE rd.id IS NOT NULL) AS documents
     FROM devices_reports dr
     JOIN users u ON dr.user_id=u.id
     LEFT JOIN report_documents rd ON rd.report_id=dr.id
     WHERE dr.id=$1 GROUP BY dr.id, u.full_name`,
    [req.params.id]
  );
  if (!result.rows.length) return err(res, 'NOT_FOUND', 'البلاغ غير موجود', '', 404);
  const report  = result.rows[0];
  const isOwner = report.user_id === req.user.id;
  const isAdmin = ['admin','super_admin'].includes(req.user.role);
  if (!isOwner && !isAdmin) return err(res, 'FORBIDDEN', '', '', 403);
  ok(res, report);
});

// ── POST /reports — create report ─────────────────────────────────
router.post('/', authenticate, upload.array('documents', 5), async (req, res) => {
  const {
    imei, imei2, serial_number, device_type, brand, model, color, storage: storageVal,
    report_type, country_code, city, incident_date, description,
    contact_phone, contact_whatsapp, contact_email,
    reward_offered, reward_amount, reward_currency,
  } = req.body;

  if (!brand || !model || !device_type || !report_type || !country_code)
    return err(res, 'MISSING_FIELDS', 'يرجى ملء جميع الحقول الإلزامية');
  if (!imei && !serial_number)
    return err(res, 'MISSING_IMEI', 'يجب إدخال رقم IMEI أو الرقم التسلسلي');

  // Check no active report for same IMEI
  if (imei) {
    const existing = await query(
      `SELECT id FROM devices_reports WHERE imei=$1 AND status NOT IN ('rejected','cancelled')`,
      [imei]
    );
    if (existing.rows.length)
      return err(res, 'IMEI_ALREADY_REPORTED', 'يوجد بلاغ نشط لهذا الجهاز بالفعل');
  }

  const result = await query(
    `INSERT INTO devices_reports
       (user_id,imei,imei2,serial_number,device_type,brand,model,color,storage,
        report_type,country_code,city,incident_date,description,
        contact_phone,contact_whatsapp,contact_email,
        reward_offered,reward_amount,reward_currency)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
     RETURNING id,status,created_at`,
    [
      req.user.id, imei||null, imei2||null, serial_number||null,
      device_type, brand, model, color||null, storageVal||null,
      report_type, country_code, city||null, incident_date||null,
      description||null, contact_phone||null, contact_whatsapp||null,
      contact_email||null, reward_offered==='true', reward_amount||null, reward_currency||null,
    ]
  );
  const report = result.rows[0];

  // Save uploaded documents
  if (req.files?.length) {
    for (const file of req.files) {
      await query(
        'INSERT INTO report_documents (report_id,doc_type,file_url,file_size,mime_type) VALUES ($1,$2,$3,$4,$5)',
        [report.id, 'box_image', `/uploads/reports/${file.filename}`, file.size, file.mimetype]
      );
    }
  }

  await auditLog({ userId: req.user.id, action: 'report.created', entityType: 'report', entityId: report.id, ip: req.ip });

  created(res, {
    id:         report.id,
    status:     report.status,
    message_ar: 'تم استلام بلاغك وسيتم مراجعته خلال 24-48 ساعة.',
    reference:  `RPT-${report.id.slice(0,8).toUpperCase()}`,
  });
});

// ── PATCH /reports/:id/cancel ─────────────────────────────────────
router.patch('/:id/cancel', authenticate, async (req, res) => {
  const result = await query('SELECT * FROM devices_reports WHERE id=$1', [req.params.id]);
  if (!result.rows.length) return err(res, 'NOT_FOUND', 'البلاغ غير موجود', '', 404);
  const report  = result.rows[0];
  const isOwner = report.user_id === req.user.id;
  const isAdmin = ['admin','super_admin'].includes(req.user.role);
  if (!isOwner && !isAdmin) return err(res, 'FORBIDDEN', '', '', 403);
  if (['cancelled','rejected'].includes(report.status))
    return err(res, 'ALREADY_CLOSED', 'البلاغ مغلق بالفعل');

  await query(
    `UPDATE devices_reports SET status='cancelled', cancelled_at=NOW(),
     cancel_reason=$1, updated_at=NOW() WHERE id=$2`,
    [req.body.reason || 'بطلب المستخدم', req.params.id]
  );
  await auditLog({ userId: req.user.id, action: 'report.cancelled', entityType: 'report', entityId: report.id, ip: req.ip });
  ok(res, { message_ar: 'تم إلغاء البلاغ بنجاح.' });
});

// ── POST /reports/:id/documents ───────────────────────────────────
router.post('/:id/documents', authenticate, upload.array('documents', 5), async (req, res) => {
  const result = await query('SELECT user_id FROM devices_reports WHERE id=$1', [req.params.id]);
  if (!result.rows.length) return err(res, 'NOT_FOUND', '', '', 404);
  if (result.rows[0].user_id !== req.user.id) return err(res, 'FORBIDDEN', '', '', 403);

  const docs = [];
  for (const file of (req.files || [])) {
    const r = await query(
      'INSERT INTO report_documents (report_id,doc_type,file_url,file_size,mime_type) VALUES ($1,$2,$3,$4,$5) RETURNING id',
      [req.params.id, req.body.doc_type||'other', `/uploads/reports/${file.filename}`, file.size, file.mimetype]
    );
    docs.push(r.rows[0]);
  }
  ok(res, { uploaded: docs.length, documents: docs });
});

export default router;
