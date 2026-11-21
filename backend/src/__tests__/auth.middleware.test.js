import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const queryMock = jest.fn();
const verifyMock = jest.fn();

jest.unstable_mockModule('../db/pool.js', () => ({ query: queryMock }));
jest.unstable_mockModule('jsonwebtoken', () => ({
  default: { verify: verifyMock },
}));

const { authenticate } = await import('../middleware/auth.middleware.js');

function createResponse() {
  return {
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
}

describe('authenticate()', () => {
  beforeEach(() => {
    queryMock.mockReset();
    verifyMock.mockReset().mockReturnValue({ id: 'user-1' });
  });

  it('allows a verified user through to the protected route', async () => {
    queryMock.mockResolvedValue({
      rows: [{
        id: 'user-1',
        email: 'admin@example.com',
        role: 'super_admin',
        status: 'active',
        email_verified: true,
      }],
    });
    const req = { headers: { authorization: 'Bearer access-token' } };
    const res = createResponse();
    const next = jest.fn();

    await authenticate(req, res, next);

    expect(queryMock.mock.calls[0][0]).toContain('email_verified');
    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user.email_verified).toBe(true);
    expect(res.statusCode).toBe(200);
  });

  it('allows an unverified user to use authenticated routes', async () => {
    queryMock.mockResolvedValue({
      rows: [{
        id: 'user-1',
        email: 'user@example.com',
        role: 'user',
        status: 'active',
        email_verified: false,
      }],
    });
    const req = { headers: { authorization: 'Bearer access-token' } };
    const res = createResponse();
    const next = jest.fn();

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user.email_verified).toBe(false);
    expect(res.statusCode).toBe(200);
  });
});
