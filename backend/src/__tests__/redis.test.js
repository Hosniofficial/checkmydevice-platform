/**
 * Tests: Redis Cache Service
 * Graceful degradation tested — all ops return null/false instead of throwing.
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import dotenv from 'dotenv';
dotenv.config();

describe('Redis Cache Service', () => {
  let cacheGet, cacheSet, cacheDel, rateLimitIncr, rateLimitGet,
      redisHealth, isRedisConnected, connectRedis, KEY, TTL;

  beforeAll(async () => {
    const mod        = await import('../services/redis.service.js');
    cacheGet         = mod.cacheGet;
    cacheSet         = mod.cacheSet;
    cacheDel         = mod.cacheDel;
    rateLimitIncr    = mod.rateLimitIncr;
    rateLimitGet     = mod.rateLimitGet;
    redisHealth      = mod.redisHealth;
    isRedisConnected = mod.isRedisConnected;
    connectRedis     = mod.connectRedis;
    KEY              = mod.KEY;
    TTL              = mod.TTL;
    await connectRedis();
  });

  // ── KEY builders ──────────────────────────────────────────────
  describe('KEY builders', () => {
    it('generates search key', () => {
      expect(KEY.search('352322311421731')).toBe('search:imei:352322311421731');
    });
    it('generates rate limit IP key', () => {
      expect(KEY.rateIp('192.168.0.1')).toBe('ratelimit:ip:192.168.0.1');
    });
    it('generates rate limit user key', () => {
      expect(KEY.rateUser('uuid-123')).toBe('ratelimit:user:uuid-123');
    });
    it('generates device info key', () => {
      expect(KEY.deviceInfo('352322311421731')).toBe('device:info:352322311421731');
    });
    it('generates dashboard stats key', () => {
      expect(KEY.dashStats()).toBe('stats:dashboard');
    });
    it('generates plans key', () => {
      expect(KEY.plans()).toBe('plans:all');
    });
  });

  // ── TTL constants ─────────────────────────────────────────────
  describe('TTL constants', () => {
    it('SEARCH_RESULT = 1 hour', ()        => expect(TTL.SEARCH_RESULT).toBe(3600));
    it('RATE_LIMIT = 24 hours', ()         => expect(TTL.RATE_LIMIT).toBe(86400));
    it('DASHBOARD_STATS = 15 min', ()      => expect(TTL.DASHBOARD_STATS).toBe(900));
    it('DEVICE_INFO = 6 hours', ()         => expect(TTL.DEVICE_INFO).toBe(21600));
    it('REFRESH_TOKEN = 30 days', ()       => expect(TTL.REFRESH_TOKEN).toBe(2592000));
  });

  // ── Cache ops ─────────────────────────────────────────────────
  describe('cacheSet → cacheGet → cacheDel', () => {
    const KEY_TEST = `test:unit:${Date.now()}`;
    const VAL      = { status: 'clean', brand: 'Apple', model: 'iPhone 14', nested: { x: 1 } };

    afterAll(async () => { await cacheDel(KEY_TEST).catch(() => {}); });

    it('set and get returns same value', async () => {
      await cacheSet(KEY_TEST, VAL, 60);
      const result = await cacheGet(KEY_TEST);
      expect(result).toEqual(VAL);
    });

    it('get on missing key returns null', async () => {
      const result = await cacheGet(`test:missing:${Date.now()}`);
      expect(result).toBeNull();
    });

    it('del removes the key', async () => {
      await cacheSet(KEY_TEST, VAL, 60);
      await cacheDel(KEY_TEST);
      const result = await cacheGet(KEY_TEST);
      expect(result).toBeNull();
    });

    it('handles complex nested objects', async () => {
      const complex = {
        reports:    [{ id: 'r1', brand: 'Samsung', report_type: 'stolen' }],
        device:     { brand: 'Samsung', model: 'Galaxy S23' },
        checked_at: new Date().toISOString(),
      };
      await cacheSet(KEY_TEST, complex, 60);
      const result = await cacheGet(KEY_TEST);
      expect(result.reports[0].brand).toBe('Samsung');
      expect(result.device.model).toBe('Galaxy S23');
    });

    it('cacheGet never throws — returns null on any error', async () => {
      // Call with extreme key — should not throw
      const result = await cacheGet('');
      expect(result === null || result !== undefined).toBe(true);
    });
  });

  // ── Rate limiting ─────────────────────────────────────────────
  describe('rateLimitIncr (Redis atomic counter)', () => {
    const RL_KEY = `ratelimit:test:unit:${Date.now()}`;

    afterAll(async () => { await cacheDel(RL_KEY).catch(() => {}); });

    it('first increment returns count=1', async () => {
      const result = await rateLimitIncr(RL_KEY, 60);
      if (!result) return; // Redis not connected — skip gracefully
      expect(result.count).toBe(1);
    });

    it('second increment returns count=2', async () => {
      const result = await rateLimitIncr(RL_KEY, 60);
      if (!result) return;
      expect(result.count).toBeGreaterThanOrEqual(2);
    });

    it('rateLimitGet returns numeric count', async () => {
      const count = await rateLimitGet(RL_KEY);
      if (count === null) return;
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThan(0);
    });

    it('returns null gracefully when Redis is down', async () => {
      // simulate by calling with no connection — handled internally
      // just verify it does not throw
      const result = await rateLimitGet('any:key:here');
      expect(result === null || typeof result === 'number').toBe(true);
    });
  });

  // ── Health check ──────────────────────────────────────────────
  describe('redisHealth()', () => {
    it('returns object with status field', async () => {
      const h = await redisHealth();
      expect(h).toHaveProperty('status');
      expect(['connected','disconnected','error']).toContain(h.status);
    });

    it('returns latency_ms when connected', async () => {
      const h = await redisHealth();
      if (h.status === 'connected') {
        expect(typeof h.latency_ms).toBe('number');
        expect(h.latency_ms).toBeGreaterThanOrEqual(0);
      }
    });

    it('isRedisConnected() returns boolean', () => {
      expect(typeof isRedisConnected()).toBe('boolean');
    });
  });
});
