import crypto from 'crypto';
import { query } from '../db/pool.js';

export async function getActiveSubscription(userId) {
  const { rows } = await query(
    `SELECT s.*, p.name_ar, p.name_en, p.plan_type, p.daily_search_limit,
            p.monthly_search_limit, p.api_access, p.bulk_search_enabled
     FROM subscriptions s
     JOIN plans p ON s.plan_id = p.id
     WHERE s.user_id = $1
       AND s.status IN ('active', 'trial')
       AND s.expires_at > NOW()
     ORDER BY s.created_at DESC
     LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
}

export async function getUserSearchLimit(user) {
  if (!user) return 5;
  if (['admin', 'super_admin'].includes(user.role)) return 99999;

  // Check active subscription first — applies to both users and merchants
  const sub = await getActiveSubscription(user.id);
  if (sub) return sub.daily_search_limit;

  // No active subscription — fallback by role
  if (user.role === 'merchant') return 9999;  // merchant without subscription

  // Regular user — fallback to free plan limit from DB
  const { rows } = await query(
    `SELECT daily_search_limit FROM plans WHERE plan_type = 'free' AND is_active = TRUE LIMIT 1`
  );
  return rows[0]?.daily_search_limit ?? 5;
}

async function ensureMerchantAccount(userId, businessName) {
  const existing = await query('SELECT id FROM merchants WHERE user_id = $1', [userId]);
  if (existing.rows.length) return;

  const apiKey = `cmd_${crypto.randomBytes(24).toString('hex')}`;
  await query(
    `INSERT INTO merchants (user_id, business_name, api_key, is_active)
     VALUES ($1, $2, $3, TRUE)`,
    [userId, businessName || 'CheckMyDevice Merchant', apiKey]
  );
}

export async function activateSubscription(userId, planType, months = 1, adminId = null) {
  const planResult = await query(
    `SELECT * FROM plans WHERE plan_type = $1 AND is_active = TRUE LIMIT 1`,
    [planType]
  );
  if (!planResult.rows.length) {
    throw Object.assign(new Error('PLAN_NOT_FOUND'), { code: 'PLAN_NOT_FOUND', message_ar: 'الخطة غير موجودة' });
  }
  const plan = planResult.rows[0];

  const userResult = await query(
    'SELECT id, email, full_name, role FROM users WHERE id = $1 AND deleted_at IS NULL',
    [userId]
  );
  if (!userResult.rows.length) {
    throw Object.assign(new Error('NOT_FOUND'), { code: 'NOT_FOUND', message_ar: 'المستخدم غير موجود' });
  }
  const user = userResult.rows[0];

  await query(
    `UPDATE subscriptions SET status = 'cancelled'
     WHERE user_id = $1 AND status IN ('active', 'trial') AND expires_at > NOW()`,
    [userId]
  );

  const startsAt = new Date();
  const expiresAt = new Date(startsAt);
  expiresAt.setMonth(expiresAt.getMonth() + months);

  const fullYears = Math.floor(months / 12);
  const remMonths = months % 12;
  const price = (fullYears * Number(plan.price_yearly)) + (remMonths * Number(plan.price_monthly));
  const { rows } = await query(
    `INSERT INTO subscriptions
       (user_id, plan_id, status, starts_at, expires_at, auto_renew, payment_ref, amount_paid, currency)
     VALUES ($1, $2, 'active', $3, $4, FALSE, $5, $6, $7)
     RETURNING *`,
    [
      userId,
      plan.id,
      startsAt,
      expiresAt,
      adminId ? `admin:${adminId}` : 'manual',
      price,
      plan.currency,
    ]
  );

  if (plan.api_access && user.role === 'user') {
    await query(`UPDATE users SET role = 'merchant', updated_at = NOW() WHERE id = $1`, [userId]);
    await ensureMerchantAccount(userId, user.full_name || user.email);
  }

  return { subscription: rows[0], plan, expires_at: expiresAt };
}
