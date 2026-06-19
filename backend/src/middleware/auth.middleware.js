import jwt from 'jsonwebtoken';
import { query } from '../db/pool.js';

// ─── Verify JWT ───────────────────────────────────────────────────
export async function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message_ar: 'يجب تسجيل الدخول أولاً', message_en: 'Authentication required' } });
  }
  try {
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await query('SELECT id,email,role,status FROM users WHERE id=$1 AND deleted_at IS NULL', [decoded.id]);
    if (!result.rows.length) return res.status(401).json({ success: false, error: { code: 'USER_NOT_FOUND' } });
    const user = result.rows[0];
    if (user.status === 'suspended') return res.status(403).json({ success: false, error: { code: 'ACCOUNT_SUSPENDED', message_ar: 'حسابك موقوف' } });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ success: false, error: { code: 'INVALID_TOKEN', message_ar: 'جلسة منتهية، يرجى تسجيل الدخول مجدداً' } });
  }
}

// ─── Optional auth (for guest search) ────────────────────────────
export async function optionalAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return next();
  try {
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await query('SELECT id,email,role,status FROM users WHERE id=$1', [decoded.id]);
    if (result.rows.length) req.user = result.rows[0];
  } catch {}
  next();
}

// ─── Role guard ───────────────────────────────────────────────────
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message_ar: 'لا تمتلك صلاحية الوصول' } });
    }
    next();
  };
}

// ─── API Key auth (for merchant external API) ─────────────────────
export async function apiKeyAuth(req, res, next) {
  const key = req.headers['x-api-key'];
  if (!key) return res.status(401).json({ success: false, error: { code: 'API_KEY_REQUIRED' } });
  const result = await query(
    `SELECT m.*, u.id as user_id, u.email, u.status
     FROM merchants m JOIN users u ON m.user_id=u.id
     WHERE m.api_key=$1 AND m.is_active=TRUE`, [key]
  );
  if (!result.rows.length) return res.status(401).json({ success: false, error: { code: 'INVALID_API_KEY' } });
  req.merchant = result.rows[0];
  next();
}

// ─── Ownership guard ─────────────────────────────────────────────
export function requireOwnership(paramId = 'id', table = 'devices_reports') {
  return async (req, res, next) => {
    const id = req.params[paramId];
    const result = await query(`SELECT user_id FROM ${table} WHERE id=$1`, [id]);
    if (!result.rows.length) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    const isOwner = result.rows[0].user_id === req.user.id;
    const isAdmin = ['admin','super_admin'].includes(req.user.role);
    if (!isOwner && !isAdmin) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN' } });
    next();
  };
}
