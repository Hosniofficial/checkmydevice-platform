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

const { sendDeviceSearchedAlert } = await import('../services/email.service.js');

describe('sendDeviceSearchedAlert()', () => {
  beforeEach(() => {
    queryMock.mockReset();
    sendMock.mockReset().mockResolvedValue({ id: 'email-1' });
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
});
