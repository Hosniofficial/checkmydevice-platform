/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║           DEVICE LOOKUP SERVICE — ABSTRACTION LAYER         ║
 * ║                                                              ║
 * ║  3-Layer lookup strategy:                                    ║
 * ║  L1: Redis Cache  → <1ms   (warm cache)                     ║
 * ║  L2: PostgreSQL   → ~5ms   (device_cache table)             ║
 * ║  L3: External API → ~300ms (imeicheck / devicedecoder)      ║
 * ║       └─ saves result to L1+L2 for future hits              ║
 * ║                                                              ║
 * ║  Provider selection (IMEI_PROVIDER env var):                ║
 * ║    production  → imeicheck  (alpha.imeicheck.com)           ║
 * ║    development → mock       (no API key needed)             ║
 * ║    override    → set IMEI_PROVIDER explicitly               ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { query }      from '../db/pool.js';
import { cacheGet, cacheSet, KEY, TTL } from './redis.service.js';

import ImeiCheckProvider     from './providers/imeicheck.provider.js';
import DeviceDecoderProvider from './providers/devicedecoder.provider.js';
import MockProvider          from './providers/mock.provider.js';

// ─── Provider registry ────────────────────────────────────────────
const PROVIDERS = {
  imeicheck:     ImeiCheckProvider,
  devicedecoder: DeviceDecoderProvider,
  mock:          MockProvider,
};

function getProvider() {
  // Auto-select: production → imeicheck, development → mock
  const envProvider = process.env.IMEI_PROVIDER;
  const name = envProvider
    || (process.env.NODE_ENV === 'production' ? 'imeicheck' : 'mock');

  const Provider = PROVIDERS[name.toLowerCase()];
  if (!Provider) {
    throw new Error(`Unknown IMEI provider: "${name}". Valid: ${Object.keys(PROVIDERS).join(', ')}`);
  }
  return new Provider();
}

// ─── Normalise any provider response → unified shape ─────────────
function normalise(raw) {
  return {
    brand:      raw.brand      || raw.manufacturer || 'Unknown',
    // Prefer marketing name (Moto G22) over technical model code (XT2231-5)
    model:      raw.name       || raw.model        || raw.modelName || 'Unknown',
    model_code: raw.model      || null,   // e.g. XT2231-5
    device_type: raw.deviceType || raw.type        || 'phone',
    storage:    raw.storage    || raw.capacity     || null,
    color:      raw.color      || null,
    network:    raw.network    || raw.connectivity || null,
    released:   raw.released   || raw.releaseDate  || null,
  };
}

// ─── lookupDevice ─────────────────────────────────────────────────
/**
 * Full 3-layer lookup. Logs the API call only once per IMEI.
 * Returns: { found, source, data }
 *   source: 'redis_cache' | 'db_cache' | 'api' | 'api_error'
 */
export async function lookupDevice(imei) {
  // ── L1: Redis ────────────────────────────────────────────────
  const redisKey = KEY.deviceInfo(imei);
  const fromRedis = await cacheGet(redisKey);
  if (fromRedis) {
    return { found: true, source: 'redis_cache', data: fromRedis };
  }

  // ── L2: PostgreSQL device_cache ───────────────────────────────
  const { rows } = await query('SELECT * FROM device_cache WHERE imei=$1', [imei]);
  if (rows.length > 0) {
    const row  = rows[0];
    const data = {
      brand:      row.brand,
      model:      row.model,
      model_code: row.model_code,
      device_type: row.device_type,
      storage:    row.storage,
      color:      row.color,
      network:    row.network,
      released:   row.released,
    };
    // Warm Redis for next time
    await cacheSet(redisKey, data, TTL.DEVICE_INFO);
    return { found: true, source: 'db_cache', data };
  }

  // ── L3: External API ─────────────────────────────────────────
  try {
    const provider = getProvider();
    const raw      = await provider.lookup(imei);

    if (!raw) {
      return { found: false, source: 'api', data: null };
    }

    const data = normalise(raw);

    // Persist to PostgreSQL
    await query(
      `INSERT INTO device_cache
         (imei, brand, model, model_code, device_type, storage, color, network, released, raw_response, source)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (imei) DO UPDATE SET
         brand        = EXCLUDED.brand,
         model        = EXCLUDED.model,
         model_code   = EXCLUDED.model_code,
         device_type  = EXCLUDED.device_type,
         storage      = EXCLUDED.storage,
         raw_response = EXCLUDED.raw_response,
         updated_at   = NOW()`,
      [
        imei,
        data.brand, data.model, data.model_code, data.device_type,
        data.storage, data.color, data.network, data.released,
        JSON.stringify(raw),
        process.env.IMEI_PROVIDER || 'auto',
      ]
    );

    // Warm Redis
    await cacheSet(redisKey, data, TTL.DEVICE_INFO);

    const providerName = process.env.IMEI_PROVIDER || (process.env.NODE_ENV === 'production' ? 'imeicheck' : 'mock');
    console.info(`[DeviceLookup] API hit via ${providerName}: ${imei} → ${data.brand} ${data.model} (cached for next calls)`);

    return { found: true, source: 'api', data };

  } catch (err) {
    console.error('[DeviceLookup] Provider error:', err.message);
    return { found: false, source: 'api_error', data: null, error: err.message };
  }
}

// ─── validateIMEI ─────────────────────────────────────────────────
export function validateIMEI(imei) {
  if (!imei || !/^\d{14,16}$/.test(imei)) return false;
  const digits = imei.slice(0, 15).split('').map(Number);
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = digits[i];
    if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  return sum % 10 === 0;
}

// ─── getDeviceFromCache ───────────────────────────────────────────
/**
 * Used by the report form auto-fill endpoint.
 * Same 3-layer lookup but does NOT log a search event.
 */
export async function getDeviceFromCache(imei) {
  // Redis
  const redisKey = KEY.deviceInfo(imei);
  const fromRedis = await cacheGet(redisKey);
  if (fromRedis) return { found: true, source: 'redis_cache', data: fromRedis };

  // DB
  const { rows } = await query('SELECT * FROM device_cache WHERE imei=$1', [imei]);
  if (rows.length > 0) {
    const row  = rows[0];
    const data = { brand: row.brand, model: row.model, model_code: row.model_code,
                   device_type: row.device_type, storage: row.storage, color: row.color, network: row.network };
    await cacheSet(redisKey, data, TTL.DEVICE_INFO);
    return { found: true, source: 'db_cache', data };
  }

  // API (and cache it)
  return lookupDevice(imei);
}

// ─── getCacheStats ────────────────────────────────────────────────
export async function getCacheStats() {
  const { rows } = await query(`
    SELECT
      COUNT(*)                                                       AS total,
      COUNT(*) FILTER (WHERE source IN ('db_cache','cache'))        AS from_db_cache,
      COUNT(*) FILTER (WHERE source NOT IN ('db_cache','cache','auto')) AS from_api,
      COUNT(*) FILTER (WHERE created_at > NOW()-INTERVAL '7 days') AS last_7_days,
      COUNT(*) FILTER (WHERE brand = 'Unknown')                     AS unknown_devices
    FROM device_cache`);
  return rows[0];
}
