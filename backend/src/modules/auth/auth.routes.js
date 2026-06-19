import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from '../../db/pool.js';
import { ok, err, created } from '../../utils/response.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../../services/email.service.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { auditLog } from '../../utils/audit.js';
import { z } from 'zod';

const router = Router();

// ─── Validation schemas ───────────────────────────────────────────
const RegisterSchema = z.object({
  email:        z.string().email(),
  password:     z.string().min(8).regex(/[a-zA-Z\u0600-\u06FF]/).regex(/[0-9]/),
  full_name:    z.string().min(2).max(100).optional(),
  phone:        z.string().optional(),
  country_code: z.string().length(2).optional(),
});

const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

function signTokens(user) {
  const payload = { id: user.id, role: user.role };
  const access  = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' });
  const refresh = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' });
  return { access, refresh };
}

// POST /auth/register
router.post('/register', async (req, res) => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) return err(res, 'VALIDATION_ERROR', 'بيانات غير صحيحة', parsed.error.message);

  const { email, password, full_name, phone, country_code } = parsed.data;

  const exists = await query('SELECT id FROM users WHERE email=$1', [email]);
  if (exists.rows.length) return err(res, 'EMAIL_EXISTS', 'البريد الإلكتروني مسجل بالفعل');

  const hash = await bcrypt.hash(password, 12);
  const result = await query(
    `INSERT INTO users (email, password_hash, full_name, phone, country_code)
     VALUES ($1,$2,$3,$4,$5) RETURNING id,email,full_name,role`,
    [email, hash, full_name || null, phone || null, country_code || 'EG']
  );
  const user = result.rows[0];

  // Send verification email
  const token  = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 86400000); // 24h
  await query(
    'INSERT INTO email_verifications (user_id, token, expires_at) VALUES ($1,$2,$3)',
    [user.id, token, expiry]
  );
  sendVerificationEmail(email, full_name, token).catch(console.error);

  await auditLog({ userId: user.id, action: 'user.registered', entityType: 'user', entityId: user.id, ip: req.ip });

  created(res, { message_ar: 'تم إنشاء الحساب. تحقق من بريدك الإلكتروني لتفعيل الحساب.', user: { id: user.id, email: user.email } });
});

// POST /auth/login
router.post('/login', async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) return err(res, 'VALIDATION_ERROR', 'بيانات غير صحيحة');

  const { email, password } = parsed.data;
  const result = await query('SELECT * FROM users WHERE email=$1 AND deleted_at IS NULL', [email]);
  if (!result.rows.length) return err(res, 'INVALID_CREDENTIALS', 'البريد الإلكتروني أو كلمة المرور غير صحيحة', '', 401);

  const user = result.rows[0];
  if (user.status === 'suspended') return err(res, 'ACCOUNT_SUSPENDED', 'حسابك موقوف، تواصل مع الدعم', '', 403);

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return err(res, 'INVALID_CREDENTIALS', 'البريد الإلكتروني أو كلمة المرور غير صحيحة', '', 401);

  await query('UPDATE users SET last_login_at=NOW() WHERE id=$1', [user.id]);
  await auditLog({ userId: user.id, action: 'user.login', entityType: 'user', entityId: user.id, ip: req.ip });

  const { access, refresh } = signTokens(user);
  ok(res, {
    access_token: access, refresh_token: refresh,
    user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role, email_verified: user.email_verified },
  });
});

// POST /auth/refresh
router.post('/refresh', async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) return err(res, 'MISSING_TOKEN', 'Refresh token مطلوب', '', 401);
  try {
    const decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);
    const result  = await query('SELECT id,email,role,status FROM users WHERE id=$1', [decoded.id]);
    if (!result.rows.length) return err(res, 'USER_NOT_FOUND', '', '', 401);
    const { access, refresh } = signTokens(result.rows[0]);
    ok(res, { access_token: access, refresh_token: refresh });
  } catch {
    err(res, 'INVALID_TOKEN', 'توكن غير صالح', '', 401);
  }
});

// GET /auth/verify-email/:token
router.get('/verify-email/:token', async (req, res) => {
  const { token } = req.params;
  const result = await query(
    `SELECT ev.*, u.email FROM email_verifications ev
     JOIN users u ON ev.user_id=u.id
     WHERE ev.token=$1 AND ev.used_at IS NULL AND ev.expires_at > NOW()`,
    [token]
  );
  if (!result.rows.length) return err(res, 'INVALID_TOKEN', 'رابط التفعيل غير صالح أو منتهي الصلاحية');

  const ev = result.rows[0];
  await query('UPDATE users SET email_verified=TRUE, status=\'active\' WHERE id=$1', [ev.user_id]);
  await query('UPDATE email_verifications SET used_at=NOW() WHERE id=$1', [ev.id]);

  ok(res, { message_ar: 'تم تفعيل حسابك بنجاح! يمكنك الآن تسجيل الدخول.' });
});

// POST /auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const result = await query('SELECT id,full_name FROM users WHERE email=$1', [email]);
  // Always return success to prevent email enumeration
  if (!result.rows.length) return ok(res, { message_ar: 'إذا كان البريد الإلكتروني مسجلاً سيصلك رابط إعادة التعيين.' });

  const user  = result.rows[0];
  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 3600000); // 1h
  await query('INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1,$2,$3)', [user.id, token, expiry]);
  sendPasswordResetEmail(email, user.full_name, token).catch(console.error);

  ok(res, { message_ar: 'إذا كان البريد الإلكتروني مسجلاً سيصلك رابط إعادة التعيين.' });
});

// POST /auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password || password.length < 8) return err(res, 'VALIDATION_ERROR', 'بيانات غير صحيحة');

  const result = await query(
    `SELECT * FROM password_resets WHERE token=$1 AND used_at IS NULL AND expires_at > NOW()`,
    [token]
  );
  if (!result.rows.length) return err(res, 'INVALID_TOKEN', 'رابط إعادة التعيين غير صالح أو منتهي الصلاحية');

  const pr   = result.rows[0];
  const hash = await bcrypt.hash(password, 12);
  await query('UPDATE users SET password_hash=$1, updated_at=NOW() WHERE id=$2', [hash, pr.user_id]);
  await query('UPDATE password_resets SET used_at=NOW() WHERE id=$1', [pr.id]);

  ok(res, { message_ar: 'تم إعادة تعيين كلمة المرور بنجاح.' });
});

// GET /auth/me
router.get('/me', authenticate, async (req, res) => {
  const result = await query(
    'SELECT id,email,full_name,phone,whatsapp,role,status,email_verified,country_code,preferred_lang,created_at FROM users WHERE id=$1',
    [req.user.id]
  );
  ok(res, result.rows[0]);
});

// PATCH /auth/me
router.patch('/me', authenticate, async (req, res) => {
  const { full_name, phone, whatsapp, country_code, preferred_lang } = req.body;
  await query(
    `UPDATE users SET full_name=COALESCE($1,full_name), phone=COALESCE($2,phone),
     whatsapp=COALESCE($3,whatsapp), country_code=COALESCE($4,country_code),
     preferred_lang=COALESCE($5,preferred_lang), updated_at=NOW() WHERE id=$6`,
    [full_name, phone, whatsapp, country_code, preferred_lang, req.user.id]
  );
  ok(res, { message_ar: 'تم تحديث البيانات بنجاح' });
});

// PATCH /auth/me/password
router.patch('/me/password', authenticate, async (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password || new_password.length < 8)
    return err(res, 'VALIDATION_ERROR', 'بيانات غير صحيحة');

  const result = await query('SELECT password_hash FROM users WHERE id=$1', [req.user.id]);
  const valid  = await bcrypt.compare(current_password, result.rows[0].password_hash);
  if (!valid) return err(res, 'WRONG_PASSWORD', 'كلمة المرور الحالية غير صحيحة');

  const hash = await bcrypt.hash(new_password, 12);
  await query('UPDATE users SET password_hash=$1, updated_at=NOW() WHERE id=$2', [hash, req.user.id]);
  ok(res, { message_ar: 'تم تغيير كلمة المرور بنجاح' });
});


// DELETE /auth/me — soft delete account
router.delete('/me', authenticate, async (req, res) => {
  await query(
    `UPDATE users SET deleted_at=NOW(), status='suspended', updated_at=NOW() WHERE id=$1`,
    [req.user.id]
  );
  await auditLog({ userId: req.user.id, action: 'user.deleted', entityType: 'user', entityId: req.user.id, ip: req.ip });
  ok(res, { message_ar: 'تم حذف حسابك بنجاح.' });
});

export default router;
