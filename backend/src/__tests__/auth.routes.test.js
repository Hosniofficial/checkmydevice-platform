import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const queryMock = jest.fn();
const compareMock = jest.fn();

jest.unstable_mockModule('../db/pool.js', () => ({ query: queryMock }));
jest.unstable_mockModule('bcryptjs', () => ({
  default: { compare: compareMock, hash: jest.fn() },
}));
jest.unstable_mockModule('../services/email.service.js', () => ({
  sendVerificationEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
}));
jest.unstable_mockModule('../middleware/auth.middleware.js', () => ({
  authenticate: jest.fn(),
}));
jest.unstable_mockModule('../utils/audit.js', () => ({ auditLog: jest.fn() }));

const { default: router } = await import('../modules/auth/auth.routes.js');
const loginHandler = router.stack
  .find(layer => layer.route?.path === '/login')
  .route.stack.at(-1).handle;

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

describe('POST /auth/login', () => {
  beforeEach(() => {
    queryMock.mockReset();
    compareMock.mockReset();
  });

  it('does not reveal an unverified account when the password is wrong', async () => {
    queryMock.mockResolvedValue({
      rows: [{
        id: 'user-1',
        email: 'pending@example.com',
        password_hash: 'stored-hash',
        status: 'active',
        email_verified: false,
      }],
    });
    compareMock.mockResolvedValue(false);
    const res = createResponse();

    await loginHandler({
      body: { email: 'pending@example.com', password: 'wrong-password' },
      ip: '127.0.0.1',
    }, res);

    expect(res.statusCode).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('asks a correctly authenticated unverified user to verify their email', async () => {
    queryMock.mockResolvedValue({
      rows: [{
        id: 'user-1',
        email: 'pending@example.com',
        password_hash: 'stored-hash',
        status: 'active',
        email_verified: false,
      }],
    });
    compareMock.mockResolvedValue(true);
    const res = createResponse();

    await loginHandler({
      body: { email: 'pending@example.com', password: 'correct-password' },
      ip: '127.0.0.1',
    }, res);

    expect(res.statusCode).toBe(403);
    expect(res.body.error.code).toBe('EMAIL_NOT_VERIFIED');
  });
});
