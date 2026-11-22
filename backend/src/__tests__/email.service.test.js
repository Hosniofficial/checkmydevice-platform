import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const queryMock = jest.fn();
const sendMock = jest.fn();

jest.unstable_mockModule('../db/pool.js', () => ({ query: queryMock }));
jest.unstable_mockModule('resend', () => ({
  Resend: class {
    constructor() {
      this.emails = { send: sendMock };
    }
  },
}));

const {
  sendDeviceSearchedAlert,
  sendPasswordResetEmail,
  sendReportStatusEmail,
  sendSystemTestEmail,
  sendVerificationEmail,
} = await import('../services/email.service.js');

describe('sendDeviceSearchedAlert()', () => {
  beforeEach(() => {
    queryMock.mockReset();
    sendMock.mockReset().mockResolvedValue({ data: { id: 'email-1' }, error: null });
    process.env.RESEND_API_KEY = 'test-key';
    process.env.FRONTEND_URL = 'https://example.test';
  });

  it('rate limits by report and masks serial identifiers in email content', async () => {
    queryMock
      .mockResolvedValueOnce({ rows: [{ last_search_notified_at: null }] })
      .mockResolvedValueOnce({ rows: [] });

    await sendDeviceSearchedAlert(
      'owner@example.com',
      'Device Owner',
      {
        reportId: 'report-1',
        identifier: '<script>serial-1234',
        identifierType: 'serial',
        brand: 'Apple',
        model: 'iPhone 14',
      },
      { country: 'مصر', searchedAt: '2026-01-01T00:00:00.000Z' }
    );

    expect(queryMock.mock.calls[0][0]).toContain('WHERE id = $1');
    expect(queryMock.mock.calls[0][1]).toEqual(['report-1']);
    expect(queryMock.mock.calls[1][0]).toContain('WHERE id = $1');
    expect(queryMock.mock.calls[1][1]).toEqual(['report-1']);
    expect(sendMock).toHaveBeenCalledTimes(1);
    const html = sendMock.mock.calls[0][0].html;
    expect(html).toContain('الرقم التسلسلي');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('serial-1234');
    expect(html).toContain('1234');
  });

  it('sends verification email with responsive branded HTML and a plain-text alternative', async () => {
    await sendVerificationEmail('user@example.test', '<img src=x onerror=alert(1)>', 'token&value');

    expect(sendMock).toHaveBeenCalledTimes(1);
    const message = sendMock.mock.calls[0][0];
    expect(message.html).toContain('dir="rtl"');
    expect(message.html).toContain('name="viewport"');
    expect(message.html).toContain('token%26value');
    expect(message.html).toContain('رسالة آلية من CheckMyDevice');
    expect(message.html).not.toContain('<img src=x');
    expect(message.text).toContain('يمكنك استخدام حسابك الآن');
    expect(message.text).toContain('https://example.test/verify-email?token=token%26value');
  });

  it('sends password reset and report status emails with plain-text fallbacks', async () => {
    await sendPasswordResetEmail('user@example.test', 'Test User', 'reset-token');
    await sendReportStatusEmail('user@example.test', 'Test User', 'rejected', 'RPT-1234', '<script>alert(1)</script>');

    expect(sendMock).toHaveBeenCalledTimes(2);
    const resetMessage = sendMock.mock.calls[0][0];
    expect(resetMessage.html).toContain('https://example.test/reset-password?token=reset-token');
    expect(resetMessage.text).toContain('ساعة واحدة');

    const reportMessage = sendMock.mock.calls[1][0];
    expect(reportMessage.html).toContain('تم رفض البلاغ');
    expect(reportMessage.html).not.toContain('<script>');
    expect(reportMessage.text).toContain('ملاحظة فريق المراجعة');
    expect(reportMessage.text).toContain('<script>alert(1)</script>');
  });

  it('uses the shared email design for system test messages and reports send failures', async () => {
    expect(await sendSystemTestEmail('admin@example.test')).toBe(true);
    const message = sendMock.mock.calls[0][0];
    expect(message.subject).toContain('اختبار البريد الإلكتروني');
    expect(message.html).toContain('منصة CheckMyDevice');
    expect(message.text).toContain('تفاصيل الاختبار');

    sendMock.mockResolvedValueOnce({
      data: null,
      error: { message: 'Domain is not verified' },
    });
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(sendSystemTestEmail('admin@example.test')).resolves.toBe(false);
    consoleError.mockRestore();
  });
});
