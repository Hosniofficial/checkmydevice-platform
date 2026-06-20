import nodemailer from 'nodemailer';

// Create transporter lazily — env vars guaranteed loaded at call time
function getTransporter() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST  || 'smtp.gmail.com',
    port:   parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const FROM = () => process.env.EMAIL_FROM || 'CheckMyDevice <noreply@checkmydevice.com>';

export async function sendVerificationEmail(email, name, token) {
  const url         = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  const displayName = name || 'عزيزي المستخدم';
  await getTransporter().sendMail({
    from: FROM(), to: email,
    subject: '✅ تفعيل حسابك في CheckMyDevice',
    html: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>تفعيل الحساب</title>
</head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,sans-serif;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);max-width:560px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1B4F9B 0%,#2563EB 100%);padding:36px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:bold;letter-spacing:-0.5px;">CheckMyDevice</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">منصة فحص الأجهزة المحمولة</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <h2 style="margin:0 0 12px;color:#1a1a2e;font-size:20px;font-weight:bold;">مرحباً، ${displayName} 👋</h2>
            <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.7;">
              شكراً لتسجيلك في <strong>CheckMyDevice</strong>. أنت على بُعد خطوة واحدة من تفعيل حسابك والبدء في فحص الأجهزة.
            </p>

            <!-- CTA Button -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding:8px 0 28px;">
                  <a href="${url}"
                    style="display:inline-block;background:linear-gradient(135deg,#1B4F9B,#2563EB);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:10px;font-size:16px;font-weight:bold;letter-spacing:0.3px;">
                    تفعيل الحساب الآن
                  </a>
                </td>
              </tr>
            </table>

            <!-- Features -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8faff;border-radius:12px;overflow:hidden;margin-bottom:24px;">
              <tr>
                <td style="padding:20px 24px;">
                  <p style="margin:0 0 14px;color:#1B4F9B;font-size:14px;font-weight:bold;">بعد التفعيل يمكنك:</p>
                  <table cellpadding="0" cellspacing="0">
                    <tr><td style="padding:4px 0;color:#444;font-size:14px;">🔍 &nbsp;فحص أي جهاز عبر رقم IMEI قبل الشراء</td></tr>
                    <tr><td style="padding:4px 0;color:#444;font-size:14px;">📢 &nbsp;الإبلاغ عن الأجهزة المسروقة أو المفقودة</td></tr>
                    <tr><td style="padding:4px 0;color:#444;font-size:14px;">🔔 &nbsp;استقبال إشعارات فور البحث عن جهازك</td></tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Fallback link -->
            <p style="margin:0 0 8px;color:#888;font-size:13px;">إذا لم يعمل الزر، انسخ الرابط التالي في متصفحك:</p>
            <p style="margin:0 0 24px;word-break:break-all;">
              <a href="${url}" style="color:#1B4F9B;font-size:12px;text-decoration:none;">${url}</a>
            </p>

            <!-- Expiry notice -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8e6;border:1px solid #fde68a;border-radius:10px;">
              <tr>
                <td style="padding:12px 16px;color:#92400e;font-size:13px;">
                  ⚠️ &nbsp;هذا الرابط صالح لمدة <strong>24 ساعة</strong> فقط. إذا انتهت الصلاحية يمكنك طلب رابط جديد من إعدادات حسابك.
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f4f6fb;padding:24px 40px;text-align:center;border-top:1px solid #e8ecf4;">
            <p style="margin:0 0 6px;color:#999;font-size:12px;">إذا لم تقم بإنشاء هذا الحساب، يمكنك تجاهل هذا البريد بأمان.</p>
            <p style="margin:0;color:#bbb;font-size:11px;">
              © 2026 CheckMyDevice — جميع الحقوق محفوظة
              &nbsp;·&nbsp;
              <a href="${process.env.FRONTEND_URL}/privacy" style="color:#bbb;text-decoration:none;">سياسة الخصوصية</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}

export async function sendPasswordResetEmail(email, name, token) {
  const url         = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const displayName = name || 'عزيزي المستخدم';
  await getTransporter().sendMail({
    from: FROM(), to: email,
    subject: '🔐 إعادة تعيين كلمة المرور — CheckMyDevice',
    html: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,sans-serif;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);max-width:560px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1B4F9B 0%,#2563EB 100%);padding:36px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:bold;">CheckMyDevice</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">منصة فحص الأجهزة المحمولة</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <h2 style="margin:0 0 12px;color:#1a1a2e;font-size:20px;">مرحباً، ${displayName}</h2>
            <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.7;">
              تلقّينا طلباً لإعادة تعيين كلمة المرور لحسابك. اضغط على الزر أدناه لإنشاء كلمة مرور جديدة.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding:8px 0 28px;">
                  <a href="${url}"
                    style="display:inline-block;background:linear-gradient(135deg,#dc2626,#ef4444);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:10px;font-size:16px;font-weight:bold;">
                    إعادة تعيين كلمة المرور
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 8px;color:#888;font-size:13px;">إذا لم يعمل الزر، انسخ الرابط التالي:</p>
            <p style="margin:0 0 24px;word-break:break-all;">
              <a href="${url}" style="color:#1B4F9B;font-size:12px;">${url}</a>
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8e6;border:1px solid #fde68a;border-radius:10px;">
              <tr>
                <td style="padding:12px 16px;color:#92400e;font-size:13px;">
                  ⚠️ &nbsp;هذا الرابط صالح لمدة <strong>ساعة واحدة</strong> فقط. إذا لم تطلب إعادة التعيين، تجاهل هذا البريد — حسابك بأمان.
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f4f6fb;padding:24px 40px;text-align:center;border-top:1px solid #e8ecf4;">
            <p style="margin:0;color:#bbb;font-size:11px;">
              © 2026 CheckMyDevice — جميع الحقوق محفوظة
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}

export async function sendDeviceSearchedAlert(ownerEmail, ownerName, deviceInfo, searcherInfo) {
  await getTransporter().sendMail({
    from: FROM(), to: ownerEmail,
    subject: '⚠️ تنبيه: تم البحث عن جهازك المسروق',
    html: `
      <div dir="rtl" style="font-family:Arial;max-width:480px;margin:auto">
        <h2 style="color:#C0392B">تنبيه هام</h2>
        <p>مرحباً ${ownerName || ''},</p>
        <p>قام شخص ما بالبحث عن جهازك المسروق على منصة CheckMyDevice.</p>
        <div style="background:#FEF9E7;border-right:4px solid #E67E22;padding:12px;margin:16px 0">
          <strong>تفاصيل الجهاز:</strong><br>
          الماركة: ${deviceInfo.brand} ${deviceInfo.model}<br>
          IMEI: ${deviceInfo.imei.replace(/.(?=.{4})/g, '*')}
        </div>
        <div style="background:#EBF5FB;border-right:4px solid #1B4F9B;padding:12px;margin:16px 0">
          <strong>معلومات البحث:</strong><br>
          الوقت: ${new Date().toLocaleString('ar-EG')}<br>
          الدولة: ${searcherInfo.country || 'غير محدد'}
        </div>
        <p style="color:#888;font-size:12px">إذا عثرت على جهازك، يمكنك إلغاء البلاغ من حسابك.</p>
      </div>`,
  });
}

export async function sendReportStatusEmail(email, name, status, reportRef, adminNote) {
  const isApproved = status === 'approved';
  await getTransporter().sendMail({
    from: FROM(), to: email,
    subject: `${isApproved ? '✅' : '❌'} تحديث حالة بلاغك — CheckMyDevice`,
    html: `
      <div dir="rtl" style="font-family:Arial;max-width:480px;margin:auto">
        <h2 style="color:${isApproved ? '#1E8449' : '#C0392B'}">
          ${isApproved ? 'تم قبول بلاغك' : 'تم رفض بلاغك'}
        </h2>
        <p>مرحباً ${name || ''},</p>
        <p>رقم البلاغ: <strong>${reportRef}</strong></p>
        ${adminNote ? `<div style="background:#F4F6F7;padding:12px;border-radius:6px;margin:12px 0"><strong>ملاحظة الإدارة:</strong><br>${adminNote}</div>` : ''}
        <p>${isApproved
          ? 'تم إضافة جهازك إلى قاعدة بياناتنا وسيتم إبلاغك فور بحث أي شخص عنه.'
          : 'إذا كنت تعتقد أن هذا قرار خاطئ، يرجى التواصل مع الدعم.'
        }</p>
      </div>`,
  });
}
