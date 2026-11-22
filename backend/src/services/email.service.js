/**
 * Email Service — uses Resend API (HTTP-based, no SMTP ports needed)
 * Railway blocks outbound SMTP ports 25/465/587, so we use Resend instead.
 * Free tier: 3,000 emails/month — https://resend.com
 */
import { Resend }  from 'resend';
import escapeHtml  from 'escape-html';
import { query }   from '../db/pool.js';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

// Use verified domain in production; fall back to Resend sandbox only in dev
const FROM = () => process.env.EMAIL_FROM || 'CheckMyDevice <onboarding@resend.dev>';

// ─── Safe send — catches Resend errors so callers don't crash ─────
async function safeSend(payload) {
  try {
    const result = await getResend().emails.send({
      ...payload,
      text: payload.text || toPlainText(payload.html),
    });
    if (result?.error) {
      console.error('[Email] Failed to send "%s" to %s: %s',
        payload.subject, payload.to, result.error.message || 'Unknown Resend error');
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Email] Failed to send "%s" to %s: %s', payload.subject, payload.to, err.message);
    return false;
  }
}

function toPlainText(html) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|tr|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function frontendUrl(path) {
  const base = (process.env.FRONTEND_URL || 'https://checkmydevice.online').replace(/\/+$/, '');
  return `${base}/${path.replace(/^\/+/, '')}`;
}

// ─── Shared Styles ────────────────────────────────────────────────
// NOTE: @import is intentionally removed — most email clients ignore it.
// IBM Plex Sans Arabic is listed first as an aspirational hint for clients
// that do support web fonts (Apple Mail, iOS Mail); all others fall back
// to the system Arabic stack: Tahoma → Arial → sans-serif.
const BASE_STYLE = `
  <style>
    body { width: 100% !important; margin: 0; padding: 0; background: #f3f5f8; color: #172033; font-family: Tahoma, Arial, sans-serif; direction: rtl; }
    table { border-collapse: collapse; }
    .email-shell { width: 100%; background: #f3f5f8; }
    .email-container { width: 100%; max-width: 600px; background: #ffffff; border: 1px solid #e6eaf0; border-radius: 18px; overflow: hidden; }
    .email-content { padding: 36px 42px; }
    .email-footer { padding: 22px 36px; background: #f8fafc; border-top: 1px solid #e6eaf0; text-align: center; }
    .greeting { font-size: 19px; font-weight: 700; line-height: 1.6; color: #172033; margin: 0 0 12px; }
    .lead { font-size: 14px; color: #5f6b7a; line-height: 1.9; margin: 0 0 26px; }
    .divider { border: 0; border-top: 1px solid #e9edf2; margin: 26px 0; }
    .btn-wrap { text-align: center; margin: 0 0 26px; }
    .btn { display: inline-block; padding: 14px 26px; border-radius: 10px; font-size: 14px; line-height: 1.4; font-weight: 700; text-decoration: none; font-family: Tahoma, Arial, sans-serif; }
    .info-card { background: #f8fafc; border: 1px solid #e6eaf0; border-radius: 12px; padding: 18px 20px; margin: 0 0 18px; }
    .card-label { font-size: 11px; font-weight: 700; color: #758195; margin: 0 0 12px; }
    .card-row { padding: 9px 0; border-bottom: 1px solid #e9edf2; line-height: 1.7; }
    .card-row:last-child { border-bottom: 0; }
    .card-key { font-size: 12px; color: #758195; display: inline-block; width: 40%; }
    .card-val { font-size: 13px; font-weight: 600; color: #172033; }
    .card-mono { font-family: 'Courier New', monospace; font-size: 12px; letter-spacing: 1px; background: #edf1f6; padding: 4px 8px; border-radius: 5px; color: #344054; }
    .notice { border-radius: 10px; padding: 14px 16px; font-size: 13px; line-height: 1.8; margin: 0 0 16px; }
    .notice-icon { font-size: 14px; margin-left: 7px; }
    .notice-warn { background: #fff8e8; border: 1px solid #f4dfaa; color: #754d08; }
    .notice-info { background: #eef5ff; border: 1px solid #d5e5fb; color: #244b7a; }
    .notice-success { background: #edf8f1; border: 1px solid #ccebd6; color: #22613a; }
    .link-box { background: #f8fafc; border: 1px solid #e6eaf0; border-radius: 10px; padding: 14px 16px; margin: 0 0 16px; }
    .link-label { font-size: 11px; color: #758195; margin: 0 0 7px; }
    .link-url { font-size: 12px; color: #2457a7; word-break: break-all; font-family: Arial, sans-serif; direction: ltr; text-align: left; }
    .badge { display: inline-block; font-size: 11px; font-weight: 700; padding: 6px 11px; border-radius: 6px; margin: 0 0 18px; }
    .stat-table { width: 100%; border-collapse: separate; border-spacing: 6px; margin: 0 0 18px; }
    .stat-cell { background: #f8fafc; border: 1px solid #e6eaf0; border-radius: 10px; padding: 13px 14px; width: 50%; vertical-align: top; }
    .stat-label { font-size: 11px; color: #758195; margin: 0 0 5px; }
    .stat-val { font-size: 14px; font-weight: 700; line-height: 1.6; color: #172033; margin: 0; }
    .ref-table { width: 100%; background: #f8fafc; border: 1px solid #e6eaf0; border-radius: 10px; margin: 0 0 18px; }
    .ref-label { font-size: 11px; color: #758195; margin: 0 0 6px; }
    .ref-val { font-size: 20px; font-weight: 700; font-family: 'Courier New', monospace; color: #172033; letter-spacing: 1px; margin: 0; }
    .ref-status { font-size: 11px; font-weight: 700; padding: 6px 10px; border-radius: 20px; white-space: nowrap; }
    .ref-ok { background: #dff3e6; color: #22613a; }
    .ref-no { background: #fde7e7; color: #922f35; }
    .email-footer p { font-size: 11px; color: #7a8493; margin: 0 0 5px; line-height: 1.8; }
    .email-footer a { color: #315d9b; text-decoration: none; }
    .feature-table { width: 100%; border-collapse: collapse; margin: 0 0 22px; }
    .feature-row td { padding: 11px 0; border-bottom: 1px solid #edf0f4; vertical-align: top; }
    .feature-row:last-child td { border-bottom: 0; }
    .feature-icon-cell { width: 46px; padding-left: 10px; }
    .feature-icon-wrap { width: 34px; height: 34px; border-radius: 9px; background: #edf3fc; text-align: center; font-size: 16px; line-height: 34px; }
    .feature-title { font-size: 13px; font-weight: 700; color: #172033; margin: 0 0 3px; }
    .feature-desc { font-size: 12px; color: #758195; line-height: 1.6; margin: 0; }
    .spacer { height: 10px; }
    @media screen and (max-width: 620px) {
      .email-container { border-radius: 0 !important; }
      .email-content { padding: 26px 20px !important; }
      .email-footer { padding: 20px !important; }
      .stat-table { border-spacing: 0 !important; }
      .stat-cell { display: block !important; width: 100% !important; }
    }
  </style>
`;

// ─── Layout wrapper ───────────────────────────────────────────────
function layout(accentColor, preheader, content, footerContent) {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>CheckMyDevice</title>
  ${BASE_STYLE}
</head>
<body style="width:100%;margin:0;padding:0;background:#f3f5f8;color:#172033;font-family:Tahoma,Arial,sans-serif;direction:rtl;">
<div style="display:none;font-size:1px;color:#f3f5f8;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(preheader)}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>
<table role="presentation" class="email-shell" width="100%" border="0" cellpadding="0" cellspacing="0" style="width:100%;background:#f3f5f8;">
  <tr><td align="center" style="padding:28px 12px;">
    <table role="presentation" class="email-container" width="600" border="0" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #e6eaf0;border-radius:18px;overflow:hidden;">
      <tr><td style="height:5px;background:${accentColor};font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="padding:25px 32px 20px;text-align:right;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr>
          <td align="center" valign="middle" style="width:38px;height:38px;border-radius:11px;background:#edf3fc;color:#204b87;font-size:17px;font-weight:700;">C</td>
          <td valign="middle" style="padding-right:10px;">
            <p style="font-family:Tahoma,Arial,sans-serif;font-size:17px;font-weight:700;color:#172f55;margin:0;">CheckMyDevice</p>
            <p style="font-family:Tahoma,Arial,sans-serif;font-size:11px;color:#758195;margin:3px 0 0;">منصة فحص الأجهزة المحمولة</p>
          </td>
        </tr></table>
      </td></tr>
      <tr><td class="email-content" style="padding:30px 42px;">${content}</td></tr>
      <tr><td class="email-footer" style="padding:22px 36px;background:#f8fafc;border-top:1px solid #e6eaf0;text-align:center;">${footerContent}</td></tr>
    </table>
    <p style="font-family:Tahoma,Arial,sans-serif;font-size:10px;line-height:1.7;color:#8993a1;margin:14px 8px 0;">رسالة آلية من CheckMyDevice، يرجى عدم الرد عليها مباشرة.</p>
  </td></tr>
</table>
</body>
</html>`;
}

// ─── Verification Email ───────────────────────────────────────────
export async function sendVerificationEmail(email, name, token) {
  const url         = frontendUrl(`verify-email?token=${encodeURIComponent(token)}`);
  const safeUrl     = escapeHtml(url);
  const displayName = escapeHtml(name || 'عزيزي المستخدم');

  const content = `
    <p class="greeting">مرحباً، ${displayName} 👋</p>
    <p class="lead">
      شكراً لتسجيلك في <strong>CheckMyDevice</strong>. يمكنك استخدام حسابك الآن، وننصحك بتأكيد بريدك الإلكتروني للمساعدة في حمايته واستعادة الوصول إليه.
    </p>
    <div class="btn-wrap">
      <a href="${safeUrl}" class="btn" style="background:#2457a7;color:#ffffff;">تأكيد البريد الإلكتروني</a>
    </div>
    <hr class="divider">
    <table class="feature-table">
      <tr class="feature-row">
        <td class="feature-icon-cell"><div class="feature-icon-wrap">🔍</div></td>
        <td><p class="feature-title">فحص الأجهزة</p><p class="feature-desc">تحقق من أي جهاز عبر رقم IMEI قبل الشراء</p></td>
      </tr>
      <tr class="feature-row">
        <td class="feature-icon-cell"><div class="feature-icon-wrap">📢</div></td>
        <td><p class="feature-title">الإبلاغ عن المسروقات</p><p class="feature-desc">سجّل جهازك في قاعدة البيانات وأبلغ عنه فوراً</p></td>
      </tr>
      <tr class="feature-row">
        <td class="feature-icon-cell"><div class="feature-icon-wrap">🔔</div></td>
        <td><p class="feature-title">تنبيهات لحظية</p><p class="feature-desc">استقبل إشعاراً فور بحث أي شخص عن جهازك</p></td>
      </tr>
    </table>
    <div class="link-box">
      <p class="link-label">أو انسخ الرابط في متصفحك</p>
      <p class="link-url">${safeUrl}</p>
    </div>
    <div class="spacer"></div>
    <div class="notice notice-warn">
      <span class="notice-icon">⏱</span>
      هذا الرابط صالح لمدة <strong>24 ساعة</strong> فقط.
    </div>
  `;

  const footer = `
    <p>إذا لم تقم بإنشاء هذا الحساب، يمكنك تجاهل هذا البريد بأمان.</p>
    <p>© ${new Date().getFullYear()} CheckMyDevice · <a href="${escapeHtml(frontendUrl('privacy'))}">سياسة الخصوصية</a></p>
  `;

  await safeSend({
    from:    FROM(),
    to:      email,
    subject: '✅ تأكيد بريدك الإلكتروني — CheckMyDevice',
    html:    layout('#315f9f', 'أكد بريدك الإلكتروني لتعزيز حماية حسابك في CheckMyDevice.', content, footer),
  });
}

// ─── Password Reset Email ─────────────────────────────────────────
export async function sendPasswordResetEmail(email, name, token) {
  const url = frontendUrl(`reset-password?token=${encodeURIComponent(token)}`);
  const safeUrl = escapeHtml(url);

  const content = `
    <p class="greeting">مرحباً، ${escapeHtml(name || 'عزيزي المستخدم')}</p>
    <p class="lead">
      تلقّينا طلباً لإعادة تعيين كلمة المرور الخاصة بحساب
      <strong>${escapeHtml(email)}</strong>.
      اضغط على الزر أدناه لاختيار كلمة مرور جديدة.
    </p>
    <div class="btn-wrap">
      <a href="${safeUrl}" class="btn" style="background:#a83b43;color:#ffffff;">إعادة تعيين كلمة المرور</a>
    </div>
    <hr class="divider">
    <div class="notice notice-warn" style="margin-bottom:16px;">
      <span class="notice-icon">⏱</span>
      هذا الرابط صالح لمدة <strong>ساعة واحدة</strong> فقط.
    </div>
    <div class="link-box" style="margin-bottom:16px;">
      <p class="link-label">أو انسخ الرابط في متصفحك</p>
      <p class="link-url">${safeUrl}</p>
    </div>
    <div class="notice notice-info">
      <span class="notice-icon">ℹ️</span>
      إذا لم تطلب إعادة التعيين، يمكنك تجاهل هذا البريد بأمان. حسابك لم يتأثر.
    </div>
  `;

  const footer = `
    <p>طُلب هذا الإجراء بواسطة حساب مرتبط بهذا البريد الإلكتروني.</p>
    <p>© ${new Date().getFullYear()} CheckMyDevice · <a href="${escapeHtml(frontendUrl('privacy'))}">سياسة الخصوصية</a></p>
  `;

  await safeSend({
    from:    FROM(),
    to:      email,
    subject: '🔐 إعادة تعيين كلمة المرور — CheckMyDevice',
    html:    layout('#a83b43', 'رابط آمن لإعادة تعيين كلمة مرور حسابك.', content, footer),
  });
}

// ─── Device Searched Alert ────────────────────────────────────────
// Rate limit: max 1 email per report per 24h to prevent notification spam.
export async function sendDeviceSearchedAlert(ownerEmail, ownerName, deviceInfo, searcherInfo) {
  // ── Rate limit check ─────────────────────────────────────────
  try {
    const { rows } = await query(
      `SELECT last_search_notified_at FROM devices_reports
       WHERE id = $1 AND status = 'approved'`,
      [deviceInfo.reportId]
    );
    if (rows.length) {
      const last = rows[0].last_search_notified_at;
      if (last && (Date.now() - new Date(last).getTime()) < 24 * 60 * 60 * 1000) {
        return; // already notified within 24h — skip
      }
      // Update timestamp
      await query(
        `UPDATE devices_reports SET last_search_notified_at = NOW()
         WHERE id = $1 AND status = 'approved'`,
        [deviceInfo.reportId]
      );
    }
  } catch (err) {
    // DB error — still send the email (better UX than silent failure)
    console.warn('[Email] Rate limit check failed, sending anyway:', err.message);
  }

  const displayName = escapeHtml(ownerName || 'عزيزي المستخدم');
  const identifierLabel = deviceInfo.identifierType === 'serial' ? 'الرقم التسلسلي' : 'IMEI';
  const identifier = String(deviceInfo.identifier ?? deviceInfo.imei ?? '');
  const maskedIdentifier = escapeHtml(identifier.replace(/.(?=.{4})/g, '*'));
  // Use the timestamp passed from the caller (actual search time), not server now
  const searchTime  = searcherInfo?.searchedAt
    ? new Date(searcherInfo.searchedAt).toLocaleString('ar-EG', { dateStyle: 'long', timeStyle: 'short' })
    : new Date().toLocaleString('ar-EG', { dateStyle: 'long', timeStyle: 'short' });
  const country      = escapeHtml(searcherInfo?.country || 'غير محدد');
  const dashboardUrl = escapeHtml(frontendUrl('reports'));

  const content = `
    <span class="badge" style="background:#FFF7ED;color:#9A3412;border:1px solid #FED7AA;">⚠️ تنبيه نشاط</span>
    <p class="greeting">مرحباً، ${displayName}</p>
    <p class="lead">
      تم البحث عن جهازك المبلَّغ عنه على منصة <strong>CheckMyDevice</strong>.
      شخص ما يتحقق منه — ربما مشترٍ محتمل.
    </p>
    <table class="stat-table">
      <tr>
        <td class="stat-cell">
          <p class="stat-label">الجهاز</p>
          <p class="stat-val">${escapeHtml(deviceInfo.brand)} ${escapeHtml(deviceInfo.model)}</p>
        </td>
        <td class="stat-cell">
          <p class="stat-label">الدولة</p>
          <p class="stat-val">${country}</p>
        </td>
      </tr>
    </table>
    <div class="info-card">
      <p class="card-label">تفاصيل البحث</p>
      <div class="card-row">
        <span class="card-key">الجهاز</span>
        <span class="card-val">${escapeHtml(deviceInfo.brand)} ${escapeHtml(deviceInfo.model)}</span>
      </div>
      <div class="card-row">
        <span class="card-key">${identifierLabel}</span>
        <span class="card-mono">${maskedIdentifier}</span>
      </div>
      <div class="card-row">
        <span class="card-key">وقت البحث</span>
        <span class="card-val">${searchTime}</span>
      </div>
      <div class="card-row">
        <span class="card-key">الدولة</span>
        <span class="card-val">${country}</span>
      </div>
    </div>
    <div class="btn-wrap">
      <a href="${dashboardUrl}" class="btn" style="background:#0F172A;color:#ffffff;">عرض بلاغاتي</a>
    </div>
    <div class="notice notice-success">
      <span class="notice-icon">💡</span>
      إذا استردت جهازك، يمكنك <strong>إلغاء البلاغ</strong> من صفحة بلاغاتي في أي وقت.
    </div>
  `;

  const footer = `
    <p>تلقّيت هذا البريد لأن جهازك مسجّل في قاعدة بياناتنا.</p>
    <p>© ${new Date().getFullYear()} CheckMyDevice · <a href="${dashboardUrl}">إدارة البلاغات</a></p>
  `;

  await safeSend({
    from:    FROM(),
    to:      ownerEmail,
    subject: '🔍 تنبيه: تم البحث عن جهازك — CheckMyDevice',
    html:    layout('#315f9f', 'تم البحث عن جهاز مسجل في أحد بلاغاتك.', content, footer),
  });
}

// ─── Report Status Email ──────────────────────────────────────────
export async function sendReportStatusEmail(email, name, status, reportRef, adminNote) {
  const displayName  = escapeHtml(name || 'عزيزي المستخدم');
  const isApproved   = status === 'approved';
  const dashboardUrl = escapeHtml(frontendUrl('reports'));
  const safeNote     = adminNote ? escapeHtml(adminNote) : null;

  const badgeStyle  = isApproved
    ? 'background:#DCFCE7;color:#14532D;border:1px solid #BBF7D0;'
    : 'background:#FEE2E2;color:#991B1B;border:1px solid #FECACA;';
  const badgeText   = isApproved ? '✅ تم قبول البلاغ' : '❌ تم رفض البلاغ';
  const bodyText    = isApproved
    ? 'تمت مراجعة بلاغك والموافقة عليه. جهازك الآن مدرج في قاعدة بياناتنا وسيظهر في نتائج البحث. سيتم إبلاغك فور بحث أي شخص عنه.'
    : 'نأسف لإبلاغك بأنه تم رفض بلاغك بعد المراجعة. يمكنك رفع بلاغ جديد بمستندات أوضح أو التواصل مع فريق الدعم للمساعدة.';
  const btnStyle    = isApproved
    ? 'background:#14532D;color:#ffffff;'
    : 'background:#991B1B;color:#ffffff;';
  const btnText     = isApproved ? 'عرض البلاغ المقبول' : 'رفع بلاغ جديد';
  const refStatus   = isApproved
    ? '<span class="ref-status ref-ok">مقبول ✓</span>'
    : '<span class="ref-status ref-no">مرفوض ✗</span>';

  const adminNoteBlock = safeNote ? `
    <div class="info-card" style="margin-bottom:20px;">
      <p class="card-label">ملاحظة فريق المراجعة</p>
      <p style="font-size:13px;color:#334155;line-height:1.75;margin:0;">${safeNote}</p>
    </div>
  ` : '';

  const bottomNotice = isApproved ? `
    <div class="notice notice-info">
      <span class="notice-icon">📢</span>
      تمت إضافة الجهاز إلى قاعدة البيانات، ويمكنك متابعة البلاغ وإدارته من حسابك.
      <br>
      <a href="${dashboardUrl}" class="btn" style="background:#2457a7;color:#ffffff;margin-top:12px;">عرض بلاغاتي</a>
    </div>
  ` : `
    <div class="notice notice-info">
      <span class="notice-icon">💬</span>
      هل لديك استفسار؟ تواصل مع فريق الدعم على
      <a href="mailto:support@checkmydevice.online" style="color:#1E40AF;font-weight:600;">support@checkmydevice.online</a>
    </div>
  `;

  const content = `
    <span class="badge" style="${badgeStyle}">${badgeText}</span>
    <p class="greeting">مرحباً، ${displayName}</p>
    <p class="lead">${bodyText}</p>
    <table class="ref-table" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:16px 20px;">
          <p class="ref-label">رقم البلاغ</p>
          <p class="ref-val">${escapeHtml(reportRef)}</p>
        </td>
        <td style="padding:16px 20px;text-align:left;">
          ${refStatus}
        </td>
      </tr>
    </table>
    ${adminNoteBlock}
    <div class="btn-wrap">
      <a href="${dashboardUrl}" class="btn" style="${btnStyle}">${btnText}</a>
    </div>
    ${bottomNotice}
  `;

  const footer = `
    <p>تلقّيت هذا البريد بخصوص بلاغ مسجّل في حسابك.</p>
    <p>© ${new Date().getFullYear()} CheckMyDevice · <a href="${escapeHtml(frontendUrl('privacy'))}">سياسة الخصوصية</a> · <a href="mailto:support@checkmydevice.online">الدعم الفني</a></p>
  `;

  await safeSend({
    from:    FROM(),
    to:      email,
    subject: `${isApproved ? '✅ تم قبول' : '❌ تم رفض'} بلاغك — CheckMyDevice`,
    html:    layout(isApproved ? '#36784d' : '#a83b43', isApproved ? 'تم قبول بلاغ جهازك.' : 'يوجد تحديث بخصوص بلاغ جهازك.', content, footer),
  });
}

export async function sendSystemTestEmail(email) {
  const sentAt = new Date().toLocaleString('ar-EG', { dateStyle: 'long', timeStyle: 'short' });
  const content = `
    <p class="greeting">تم إعداد البريد بنجاح ✅</p>
    <p class="lead">هذه رسالة اختبار من منصة CheckMyDevice للتأكد من اتصال خدمة البريد الإلكتروني.</p>
    <div class="info-card">
      <p class="card-label">تفاصيل الاختبار</p>
      <div class="card-row"><span class="card-key">النتيجة</span><span class="card-val">تم إرسال الرسالة</span></div>
      <div class="card-row"><span class="card-key">الوقت</span><span class="card-val">${escapeHtml(sentAt)}</span></div>
    </div>
  `;
  const footer = `<p>أُرسلت هذه الرسالة بناءً على طلب مسؤول النظام.</p><p>© ${new Date().getFullYear()} CheckMyDevice</p>`;

  return safeSend({
    from: FROM(),
    to: email,
    subject: '✅ اختبار البريد الإلكتروني — CheckMyDevice',
    html: layout('#315f9f', 'تم إعداد إرسال البريد الإلكتروني في CheckMyDevice.', content, footer),
  });
}
