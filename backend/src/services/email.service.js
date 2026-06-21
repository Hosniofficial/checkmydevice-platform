/**
 * Email Service — uses Resend API (HTTP-based, no SMTP ports needed)
 * Railway blocks outbound SMTP ports 25/465/587, so we use Resend instead.
 * Free tier: 3,000 emails/month — https://resend.com
 */
import { Resend } from 'resend';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = () => process.env.EMAIL_FROM || 'CheckMyDevice <onboarding@resend.dev>';

// ─── Shared Styles ────────────────────────────────────────────────
const BASE_STYLE = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #F1F5F9; font-family: 'IBM Plex Sans Arabic', Arial, sans-serif; direction: rtl; }
    .wrapper { background: #F1F5F9; padding: 48px 16px; }
    .card { background: #ffffff; border-radius: 16px; overflow: hidden; max-width: 580px; margin: 0 auto; border: 1px solid #E2E8F0; }
    .header { padding: 36px 48px 32px; text-align: center; }
    .logo { font-size: 20px; font-weight: 700; letter-spacing: -0.3px; color: #ffffff; margin: 0 0 4px; }
    .tagline { font-size: 11px; color: rgba(255,255,255,0.55); letter-spacing: 1px; text-transform: uppercase; margin: 0; }
    .body { padding: 40px 48px 36px; }
    .greeting { font-size: 17px; font-weight: 600; color: #0F172A; margin: 0 0 12px; }
    .lead { font-size: 14px; color: #64748B; line-height: 1.85; margin: 0 0 28px; }
    .divider { border: none; border-top: 1px solid #F1F5F9; margin: 0 0 28px; }
    .btn-wrap { text-align: center; margin: 0 0 32px; }
    .btn { display: inline-block; padding: 13px 36px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; letter-spacing: 0.1px; font-family: 'IBM Plex Sans Arabic', Arial, sans-serif; }
    .info-card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 20px 24px; margin: 0 0 20px; }
    .card-label { font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #94A3B8; margin: 0 0 14px; }
    .card-row { display: flex; justify-content: space-between; align-items: center; padding: 7px 0; border-bottom: 1px solid #F1F5F9; }
    .card-row:last-child { border-bottom: none; }
    .card-key { font-size: 13px; color: #64748B; }
    .card-val { font-size: 13px; font-weight: 600; color: #0F172A; }
    .card-mono { font-family: 'Courier New', monospace; font-size: 11px; letter-spacing: 1.5px; background: #E2E8F0; padding: 3px 10px; border-radius: 5px; color: #334155; }
    .notice { border-radius: 8px; padding: 13px 16px; font-size: 13px; line-height: 1.75; display: flex; gap: 10px; align-items: flex-start; }
    .notice-icon { flex-shrink: 0; font-size: 14px; margin-top: 1px; }
    .notice-warn { background: #FFFBEB; border: 1px solid #FDE68A; color: #78350F; }
    .notice-info { background: #EFF6FF; border: 1px solid #BFDBFE; color: #1E3A8A; }
    .notice-success { background: #F0FDF4; border: 1px solid #BBF7D0; color: #14532D; }
    .link-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px 16px; margin: 0 0 16px; }
    .link-label { font-size: 10px; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 5px; }
    .link-url { font-size: 11px; color: #3B82F6; word-break: break-all; font-family: monospace; }
    .badge { display: inline-block; font-size: 10px; font-weight: 700; padding: 3px 10px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 20px; }
    .stat-row { display: flex; gap: 12px; margin: 0 0 24px; }
    .stat { flex: 1; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px 16px; }
    .stat-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px; color: #94A3B8; margin: 0 0 4px; }
    .stat-val { font-size: 15px; font-weight: 600; color: #0F172A; }
    .ref-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 16px 20px; margin: 0 0 20px; display: flex; justify-content: space-between; align-items: center; }
    .ref-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px; color: #94A3B8; margin: 0 0 5px; }
    .ref-val { font-size: 22px; font-weight: 700; font-family: monospace; color: #0F172A; letter-spacing: 2px; }
    .ref-status { font-size: 11px; font-weight: 700; padding: 5px 14px; border-radius: 20px; }
    .ref-ok { background: #DCFCE7; color: #14532D; }
    .ref-no { background: #FEE2E2; color: #991B1B; }
    .footer { background: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 20px 48px; text-align: center; }
    .footer p { font-size: 11px; color: #CBD5E1; margin: 0 0 3px; line-height: 1.7; }
    .footer a { color: #94A3B8; text-decoration: none; }
    .feature-list { margin: 0 0 24px; }
    .feature { display: flex; gap: 14px; align-items: flex-start; padding: 11px 0; border-bottom: 1px solid #F1F5F9; }
    .feature:last-child { border-bottom: none; }
    .feature-icon { width: 34px; height: 34px; border-radius: 8px; background: #EFF6FF; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
    .feature-title { font-size: 13px; font-weight: 600; color: #0F172A; margin: 0 0 2px; }
    .feature-desc { font-size: 12px; color: #94A3B8; margin: 0; }
    .spacer { height: 16px; }
  </style>
`;

// ─── Layout wrapper ───────────────────────────────────────────────
function layout(headerBg, content, footerContent) {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>CheckMyDevice</title>
  ${BASE_STYLE}
</head>
<body>
<div class="wrapper">
  <div class="card">
    <div class="header" style="background:${headerBg};">
      <p class="logo">CheckMyDevice</p>
      <p class="tagline">منصة فحص الأجهزة المحمولة</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      ${footerContent}
    </div>
  </div>
</div>
</body>
</html>`;
}

// ─── Verification Email ───────────────────────────────────────────
export async function sendVerificationEmail(email, name, token) {
  const url         = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  const displayName = name || 'عزيزي المستخدم';

  const content = `
    <p class="greeting">مرحباً، ${displayName} 👋</p>
    <p class="lead">
      شكراً لتسجيلك في <strong>CheckMyDevice</strong>. حسابك جاهز تقريباً — كل ما تحتاجه هو تأكيد بريدك الإلكتروني للبدء.
    </p>
    <div class="btn-wrap">
      <a href="${url}" class="btn" style="background:#1E40AF;color:#ffffff;">تأكيد البريد الإلكتروني</a>
    </div>
    <hr class="divider">
    <div class="feature-list">
      <div class="feature">
        <div class="feature-icon">🔍</div>
        <div>
          <p class="feature-title">فحص الأجهزة</p>
          <p class="feature-desc">تحقق من أي جهاز عبر رقم IMEI قبل الشراء</p>
        </div>
      </div>
      <div class="feature">
        <div class="feature-icon">📢</div>
        <div>
          <p class="feature-title">الإبلاغ عن المسروقات</p>
          <p class="feature-desc">سجّل جهازك في قاعدة البيانات وأبلغ عنه فوراً</p>
        </div>
      </div>
      <div class="feature">
        <div class="feature-icon">🔔</div>
        <div>
          <p class="feature-title">تنبيهات لحظية</p>
          <p class="feature-desc">استقبل إشعاراً فور بحث أي شخص عن جهازك</p>
        </div>
      </div>
    </div>
    <div class="link-box">
      <p class="link-label">أو انسخ الرابط في متصفحك</p>
      <p class="link-url">${url}</p>
    </div>
    <div class="spacer"></div>
    <div class="notice notice-warn">
      <span class="notice-icon">⏱</span>
      <span>هذا الرابط صالح لمدة <strong>24 ساعة</strong> فقط.</span>
    </div>
  `;

  const footer = `
    <p>إذا لم تقم بإنشاء هذا الحساب، يمكنك تجاهل هذا البريد بأمان.</p>
    <p>© 2026 CheckMyDevice · <a href="${process.env.FRONTEND_URL}/privacy">سياسة الخصوصية</a></p>
  `;

  await getResend().emails.send({
    from:    FROM(),
    to:      email,
    subject: '✅ تأكيد بريدك الإلكتروني — CheckMyDevice',
    html:    layout('#0F172A', content, footer),
  });
}

// ─── Password Reset Email ─────────────────────────────────────────
export async function sendPasswordResetEmail(email, name, token) {
  const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const content = `
    <p class="greeting">إعادة تعيين كلمة المرور</p>
    <p class="lead">
      تلقّينا طلباً لإعادة تعيين كلمة المرور الخاصة بحساب
      <strong>${email}</strong>.
      اضغط على الزر أدناه لاختيار كلمة مرور جديدة.
    </p>
    <div class="btn-wrap">
      <a href="${url}" class="btn" style="background:#991B1B;color:#ffffff;">إعادة تعيين كلمة المرور</a>
    </div>
    <hr class="divider">
    <div class="notice notice-warn" style="margin-bottom:16px;">
      <span class="notice-icon">⏱</span>
      <span>هذا الرابط صالح لمدة <strong>ساعة واحدة</strong> فقط.</span>
    </div>
    <div class="link-box" style="margin-bottom:16px;">
      <p class="link-label">أو انسخ الرابط في متصفحك</p>
      <p class="link-url">${url}</p>
    </div>
    <div class="notice notice-info">
      <span class="notice-icon">ℹ️</span>
      <span>إذا لم تطلب إعادة التعيين، يمكنك تجاهل هذا البريد بأمان. حسابك لم يتأثر.</span>
    </div>
  `;

  const footer = `
    <p>طُلب هذا الإجراء بواسطة حساب مرتبط بهذا البريد الإلكتروني.</p>
    <p>© 2026 CheckMyDevice · <a href="${process.env.FRONTEND_URL}/privacy">سياسة الخصوصية</a></p>
  `;

  await getResend().emails.send({
    from:    FROM(),
    to:      email,
    subject: '🔐 إعادة تعيين كلمة المرور — CheckMyDevice',
    html:    layout('#7F1D1D', content, footer),
  });
}

// ─── Device Searched Alert ────────────────────────────────────────
export async function sendDeviceSearchedAlert(ownerEmail, ownerName, deviceInfo, searcherInfo) {
  const displayName  = ownerName || 'عزيزي المستخدم';
  const maskedImei   = (deviceInfo.imei || '').replace(/.(?=.{4})/g, '*');
  const searchTime   = new Date().toLocaleString('ar-EG', { dateStyle: 'long', timeStyle: 'short' });
  const country      = searcherInfo?.country || 'غير محدد';
  const dashboardUrl = `${process.env.FRONTEND_URL}/reports`;

  const content = `
    <span class="badge" style="background:#FFF7ED;color:#9A3412;border:1px solid #FED7AA;">⚠️ تنبيه نشاط</span>
    <p class="greeting">مرحباً، ${displayName}</p>
    <p class="lead">
      تم البحث عن جهازك المبلَّغ عنه على منصة <strong>CheckMyDevice</strong>.
      شخص ما يتحقق منه — ربما مشترٍ محتمل.
    </p>
    <div class="stat-row">
      <div class="stat">
        <p class="stat-label">الجهاز</p>
        <p class="stat-val">${deviceInfo.brand} ${deviceInfo.model}</p>
      </div>
      <div class="stat">
        <p class="stat-label">الدولة</p>
        <p class="stat-val">${country}</p>
      </div>
    </div>
    <div class="info-card">
      <p class="card-label">تفاصيل البحث</p>
      <div class="card-row">
        <span class="card-key">الجهاز</span>
        <span class="card-val">${deviceInfo.brand} ${deviceInfo.model}</span>
      </div>
      <div class="card-row">
        <span class="card-key">IMEI</span>
        <span class="card-mono">${maskedImei}</span>
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
      <span>إذا استردت جهازك، يمكنك <strong>إلغاء البلاغ</strong> من صفحة بلاغاتي في أي وقت.</span>
    </div>
  `;

  const footer = `
    <p>تلقّيت هذا البريد لأن جهازك مسجّل في قاعدة بياناتنا.</p>
    <p>© 2026 CheckMyDevice · <a href="${process.env.FRONTEND_URL}/reports">إدارة البلاغات</a></p>
  `;

  await getResend().emails.send({
    from:    FROM(),
    to:      ownerEmail,
    subject: '🔍 تنبيه: تم البحث عن جهازك — CheckMyDevice',
    html:    layout('#0F172A', content, footer),
  });
}

// ─── Report Status Email ──────────────────────────────────────────
export async function sendReportStatusEmail(email, name, status, reportRef, adminNote) {
  const displayName  = name || 'عزيزي المستخدم';
  const isApproved   = status === 'approved';
  const dashboardUrl = `${process.env.FRONTEND_URL}/reports`;

  const headerBg    = isApproved ? '#052e16' : '#450a0a';
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

  const adminNoteBlock = adminNote ? `
    <div class="info-card" style="margin-bottom:20px;">
      <p class="card-label">ملاحظة فريق المراجعة</p>
      <p style="font-size:13px;color:#334155;line-height:1.75;margin:0;">${adminNote}</p>
    </div>
  ` : '';

  const bottomNotice = isApproved ? `
    <div class="notice notice-info">
      <span class="notice-icon">📢</span>
      <span>شارك رابط البحث عن جهازك — كلما انتشر، زادت فرصة العثور عليه.</span>
    </div>
  ` : `
    <div class="notice notice-info">
      <span class="notice-icon">💬</span>
      <span>هل لديك استفسار؟ تواصل مع فريق الدعم على
        <a href="mailto:support@checkmydevice.online" style="color:#1E40AF;font-weight:600;">support@checkmydevice.online</a>
      </span>
    </div>
  `;

  const content = `
    <span class="badge" style="${badgeStyle}">${badgeText}</span>
    <p class="greeting">مرحباً، ${displayName}</p>
    <p class="lead">${bodyText}</p>
    <div class="ref-box">
      <div>
        <p class="ref-label">رقم البلاغ</p>
        <p class="ref-val">${reportRef}</p>
      </div>
      ${refStatus}
    </div>
    ${adminNoteBlock}
    <div class="btn-wrap">
      <a href="${dashboardUrl}" class="btn" style="${btnStyle}">${btnText}</a>
    </div>
    ${bottomNotice}
  `;

  const footer = `
    <p>تلقّيت هذا البريد بخصوص بلاغ مسجّل في حسابك.</p>
    <p>© 2026 CheckMyDevice · <a href="${process.env.FRONTEND_URL}/privacy">سياسة الخصوصية</a> · <a href="mailto:support@checkmydevice.online">الدعم الفني</a></p>
  `;

  await getResend().emails.send({
    from:    FROM(),
    to:      email,
    subject: `${isApproved ? '✅ تم قبول' : '❌ تم رفض'} بلاغك — CheckMyDevice`,
    html:    layout(headerBg, content, footer),
  });
}