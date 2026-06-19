/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║                   REDIS CACHE SERVICE                       ║
 * ║                                                              ║
 * ║  Responsibilities:                                           ║
 * ║  1. IMEI search results      — TTL: 1 hour                  ║
 * ║  2. Rate limiting counters   — TTL: 24 hours                ║
 * ║  3. Plans list               — TTL: 24 hours                ║
 * ║  4. Admin dashboard stats    — TTL: 15 minutes              ║
 * ║  5. JWT refresh token store  — TTL: 30 days                 ║
 * ║                                                              ║
 * ║  Graceful degradation: if Redis is down, system continues   ║
 * ║  using PostgreSQL — no crashes.                              ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { createClient } from 'redis';

// ─── TTLs (seconds) ───────────────────────────────────────────────
export const TTL = {
  SEARCH_RESULT:    60 * 60,          // 1 hour
  RATE_LIMIT:       60 * 60 * 24,     // 24 hours
  PLANS:            60 * 60 * 24,     // 24 hours
  DASHBOARD_STATS:  60 * 15,          // 15 minutes
  REFRESH_TOKEN:    60 * 60 * 24 * 30,// 30 days
  DEVICE_INFO:      60 * 60 * 6,      // 6 hours
};

// ─── Key builders ─────────────────────────────────────────────────
export const KEY = {
  search:       (imei)   => `search:imei:${imei}`,
  rateIp:       (ip)     => `ratelimit:ip:${ip}`,
  rateUser:     (userId) => `ratelimit:user:${userId}`,
  plans:        ()       => `plans:all`,
  dashStats:    ()       => `stats:dashboard`,
  refreshToken: (tok)    => `refresh:${tok}`,
  deviceInfo:   (imei)   => `device:info:${imei}`,
};

// ─── Client singleton ─────────────────────────────────────────────
let client = null;
let connected = false;

export async function connectRedis() {
  if (connected) return client;

  const url = process.env.REDIS_URL || 'redis://localhost:6379';

  client = createClient({
    url,
    socket: {
      connectTimeout:    3000,
      reconnectStrategy: (attempts) => {
        if (attempts > 5) {
          console.warn('[Redis] Max reconnect attempts reached — running without cache');
          return false;
        }
        return Math.min(attempts * 200, 2000);
      },
    },
  });

  client.on('error',   (err) => { if (connected) console.warn('[Redis] Error:', err.message); });
  client.on('connect', ()    => console.log('✅ Redis connected'));
  client.on('end',     ()    => { connected = false; console.warn('[Redis] Disconnected'); });

  try {
    await client.connect();
    connected = true;
  } catch (err) {
    console.warn('[Redis] Could not connect:', err.message, '— continuing without cache');
    connected = false;
  }

  return client;
}

// ─── Safe get/set helpers (never throw) ──────────────────────────
export async function cacheGet(key) {
  if (!connected || !client) return null;
  try {
    const raw = await client.get(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('[Redis] GET error:', err.message);
    return null;
  }
}

export async function cacheSet(key, value, ttlSeconds = 300) {
  if (!connected || !client) return false;
  try {
    await client.setEx(key, ttlSeconds, JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn('[Redis] SET error:', err.message);
    return false;
  }
}

export async function cacheDel(key) {
  if (!connected || !client) return false;
  try {
    await client.del(key);
    return true;
  } catch (err) {
    console.warn('[Redis] DEL error:', err.message);
    return false;
  }
}

export async function cacheDelPattern(pattern) {
  if (!connected || !client) return 0;
  try {
    const keys = await client.keys(pattern);
    if (keys.length === 0) return 0;
    await client.del(keys);
    return keys.length;
  } catch (err) {
    console.warn('[Redis] DEL pattern error:', err.message);
    return 0;
  }
}

// ─── Rate limiting via Redis INCR (atomic) ───────────────────────
export async function rateLimitIncr(key, ttlSeconds = TTL.RATE_LIMIT) {
  if (!connected || !client) return null; // fallback to DB-based
  try {
    const count = await client.incr(key);
    if (count === 1) await client.expire(key, ttlSeconds); // set TTL only on first call
    const remaining = await client.ttl(key);
    return { count, ttl: remaining };
  } catch (err) {
    console.warn('[Redis] INCR error:', err.message);
    return null;
  }
}

export async function rateLimitGet(key) {
  if (!connected || !client) return null;
  try {
    const count = await client.get(key);
    return count ? parseInt(count) : 0;
  } catch {
    return null;
  }
}

// ─── Health check ─────────────────────────────────────────────────
export async function redisHealth() {
  if (!connected || !client) return { status: 'disconnected' };
  try {
    const start = Date.now();
    await client.ping();
    const info = await client.info('stats');
    const ops  = info.match(/total_commands_processed:(\d+)/)?.[1] || '0';
    return {
      status:       'connected',
      latency_ms:   Date.now() - start,
      total_ops:    parseInt(ops),
    };
  } catch (err) {
    return { status: 'error', message: err.message };
  }
}

export function isRedisConnected() { return connected; }

export default { connectRedis, cacheGet, cacheSet, cacheDel, cacheDelPattern, rateLimitIncr, rateLimitGet, redisHealth, KEY, TTL };
