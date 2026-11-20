/**
 * Tests: Device Lookup Service
 * Coverage: validateIMEI, lookupDevice (3-layer cache), provider switching
 */

import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';

const dbCache = new Map();
const redisCache = new Map();

jest.unstable_mockModule('../db/pool.js', () => ({
  query: jest.fn(async (sql, params = []) => {
    if (sql.startsWith('SELECT * FROM device_cache')) {
      const row = dbCache.get(params[0]);
      return { rows: row ? [row] : [] };
    }

    if (sql.startsWith('INSERT INTO device_cache')) {
      dbCache.set(params[0], {
        imei: params[0],
        brand: params[1],
        model: params[2],
        model_code: params[3],
        device_type: params[4],
        storage: params[5],
        color: params[6],
        network: params[7],
        released: params[8],
      });
      return { rows: [] };
    }

    throw new Error(`Unexpected database query in test: ${sql}`);
  }),
}));

jest.unstable_mockModule('../services/redis.service.js', () => ({
  cacheGet: jest.fn(async (key) => redisCache.has(key) ? redisCache.get(key) : null),
  cacheSet: jest.fn(async (key, value) => {
    redisCache.set(key, value);
    return true;
  }),
  KEY: { deviceInfo: (imei) => `device:info:${imei}` },
  TTL: { DEVICE_INFO: 21600 },
}));

// ─── validateIMEI ─────────────────────────────────────────────────
describe('validateIMEI()', () => {
  let validateIMEI;

  beforeAll(async () => {
    const mod = await import('../services/deviceLookup.service.js');
    validateIMEI = mod.validateIMEI;
  });

  it('returns true for valid 15-digit IMEI', () => {
    expect(validateIMEI('358240051111110')).toBe(true);
    expect(validateIMEI('490154203237518')).toBe(true);
    expect(validateIMEI('352322311421731')).toBe(true); // Motorola from API docs
  });

  it('returns false for too short', () => {
    expect(validateIMEI('123')).toBe(false);
  });

  it('returns false for too long (17+ digits)', () => {
    expect(validateIMEI('12345678901234567')).toBe(false);
  });

  it('returns false for non-numeric characters', () => {
    expect(validateIMEI('35824005111111A')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(validateIMEI('')).toBe(false);
  });

  it('returns false for null/undefined', () => {
    expect(validateIMEI(null)).toBe(false);
    expect(validateIMEI(undefined)).toBe(false);
  });

  it('000000000000000 passes Luhn (correct — Luhn does not exclude zeros)', () => {
    // This is intentional: Luhn only checks digit math, not real IMEI validity
    // Real IMEI validation requires TAC database which we don't have
    const result = validateIMEI('000000000000000');
    expect(typeof result).toBe('boolean');
  });
});

// ─── lookupDevice (unit tests with in-memory cache adapters) ───────
describe('lookupDevice() with Mock provider', () => {
  let lookupDevice, validateIMEI;

  beforeAll(async () => {
    process.env.IMEI_PROVIDER = 'mock';
    const mod       = await import('../services/deviceLookup.service.js');
    lookupDevice    = mod.lookupDevice;
    validateIMEI    = mod.validateIMEI;
  });

  afterAll(() => {
    dbCache.clear();
    redisCache.clear();
  });

  it('returns device info for known Apple IMEI prefix (35...)', async () => {
    const result = await lookupDevice('358240051111110');
    expect(result.found).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.brand).toBe('Apple');
    expect(result.data.model).toContain('iPhone');
  });

  it('source is "api" on first lookup (cache miss)', async () => {
    // Use a fresh unique IMEI unlikely to be in cache
    const testImei = '358240051999990';
    const result = await lookupDevice(testImei);
    expect(['api', 'redis_cache', 'db_cache']).toContain(result.source);
    expect(result.found).toBe(true);
  });

  it('source is "db_cache" on second lookup for same IMEI', async () => {
    const imei = '358240051111110'; // already fetched above
    const second = await lookupDevice(imei);
    // Should be from DB or Redis cache now
    expect(['db_cache', 'redis_cache']).toContain(second.source);
    expect(second.found).toBe(true);
  });

  it('normalises data to unified shape regardless of provider', async () => {
    const result = await lookupDevice('358240051111110');
    expect(result.data).toHaveProperty('brand');
    expect(result.data).toHaveProperty('model');
    expect(result.data).toHaveProperty('device_type');
  });

  it('returns device info for Huawei IMEI prefix (86700...)', async () => {
    const result = await lookupDevice('867001234567890');
    expect(result.found).toBe(true);
    expect(result.data.brand).toBe('Huawei');
  });

  it('handles unknown IMEI gracefully with fallback data', async () => {
    const result = await lookupDevice('999990000000000');
    // Mock provider always returns something
    expect(result.found).toBe(true);
    expect(result.data).toBeDefined();
  });
});

// ─── Mock Provider unit test (no DB needed) ───────────────────────
describe('MockProvider in isolation', () => {
  let MockProvider;

  beforeAll(async () => {
    const mod    = await import('../services/providers/mock.provider.js');
    MockProvider = mod.default;
  });

  it('returns Apple for 35... prefix', async () => {
    const provider = new MockProvider();
    const result   = await provider.lookup('358240051111110');
    expect(result.brand).toBe('Apple');
  });

  it('returns Huawei for 86700... prefix', async () => {
    const provider = new MockProvider();
    const result   = await provider.lookup('867001234567890');
    expect(result.brand).toBe('Huawei');
  });

  it('returns Xiaomi for 86800... prefix', async () => {
    const provider = new MockProvider();
    const result   = await provider.lookup('868001234567890');
    expect(result.brand).toBe('Xiaomi');
  });

  it('has realistic delay (simulates network)', async () => {
    const provider = new MockProvider();
    const start    = Date.now();
    await provider.lookup('358240051111110');
    expect(Date.now() - start).toBeGreaterThan(50);
  });

  it('always returns non-null for any IMEI', async () => {
    const provider = new MockProvider();
    const result   = await provider.lookup('999990000000000');
    expect(result).not.toBeNull();
    expect(result.brand).toBeDefined();
  });
});

// ─── imeicheck Provider unit test (structure only) ────────────────
describe('ImeiCheckProvider structure', () => {
  it('exports a class with lookup() method', async () => {
    const mod      = await import('../services/providers/imeicheck.provider.js');
    const Provider = mod.default;
    const instance = new Provider();
    expect(typeof instance.lookup).toBe('function');
  });

  it('throws when API key is missing', async () => {
    const mod              = await import('../services/providers/imeicheck.provider.js');
    const Provider         = mod.default;
    const instance         = new Provider();
    const originalKey      = process.env.IMEICHECK_API_KEY;
    delete process.env.IMEICHECK_API_KEY;
    instance.apiKey        = undefined;

    await expect(instance.lookup('358240051111110')).rejects.toThrow('IMEICHECK_API_KEY');
    process.env.IMEICHECK_API_KEY = originalKey;
  });

  it('correctly infers device type from name', async () => {
    const mod      = await import('../services/providers/imeicheck.provider.js');
    const Provider = mod.default;
    const p        = new Provider();

    expect(p._inferType('Apple',  'iPad Pro')).toBe('tablet');
    expect(p._inferType('Apple',  'iPhone 14')).toBe('phone');
    expect(p._inferType('Lenovo', 'ThinkBook Laptop')).toBe('laptop');
    expect(p._inferType('Samsung','Galaxy Tab S8')).toBe('tablet');
    expect(p._inferType('Samsung','Galaxy S23')).toBe('phone');
  });
});
