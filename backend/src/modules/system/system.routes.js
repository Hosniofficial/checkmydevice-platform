import { Router } from 'express';
import { redisHealth, isRedisConnected } from '../../services/redis.service.js';
import { query } from '../../db/pool.js';
import { getCacheStats } from '../../services/deviceLookup.service.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';
import nodemailer from 'nodemailer';

const router = Router();

// GET /api/system/status — public basic
router.get('/status', async (req, res) => {
  const start = Date.now();

  // DB ping
  let dbStatus = 'ok';
  try { await query('SELECT 1'); } catch { dbStatus = 'error'; }

  // Redis ping
  const redis = await redisHealth();

  res.json({
    success: true,
    data: {
      api:          'ok',
      database:     dbStatus,
      redis:        redis.status,
      redis_latency_ms: redis.latency_ms,
      response_ms:  Date.now() - start,
      version:      process.env.npm_package_version || '1.0.0',
      environment:  process.env.NODE_ENV || 'development',
      timestamp:    new Date().toISOString(),
    },
  });
});

// GET /api/system/detailed — admin only
router.get('/detailed', authenticate, requireRole('admin', 'super_admin'), async (req, res) => {
  const [redis, cacheStats, dbInfo] = await Promise.all([
    redisHealth(),
    getCacheStats(),
    query(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL) as total_users,
        (SELECT COUNT(*) FROM devices_reports) as total_reports,
        (SELECT COUNT(*) FROM devices_reports WHERE status='approved') as approved_reports,
        (SELECT COUNT(*) FROM search_logs WHERE created_at >= NOW()-INTERVAL '24h') as searches_today,
        (SELECT COUNT(*) FROM device_cache) as cached_devices,
        pg_database_size(current_database()) as db_size_bytes
    `),
  ]);

  const db = dbInfo.rows[0];

  res.json({
    success: true,
    data: {
      services: {
        api:      { status: 'ok' },
        database: {
          status:       'ok',
          size_mb:      Math.round(parseInt(db.db_size_bytes) / 1024 / 1024),
          total_users:  parseInt(db.total_users),
          total_reports: parseInt(db.total_reports),
          approved_reports: parseInt(db.approved_reports),
        },
        redis: {
          ...redis,
          connected: isRedisConnected(),
        },
      },
      performance: {
        searches_today:  parseInt(db.searches_today),
        cached_devices:  parseInt(db.cached_devices),
        api_calls_saved: parseInt(cacheStats?.total || 0),
      },
      timestamp: new Date().toISOString(),
    },
  });
});

// GET /api/system/email-test — super admin only
router.get('/email-test', authenticate, requireRole('super_admin'), async (req, res) => {
  const cfg = {
    host:   process.env.SMTP_HOST,
    port:   parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };

  // Check config exists
  if (!cfg.auth.user || !cfg.auth.pass) {
    return res.json({ success: false, error: 'SMTP_USER أو SMTP_PASS غير محددين في environment variables' });
  }

  try {
    const t = nodemailer.createTransport(cfg);
    // Verify connection
    await t.verify();

    // Send test email to the admin
    await t.sendMail({
      from:    process.env.EMAIL_FROM || cfg.auth.user,
      to:      req.user.email || cfg.auth.user,
      subject: '✅ اختبار SMTP — CheckMyDevice',
      html:    `<div dir="rtl"><h2 style="color:#1B4F9B">الإيميل يعمل بشكل صحيح ✅</h2><p>تم الإرسال من: ${cfg.auth.user}</p><p>الوقت: ${new Date().toLocaleString('ar-EG')}</p></div>`,
    });

    res.json({
      success: true,
      message: `تم إرسال إيميل تجريبي إلى ${req.user.email}`,
      smtp_user: cfg.auth.user,
      smtp_host: cfg.host,
      smtp_port: cfg.port,
    });
  } catch (err) {
    res.json({
      success: false,
      error:   err.message,
      smtp_user: cfg.auth.user,
      smtp_host: cfg.host,
      smtp_port: cfg.port,
      hint: err.message.includes('535') ? 'كلمة المرور غلط — تأكد من استخدام App Password مش كلمة مرور Gmail العادية'
          : err.message.includes('534') ? 'Gmail يطلب App Password — فعّل 2FA ثم أنشئ App Password'
          : err.message.includes('ECONNREFUSED') ? 'تعذر الاتصال بـ SMTP — تحقق من SMTP_HOST و SMTP_PORT'
          : 'تحقق من إعدادات SMTP',
    });
  }
});

export default router;
