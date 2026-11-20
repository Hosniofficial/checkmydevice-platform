import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const queryMock = jest.fn();
const cacheGetMock = jest.fn();
const cacheSetMock = jest.fn();
const sendDeviceSearchedAlertMock = jest.fn();

jest.unstable_mockModule('../db/pool.js', () => ({ query: queryMock }));
jest.unstable_mockModule('../middleware/auth.middleware.js', () => ({
  authenticate: jest.fn(),
  optionalAuth: jest.fn((req, res, next) => next()),
}));
jest.unstable_mockModule('../middleware/rateLimit.middleware.js', () => ({
  searchRateLimit: jest.fn((req, res, next) => next()),
}));
jest.unstable_mockModule('../services/deviceLookup.service.js', () => ({
  lookupDevice: jest.fn(),
  validateIMEI: jest.fn(() => true),
}));
jest.unstable_mockModule('../services/subscription.service.js', () => ({
  getUserSearchLimit: jest.fn(),
}));
jest.unstable_mockModule('../services/email.service.js', () => ({
  sendDeviceSearchedAlert: sendDeviceSearchedAlertMock,
}));
jest.unstable_mockModule('../services/redis.service.js', () => ({
  cacheGet: cacheGetMock,
  cacheSet: cacheSetMock,
  KEY: { search: (value, type = 'imei') => `search:${type}:${value}` },
  TTL: { SEARCH_RESULT: 3600 },
}));
jest.unstable_mockModule('geoip-lite', () => ({
  default: { lookup: jest.fn() },
}));

const { default: router } = await import('../modules/search/search.routes.js');
const searchHandler = router.stack
  .find(layer => layer.route?.path === '/' && layer.route.methods.post)
  .route.stack.at(-1).handle;

describe('POST /search serial notifications', () => {
  beforeEach(() => {
    queryMock.mockReset();
    cacheGetMock.mockReset().mockResolvedValue(null);
    cacheSetMock.mockReset().mockResolvedValue(true);
    sendDeviceSearchedAlertMock.mockReset().mockResolvedValue(undefined);
  });

  it('notifies the owner of the matched serial-number report', async () => {
    const report = {
      id: 'report-1',
      brand: 'Apple',
      model: 'iPhone 14',
      device_type: 'phone',
      report_type: 'stolen',
      country_code: 'EG',
      created_at: '2026-01-01T00:00:00.000Z',
      reward_offered: false,
    };
    const owner = {
      email: 'owner@example.com',
      full_name: 'Device Owner',
      contact_email: null,
    };

    queryMock.mockImplementation(async (sql, params = []) => {
      if (sql.includes('LOWER(serial_number)=LOWER($1)')) {
        return { rows: params[0] === 'SERIAL-1234' ? [report] : [] };
      }
      if (sql.includes('INSERT INTO search_logs')) return { rows: [] };
      if (sql.includes('WHERE dr.id=$1')) return { rows: [owner] };
      throw new Error(`Unexpected database query in test: ${sql}`);
    });

    const res = {
      statusCode: 200,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(body) {
        this.body = body;
        return this;
      },
    };

    await searchHandler({
      body: { query: 'SERIAL-1234', query_type: 'serial' },
      headers: { 'x-forwarded-for': '203.0.113.1', 'user-agent': 'test' },
      ip: '203.0.113.1',
      searchLimit: 5,
    }, res);

    expect(res.statusCode).toBe(200);
    expect(sendDeviceSearchedAlertMock).toHaveBeenCalledWith(
      'owner@example.com',
      'Device Owner',
      expect.objectContaining({
        reportId: 'report-1',
        identifier: 'SERIAL-1234',
        identifierType: 'serial',
      }),
      expect.objectContaining({ searchedAt: expect.any(String) })
    );
    expect(queryMock.mock.calls.find(([sql]) => sql.includes('WHERE dr.id=$1'))[1])
      .toEqual(['report-1']);
    const serialSearch = queryMock.mock.calls.find(([sql]) => sql.includes('LOWER(serial_number)'));
    expect(serialSearch[1]).toEqual(['SERIAL-1234']);
  });

  it('treats serial wildcard characters as literal input', async () => {
    queryMock.mockImplementation(async (sql, params = []) => {
      if (sql.includes('LOWER(serial_number)=LOWER($1)')) {
        expect(params).toEqual(['%']);
        return { rows: [] };
      }
      if (sql.includes('INSERT INTO search_logs')) return { rows: [] };
      throw new Error(`Unexpected database query in test: ${sql}`);
    });

    const res = {
      statusCode: 200,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(body) {
        this.body = body;
        return this;
      },
    };

    await searchHandler({
      body: { query: '%', query_type: 'serial' },
      headers: { 'x-forwarded-for': '203.0.113.1', 'user-agent': 'test' },
      ip: '203.0.113.1',
      searchLimit: 5,
    }, res);

    expect(res.body.data.status).toBe('clean');
    expect(sendDeviceSearchedAlertMock).not.toHaveBeenCalled();
  });
});
