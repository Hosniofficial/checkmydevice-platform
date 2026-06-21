/**
 * Rate Limiting Middleware
 * Strategy: Redis first (atomic INCR) → fallback to PostgreSQL if Redis is down
 * Reset: midnight (start of next day) — not rolling 24h window
 */

import { query } from '../db/pool.js';
import { rateLimitIncr, KEY, TTL, isRedisConnected } from '../services/redis.service.js';
import { getUserSearchLimit } from '../services/subscription.service.js';

// Returns seconds until midnight (local server time = UTC on Railway)
function secondsUntilMidnight() {
  const now       = new Date();
  const midnight  = new Date(now);
  midnight.setUTCHours(24, 0, 0, 0); // next UTC midnight
  return Math.floor((midnight - now) / 1000);
}

// ─── Redis-based rate limit (fast, atomic) ────────────────────────
async function redisRateLimit(key, limit) {
  const ttl    = secondsUntilMidnight();
  const result = await rateLimitIncr(key, ttl);
  if (!result) return null; // Redis down → fallback
  return { used: result.count, remaining: Math.max(0, limit - result.count), exceeded: result.count > limit };
}

// ─── DB-based rate limit (fallback) ───────────────────────────────
async function dbRateLimit(userId, ip, limit) {
  const today = new Date(); today.setUTCHours(0, 0, 0, 0);
  if (userId) {
    const { rows } = await query(
      'SELECT COUNT(*) as cnt FROM search_logs WHERE user_id=$1 AND created_at>=$2',
      [userId, today]
    );
    const used = parseInt(rows[0].cnt);
    return { used, remaining: Math.max(0, limit - used), exceeded: used >= limit };
  } else {
    const { rows } = await query(
      'SELECT COUNT(*) as cnt FROM search_logs WHERE ip_address=$1 AND user_id IS NULL AND created_at>=$2',
      [ip, today]
    );
    const used = parseInt(rows[0].cnt);
    return { used, remaining: Math.max(0, limit - used), exceeded: used >= limit };
  }
}

// ─── Main middleware ──────────────────────────────────────────────
export async function searchRateLimit(req, res, next) {
  const user  = req.user;
  const ip    = (req.headers['x-forwarded-for'] || req.ip || '').split(',')[0].trim();
  const limit = await getUserSearchLimit(user);

  let result;

  if (isRedisConnected()) {
    // ── Fast path: Redis ─────────────────────────────────────────
    const cacheKey = user ? KEY.rateUser(user.id) : KEY.rateIp(ip);
    result = await redisRateLimit(cacheKey, limit);
  }

  if (!result) {
    // ── Fallback: PostgreSQL ──────────────────────────────────────
    result = await dbRateLimit(user?.id, ip, limit);
  }

  if (result.exceeded) {
    return res.status(429).json({
      success: false,
      error: {
        code: user ? 'RATE_LIMIT_EXCEEDED' : 'GUEST_RATE_LIMIT',
        message_ar: user
          ? `تجاوزت حد البحث اليومي (${limit} عملية). يتجدد الحد عند منتصف الليل.`
          : `استنفدت حد البحث المجاني (${limit} يومياً). سجّل حساباً مجانياً للحصول على مزيد من عمليات البحث.`,
        limit,
        remaining:   0,
        register_url: '/register',
      },
    });
  }

  req.searchLimit = { limit, used: result.used, remaining: result.remaining };
  next();
}
