import { Router } from 'express';
import { query } from '../../db/pool.js';
import { ok, err, getPagination, paginate } from '../../utils/response.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';
import { sendReportStatusEmail } from '../../services/email.service.js';
import { auditLog } from '../../utils/audit.js';
import { activateSubscription } from '../../services/subscription.service.js';
import { cacheGet, cacheSet, cacheDel, cacheDelPattern, KEY, TTL } from '../../services/redis.service.js';
import { lookupDevice } from '../../services/deviceLookup.service.js';

const router = Router();
const isAdmin = [authenticate, requireRole('admin','super_admin')];

// ─── Dashboard stats (Redis cached 15 min) ────────────────────────
router.get('/stats/dashboard', ...isAdmin, async (req, res) => {
  // Try cache first
  const cached = await cacheGet(KEY.dashStats());
  if (cached) return ok(res, { ...cached, _cache: true });

  const [reports, searches, users, deviceCache] = await Promise.all([
    query(`
      SELECT
        COUNT(*) FILTER (WHERE status='pending')      AS pending,
        COUNT(*) FILTER (WHERE status='under_review') AS under_review,
        COUNT(*) FILTER (WHERE status='approved')     AS approved,
        COUNT(*) FILTER (WHERE status='rejected')     AS rejected,
        COUNT(*) FILTER (WHERE created_at >= NOW()-INTERVAL '24h') AS today
      FROM devices_reports`),
    query(`
      SELECT COUNT(*) as total,
        COUNT(*) FILTER (WHERE created_at >= NOW()-INTERVAL '24h') AS today
      FROM search_logs`),
    query(`
      SELECT COUNT(*) as total,
        COUNT(*) FILTER (WHERE created_at >= NOW()-INTERVAL '24h') AS today,
        COUNT(*) FILTER (WHERE role='merchant') AS merchants
      FROM users WHERE deleted_at IS NULL`),
    query('SELECT COUNT(*) as total FROM device_cache'),
  ]);

  const data = {
    reports:      reports.rows[0],
    searches:     searches.rows[0],
    users:        users.rows[0],
    device_cache: deviceCache.rows[0],
  };

  // Cache for 15 minutes
  await cacheSet(KEY.dashStats(), data, TTL.DASHBOARD_STATS);

  ok(res, data);
});

// ─── List reports ─────────────────────────────────────────────────
router.get('/reports', ...isAdmin, async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const { status, country, device_type, q } = req.query;

  const conditions = ['1=1'];
  const params     = [];
  let   pi         = 1;

  if (status)       { conditions.push(`dr.status=$${pi++}`);             params.push(status); }
  if (country)      { conditions.push(`dr.country_code=$${pi++}`);       params.push(country); }
  if (device_type)  { conditions.push(`dr.device_type=$${pi++}`);        params.push(device_type); }
  if (q)            { conditions.push(`(dr.imei ILIKE $${pi} OR dr.brand ILIKE $${pi} OR dr.model ILIKE $${pi})`); params.push(`%${q}%`); pi++; }

  const where = conditions.join(' AND ');

  const [rows, count] = await Promise.all([
    query(
      `SELECT dr.id,dr.imei,dr.brand,dr.model,dr.device_type,dr.report_type,dr.status,
              dr.country_code,dr.created_at,dr.approved_at,u.email as owner_email,u.full_name as owner_name
       FROM devices_reports dr JOIN users u ON dr.user_id=u.id
       WHERE ${where} ORDER BY dr.created_at DESC LIMIT $${pi} OFFSET $${pi+1}`,
      [...params, limit, offset]
    ),
    query(`SELECT COUNT(*) as cnt FROM devices_reports dr WHERE ${where}`, params),
  ]);

  ok(res, paginate(rows.rows, count.rows[0].cnt, page, limit));
});

// ─── Get report detail ────────────────────────────────────────────
router.get('/reports/:id', ...isAdmin, async (req, res) => {
  const result = await query(
    `SELECT dr.*, u.email, u.full_name, u.phone,
            json_agg(json_build_object('id',rd.id,'doc_type',rd.doc_type,'file_url',rd.file_url,'created_at',rd.created_at))
              FILTER (WHERE rd.id IS NOT NULL) AS documents
     FROM devices_reports dr
     JOIN users u ON dr.user_id=u.id
     LEFT JOIN report_documents rd ON rd.report_id=dr.id
     WHERE dr.id=$1
     GROUP BY dr.id, u.email, u.full_name, u.phone`,
    [req.params.id]
  );
  if (!result.rows.length) return err(res, 'NOT_FOUND', '', '', 404);
  ok(res, result.rows[0]);
});

// ─── Delete report (Super Admin only) ────────────────────────────
router.delete('/reports/:id', authenticate, requireRole('super_admin'), async (req, res) => {
  const { reason } = req.body;

  const check = await query(
    `SELECT dr.*, u.email, u.full_name FROM devices_reports dr
     JOIN users u ON dr.user_id = u.id WHERE dr.id = $1`,
    [req.params.id]
  );
  if (!check.rows.length) return err(res, 'NOT_FOUND', 'البلاغ غير موجود', '', 404);
  const report = check.rows[0];

  // Delete documents files from disk then DB rows (cascade handles DB)
  await query('DELETE FROM report_documents WHERE report_id = $1', [req.params.id]);
  await query('DELETE FROM devices_reports WHERE id = $1', [req.params.id]);

  // Invalidate search cache for this IMEI
  if (report.imei) {
    await cacheDelPattern(`search:imei:${report.imei}*`);
  }
  await cacheDel(KEY.dashStats());

  await auditLog({
    userId: req.user.id, action: 'report.deleted', entityType: 'report',
    entityId: req.params.id,
    oldData: { imei: report.imei, brand: report.brand, model: report.model, status: report.status },
    newData: { reason: reason || 'حذف من قِبل المدير العام' },
    ip: req.ip,
  });

  ok(res, { message_ar: 'تم حذف البلاغ نهائياً.' });
});

// ─── Approve report ───────────────────────────────────────────────
router.patch('/reports/:id/approve', ...isAdmin, async (req, res) => {
  const { admin_note } = req.body;
  const check = await query('SELECT * FROM devices_reports WHERE id=$1', [req.params.id]);
  if (!check.rows.length) return err(res, 'NOT_FOUND', '', '', 404);
  if (check.rows[0].status === 'approved') return err(res, 'ALREADY_APPROVED', 'البلاغ مقبول بالفعل');

  await query(
    `UPDATE devices_reports SET status='approved', admin_id=$1, admin_note=$2,
     reviewed_at=NOW(), approved_at=NOW(), updated_at=NOW() WHERE id=$3`,
    [req.user.id, admin_note||null, req.params.id]
  );

  // Notify owner
  const owner = await query(
    `SELECT u.email, u.full_name FROM users u
     JOIN devices_reports dr ON dr.user_id=u.id WHERE dr.id=$1`,
    [req.params.id]
  );
  if (owner.rows.length) {
    sendReportStatusEmail(owner.rows[0].email, owner.rows[0].full_name, 'approved',
      `RPT-${req.params.id.slice(0,8).toUpperCase()}`, admin_note).catch(console.error);
  }

  await auditLog({ userId: req.user.id, action: 'report.approved', entityType: 'report', entityId: req.params.id,
    oldData: { status: check.rows[0].status }, newData: { status: 'approved', admin_note }, ip: req.ip });

  // Invalidate caches
  await cacheDel(KEY.dashStats());
  await cacheDelPattern('search:imei:*');
  ok(res, { message_ar: 'تم قبول البلاغ وإضافة الجهاز للقاعدة.' });
});

// ─── Reject report ────────────────────────────────────────────────
router.patch('/reports/:id/reject', ...isAdmin, async (req, res) => {
  const { admin_note } = req.body;
  if (!admin_note) return err(res, 'NOTE_REQUIRED', 'يجب ذكر سبب الرفض');

  const check = await query('SELECT * FROM devices_reports WHERE id=$1', [req.params.id]);
  if (!check.rows.length) return err(res, 'NOT_FOUND', '', '', 404);

  await query(
    `UPDATE devices_reports SET status='rejected', admin_id=$1, admin_note=$2,
     reviewed_at=NOW(), updated_at=NOW() WHERE id=$3`,
    [req.user.id, admin_note, req.params.id]
  );

  const owner = await query(
    `SELECT u.email, u.full_name FROM users u
     JOIN devices_reports dr ON dr.user_id=u.id WHERE dr.id=$1`,
    [req.params.id]
  );
  if (owner.rows.length) {
    sendReportStatusEmail(owner.rows[0].email, owner.rows[0].full_name, 'rejected',
      `RPT-${req.params.id.slice(0,8).toUpperCase()}`, admin_note).catch(console.error);
  }

  await auditLog({ userId: req.user.id, action: 'report.rejected', entityType: 'report', entityId: req.params.id,
    oldData: { status: check.rows[0].status }, newData: { status: 'rejected', admin_note }, ip: req.ip });

  await cacheDel(KEY.dashStats());
  ok(res, { message_ar: 'تم رفض البلاغ.' });
});

// ─── List users ───────────────────────────────────────────────────
router.get('/users', ...isAdmin, async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const { role, status, q } = req.query;

  const conditions = ['u.deleted_at IS NULL'];
  const params     = [];
  let pi = 1;

  if (role)   { conditions.push(`u.role=$${pi++}`);   params.push(role); }
  if (status) { conditions.push(`u.status=$${pi++}`); params.push(status); }
  if (q)      { conditions.push(`(u.email ILIKE $${pi} OR u.full_name ILIKE $${pi})`); params.push(`%${q}%`); pi++; }

  const where = conditions.join(' AND ');
  const [rows, count] = await Promise.all([
    query(`SELECT u.id, u.email, u.full_name, u.role, u.status,
                  COALESCE(u.country_code, lr.country_code) AS country_code,
                  u.created_at, u.last_login_at,
                  sub.plan_name_ar, sub.plan_type, sub.expires_at AS subscription_expires_at
           FROM users u
           LEFT JOIN LATERAL (
             SELECT country_code FROM devices_reports
             WHERE user_id = u.id AND country_code IS NOT NULL
             ORDER BY created_at DESC LIMIT 1
           ) lr ON true
           LEFT JOIN LATERAL (
             SELECT p.name_ar AS plan_name_ar, p.plan_type, s.expires_at
             FROM subscriptions s
             JOIN plans p ON s.plan_id = p.id
             WHERE s.user_id = u.id
               AND s.status IN ('active', 'trial')
               AND s.expires_at > NOW()
             ORDER BY s.created_at DESC LIMIT 1
           ) sub ON true
           WHERE ${where}
           ORDER BY u.created_at DESC LIMIT $${pi} OFFSET $${pi + 1}`,
      [...params, limit, offset]),
    query(`SELECT COUNT(*) as cnt FROM users u WHERE ${where}`, params),
  ]);
  ok(res, paginate(rows.rows, count.rows[0].cnt, page, limit));
});

const ROLE_LABELS = { user: 'مستخدم', merchant: 'تاجر', admin: 'مشرف' };

// ─── Change user role (Super Admin only) ──────────────────────────
router.patch('/users/:id/role', authenticate, requireRole('super_admin'), async (req, res) => {
  const { role } = req.body;
  const allowed  = ['user', 'merchant', 'admin'];
  if (!allowed.includes(role)) return err(res, 'VALIDATION_ERROR', 'دور غير صالح');

  if (req.params.id === req.user.id) {
    return err(res, 'FORBIDDEN', 'لا يمكنك تغيير دورك الخاص');
  }

  const target = await query('SELECT role FROM users WHERE id=$1 AND deleted_at IS NULL', [req.params.id]);
  if (!target.rows.length) return err(res, 'NOT_FOUND', 'المستخدم غير موجود', '', 404);
  if (target.rows[0].role === 'super_admin') {
    return err(res, 'FORBIDDEN', 'لا يمكن تغيير دور المدير العام');
  }

  await query('UPDATE users SET role=$1, updated_at=NOW() WHERE id=$2', [role, req.params.id]);

  await auditLog({
    userId: req.user.id, action: 'user.role_changed', entityType: 'user', entityId: req.params.id,
    oldData: { role: target.rows[0].role }, newData: { role }, ip: req.ip,
  });

  ok(res, { role, message_ar: `تم تعيين الدور: ${ROLE_LABELS[role]}` });
});

// ─── Activate subscription (Admin) ────────────────────────────────
router.post('/users/:id/subscription', ...isAdmin, async (req, res) => {
  const { plan_type, months = 1 } = req.body;
  if (!plan_type) return err(res, 'VALIDATION_ERROR', 'اختر الخطة');

  const duration = parseInt(months, 10);
  if (!duration || duration < 1 || duration > 24) {
    return err(res, 'VALIDATION_ERROR', 'مدة الاشتراك غير صالحة (1–24 شهر)');
  }

  try {
    const { plan, expires_at } = await activateSubscription(
      req.params.id, plan_type, duration, req.user.id
    );

    await auditLog({
      userId: req.user.id, action: 'subscription.activated', entityType: 'user',
      entityId: req.params.id,
      newData: { plan_type, months: duration, expires_at }, ip: req.ip,
    });

    ok(res, {
      message_ar: `تم تفعيل اشتراك «${plan.name_ar}» حتى ${expires_at.toLocaleDateString('ar-EG')}`,
      expires_at,
      plan_type: plan.plan_type,
    });
  } catch (e) {
    if (e.code === 'PLAN_NOT_FOUND') return err(res, 'PLAN_NOT_FOUND', e.message_ar);
    if (e.code === 'NOT_FOUND') return err(res, 'NOT_FOUND', e.message_ar, '', 404);
    throw e;
  }
});

// ─── GET /admin/search/:imei — Admin full device lookup ───────────
router.get('/search/:imei', ...isAdmin, async (req, res) => {
  const { imei } = req.params;
  if (!/^\d{14,16}$/.test(imei)) {
    return err(res, 'INVALID_IMEI', 'رقم IMEI غير صحيح');
  }

  // All reports (not just approved) — admin sees everything
  const [allReports, deviceCache] = await Promise.all([
    query(
      `SELECT dr.id, dr.brand, dr.model, dr.device_type, dr.color, dr.report_type,
              dr.status, dr.country_code, dr.city, dr.incident_date, dr.created_at,
              dr.approved_at, dr.contact_whatsapp, dr.contact_email, dr.contact_phone,
              dr.reward_offered, dr.reward_amount, dr.reward_currency,
              u.email AS owner_email, u.full_name AS owner_name
       FROM devices_reports dr
       JOIN users u ON dr.user_id = u.id
       WHERE dr.imei = $1
       ORDER BY dr.created_at DESC`,
      [imei]
    ),
    query('SELECT * FROM device_cache WHERE imei=$1', [imei]),
  ]);

  // Device lookup (Redis → DB → API)
  const lookup = await lookupDevice(imei);

  ok(res, {
    imei,
    reports:       allReports.rows,
    device_info:   lookup.found ? lookup.data : null,
    lookup_source: lookup.source,
    db_cache:      deviceCache.rows[0] || null,
  });
});

// GET /admin/plans — for admin UI
router.get('/plans', ...isAdmin, async (req, res) => {
  const { rows } = await query(
    `SELECT id, name_ar, plan_type, price_monthly, price_yearly, currency, daily_search_limit
     FROM plans WHERE is_active = TRUE ORDER BY price_monthly ASC`
  );
  ok(res, rows);
});

// ─── Suspend user ─────────────────────────────────────────────────
router.patch('/users/:id/suspend', ...isAdmin, async (req, res) => {
  const { reason } = req.body;
  const old = await query('SELECT status FROM users WHERE id=$1', [req.params.id]);
  if (!old.rows.length) return err(res, 'NOT_FOUND', '', '', 404);

  const newStatus = old.rows[0].status === 'suspended' ? 'active' : 'suspended';
  await query('UPDATE users SET status=$1, updated_at=NOW() WHERE id=$2', [newStatus, req.params.id]);

  await auditLog({ userId: req.user.id, action: `user.${newStatus}`, entityType: 'user', entityId: req.params.id,
    newData: { status: newStatus, reason }, ip: req.ip });

  ok(res, { status: newStatus, message_ar: newStatus === 'suspended' ? 'تم تعليق الحساب.' : 'تم تفعيل الحساب.' });
});

// ─── Audit logs (Super Admin only) ───────────────────────────────
router.get('/audit-logs', authenticate, requireRole('super_admin'), async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const { action, entity_type } = req.query;

  const conditions = ['1=1'];
  const params     = [];
  let pi = 1;
  if (action)      { conditions.push(`al.action ILIKE $${pi++}`);      params.push(`%${action}%`); }
  if (entity_type) { conditions.push(`al.entity_type=$${pi++}`);       params.push(entity_type); }

  const where = conditions.join(' AND ');
  const [rows, count] = await Promise.all([
    query(`SELECT al.*, u.email as user_email FROM audit_logs al
           LEFT JOIN users u ON al.user_id=u.id
           WHERE ${where} ORDER BY al.created_at DESC LIMIT $${pi} OFFSET $${pi+1}`,
      [...params, limit, offset]),
    query(`SELECT COUNT(*) as cnt FROM audit_logs al WHERE ${where}`, params),
  ]);
  ok(res, paginate(rows.rows, count.rows[0].cnt, page, limit));
});

// ─── Device cache stats ───────────────────────────────────────────
router.get('/device-cache/stats', ...isAdmin, async (req, res) => {
  const result = await query(`
    SELECT COUNT(*) as total,
      COUNT(*) FILTER (WHERE source='cache') as from_cache,
      COUNT(*) FILTER (WHERE source!='cache') as from_api,
      COUNT(*) FILTER (WHERE created_at >= NOW()-INTERVAL '7 days') as last_7_days
    FROM device_cache`);
  ok(res, result.rows[0]);
});

export default router;
