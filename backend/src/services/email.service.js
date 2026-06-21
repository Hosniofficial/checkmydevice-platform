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

// ─── Verification Email ───────────────────────────────────────────
export async function sendVerificationEmail(email, name, token) {
  const url         = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  const displayName = name || 'عزيزي المستخدم';

  await getResend().emails.send({
    from:    FROM(),
    to:      email,
    subject: '✅ تفعيل حسابك في CheckMyDevice',
    html: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,sans-serif;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);max-width:560px;width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#1B4F9B 0%,#2563EB 100%);padding:36px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:bold;">CheckMyDevice</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">منصة فحص الأجهزة المحمولة</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 32px;">
            <h2 style="margin:0 0 12px;color:#1a1a2e;font-size:20px;font-weight:bold;">مرحباً، ${displayName} 👋</h2>
            <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.7;">
              شكراً لتسجيلك في <strong>CheckMyDevice</strong>. أنت على بُعد خطوة واحدة من تفعيل حسابك والبدء في فحص الأجهزة.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding:8px 0 28px;">
                  <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#1B4F9B,#2563EB);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:10px;font-size:16px;font-weight:bold;">
                    تفعيل الحساب الآن
                  </a>
                </td>
              </tr>
            </table>
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
            <p style="margin:0 0 8px;color:#888;font-size:13px;">إذا لم يعمل الزر، انسخ الرابط في متصفحك:</p>
            <p style="margin:0 0 24px;word-break:break-all;">
              <a href="${url}" style="color:#1B4F9B;font-size:12px;">${url}</a>
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8e6;border:1px solid #fde68a;border-radius:10px;">
              <tr>
                <td style="padding:12px 16px;color:#92400e;font-size:13px;">
                  ⚠️ &nbsp;هذا الرابط صالح لمدة <strong>24 ساعة</strong> فقط.
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#f4f6fb;padding:24px 40px;text-align:center;border-top:1px solid #e8ecf4;">
            <p style="margin:0 0 6px;color:#999;font-size:12px;">إذا لم تقم بإنشاء هذا الحساب، يمكنك تجاهل هذا البريد.</p>
            <p style="margin:0;color:#bbb;font-size:11px;">© 2026 CheckMyDevice — جميع الحقوق محفوظة</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}

// ─── Password Reset Email ─────────────────────────────────────────
export async function sendPasswordResetEmail(email, name, token) {
  const url         = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const displayName = name || 'عزيزي المستخدم';

  await getResend().emails.send({
    from:    FROM(),
    to:      email,
    subject: '🔐 إعادة تعيين كلمة المرور — CheckMyDevice',
    html: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,sans-serif;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);max-width:560px;width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#1B4F9B 0%,#2563EB 100%);padding:36px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:bold;">CheckMyDevice</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 32px;">
            <h2 style="margin:0 0 12px;color:#1a1a2e;font-size:20px;">مرحباً، ${displayName}</h2>
            <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.7;">
              تلقّينا طلباً لإعادة تعيين كلمة المرور لحسابك.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding:8px 0 28px;">
                  <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#dc2626,#ef4444);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:10px;font-size:16px;font-weight:bold;">
                    إعادة تعيين كلمة المرور
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 8px;color:#888;font-size:13px;">أو انسخ الرابط:</p>
            <p style="margin:0 0 24px;word-break:break-all;">
              <a href="${url}" style="color:#1B4F9B;font-size:12px;">${url}</a>
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8e6;border:1px solid #fde68a;border-radius:10px;">
              <tr>
                <td style="padding:12px 16px;color:#92400e;font-size:13px;">
                  ⚠️ &nbsp;صالح لمدة <strong>ساعة واحدة</strong>. إذا لم تطلبه، تجاهل هذا البريد.
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#f4f6fb;padding:20px 40px;text-align:center;border-top:1px solid #e8ecf4;">
            <p style="margin:0;color:#bbb;font-size:11px;">© 2026 CheckMyDevice</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}

// ─── Device Searched Alert ────────────────────────────────────────
export async function sendDeviceSearchedAlert(ownerEmail, ownerName, deviceInfo, searcherInfo) {
  const displayName  = ownerName || 'عزيزي المستخدم';
  const maskedImei   = (deviceInfo.imei || '').replace(/.(?=.{4})/g, '*');
  const searchTime   = new Date().toLocaleString('ar-EG', { dateStyle: 'full', timeStyle: 'short' });
  const country      = searcherInfo?.country || 'غير محدد';
  const dashboardUrl = `${process.env.FRONTEND_URL}/reports`;

  await getResend().emails.send({
    from:    FROM(),
    to:      ownerEmail,
    subject: '🔍 تنبيه: تم البحث عن جهازك — CheckMyDevice',
    html: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,sans-serif;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);max-width:560px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1B4F9B 0%,#2563EB 100%);padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:bold;">CheckMyDevice</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">منصة فحص الأجهزة المحمولة</p>
          </td>
        </tr>

        <!-- Alert Banner -->
        <tr>
          <td style="background:#FFF3CD;padding:16px 40px;border-bottom:1px solid #FBBF24;">
            <p style="margin:0;color:#92400E;font-size:14px;font-weight:bold;text-align:center;">
              ⚠️ &nbsp;تم البحث عن جهازك المبلَّغ عنه
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px 28px;">
            <p style="margin:0 0 20px;color:#1a1a2e;font-size:16px;font-weight:bold;">مرحباً، ${displayName}</p>
            <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.8;">
              قام شخص ما بالبحث عن جهازك على منصة <strong>CheckMyDevice</strong>.
              هذا يعني أن شخصاً ما يتحقق منه — ربما من يريد شراءه.
            </p>

            <!-- Device Info Card -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0F7FF;border:1px solid #BFDBFE;border-radius:12px;margin-bottom:20px;">
              <tr>
                <td style="padding:18px 20px;">
                  <p style="margin:0 0 12px;color:#1B4F9B;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;">معلومات الجهاز</p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:5px 0;color:#374151;font-size:14px;width:40%;"><strong>الجهاز</strong></td>
                      <td style="padding:5px 0;color:#1a1a2e;font-size:14px;">${deviceInfo.brand} ${deviceInfo.model}</td>
                    </tr>
                    <tr>
                      <td style="padding:5px 0;color:#374151;font-size:14px;"><strong>IMEI</strong></td>
                      <td style="padding:5px 0;color:#1a1a2e;font-size:14px;font-family:monospace;">${maskedImei}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Search Info Card -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:12px;margin-bottom:28px;">
              <tr>
                <td style="padding:18px 20px;">
                  <p style="margin:0 0 12px;color:#6B7280;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;">تفاصيل البحث</p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:5px 0;color:#374151;font-size:14px;width:40%;"><strong>الوقت</strong></td>
                      <td style="padding:5px 0;color:#1a1a2e;font-size:14px;">${searchTime}</td>
                    </tr>
                    <tr>
                      <td style="padding:5px 0;color:#374151;font-size:14px;"><strong>الدولة</strong></td>
                      <td style="padding:5px 0;color:#1a1a2e;font-size:14px;">${country}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding-bottom:24px;">
                  <a href="${dashboardUrl}" style="display:inline-block;background:linear-gradient(135deg,#1B4F9B,#2563EB);color:#ffffff;text-decoration:none;padding:13px 36px;border-radius:10px;font-size:15px;font-weight:bold;">
                    عرض بلاغاتي
                  </a>
                </td>
              </tr>
            </table>

            <!-- Info Note -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px;">
              <tr>
                <td style="padding:14px 18px;color:#166534;font-size:13px;line-height:1.6;">
                  💡 &nbsp;إذا استردت جهازك، يمكنك <strong>إلغاء البلاغ</strong> من صفحة بلاغاتي حتى لا تزعج المشترين البرياء.
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f4f6fb;padding:22px 40px;text-align:center;border-top:1px solid #e8ecf4;">
            <p style="margin:0 0 4px;color:#999;font-size:12px;">تلقّيت هذا البريد لأن جهازك مسجّل في قاعدة بياناتنا.</p>
            <p style="margin:0;color:#bbb;font-size:11px;">© 2026 CheckMyDevice — جميع الحقوق محفوظة</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}

// ─── Report Status Email ──────────────────────────────────────────
export async function sendReportStatusEmail(email, name, status, reportRef, adminNote) {
  const displayName = name || 'عزيزي المستخدم';
  const isApproved  = status === 'approved';
  const dashboardUrl = `${process.env.FRONTEND_URL}/reports`;

  const headerBg    = isApproved
    ? 'linear-gradient(135deg,#166534 0%,#16A34A 100%)'
    : 'linear-gradient(135deg,#991B1B 0%,#DC2626 100%)';
  const statusIcon  = isApproved ? '✅' : '❌';
  const statusTitle = isApproved ? 'تم قبول بلاغك' : 'تم رفض بلاغك';
  const statusColor = isApproved ? '#166534' : '#991B1B';
  const statusBg    = isApproved ? '#F0FDF4' : '#FEF2F2';
  const statusBorder = isApproved ? '#BBF7D0' : '#FECACA';

  const bodyText = isApproved
    ? 'تهانينا! تمت مراجعة بلاغك والموافقة عليه. تم إضافة جهازك إلى قاعدة بياناتنا وأصبح يظهر في نتائج البحث. سيتم إبلاغك فور بحث أي شخص عنه.'
    : 'نأسف لإبلاغك بأنه تم رفض بلاغك بعد المراجعة. يمكنك رفع بلاغ جديد بمستندات أوضح أو التواصل مع فريق الدعم لمزيد من المساعدة.';

  await getResend().emails.send({
    from:    FROM(),
    to:      email,
    subject: `${statusIcon} ${statusTitle} — CheckMyDevice`,
    html: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,sans-serif;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);max-width:560px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:${headerBg};padding:32px 40px;text-align:center;">
            <div style="font-size:40px;margin-bottom:10px;">${statusIcon}</div>
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:bold;">${statusTitle}</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">CheckMyDevice</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px 28px;">
            <p style="margin:0 0 20px;color:#1a1a2e;font-size:16px;font-weight:bold;">مرحباً، ${displayName}</p>
            <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.8;">${bodyText}</p>

            <!-- Report Ref Card -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:${statusBg};border:1px solid ${statusBorder};border-radius:12px;margin-bottom:20px;">
              <tr>
                <td style="padding:18px 20px;">
                  <p style="margin:0 0 8px;color:${statusColor};font-size:13px;font-weight:bold;">رقم البلاغ</p>
                  <p style="margin:0;color:#1a1a2e;font-size:18px;font-weight:bold;font-family:monospace;letter-spacing:1px;">${reportRef}</p>
                </td>
              </tr>
            </table>

            ${adminNote ? `
            <!-- Admin Note -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:12px;margin-bottom:20px;">
              <tr>
                <td style="padding:18px 20px;">
                  <p style="margin:0 0 10px;color:#374151;font-size:13px;font-weight:bold;">ملاحظة فريق المراجعة</p>
                  <p style="margin:0;color:#555;font-size:14px;line-height:1.7;">${adminNote}</p>
                </td>
              </tr>
            </table>
            ` : ''}

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding:8px 0 24px;">
                  <a href="${dashboardUrl}" style="display:inline-block;background:linear-gradient(135deg,#1B4F9B,#2563EB);color:#ffffff;text-decoration:none;padding:13px 36px;border-radius:10px;font-size:15px;font-weight:bold;">
                    ${isApproved ? 'عرض البلاغ المقبول' : 'رفع بلاغ جديد'}
                  </a>
                </td>
              </tr>
            </table>

            ${!isApproved ? `
            <!-- Support Link -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0F7FF;border:1px solid #BFDBFE;border-radius:10px;">
              <tr>
                <td style="padding:14px 18px;color:#1e40af;font-size:13px;line-height:1.6;">
                  💬 &nbsp;هل لديك استفسار؟ تواصل مع فريق الدعم على
                  <a href="mailto:support@checkmydevice.online" style="color:#1B4F9B;font-weight:bold;">support@checkmydevice.online</a>
                </td>
              </tr>
            </table>
            ` : `
            <!-- Share Hint -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px;">
              <tr>
                <td style="padding:14px 18px;color:#166534;font-size:13px;line-height:1.6;">
                  📢 &nbsp;شارك رابط البحث عن جهازك مع أصدقائك — كلما انتشر، زادت فرصة العثور عليه.
                </td>
              </tr>
            </table>
            `}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f4f6fb;padding:22px 40px;text-align:center;border-top:1px solid #e8ecf4;">
            <p style="margin:0 0 4px;color:#999;font-size:12px;">تلقّيت هذا البريد بخصوص بلاغ مسجّل في حسابك.</p>
            <p style="margin:0;color:#bbb;font-size:11px;">© 2026 CheckMyDevice — جميع الحقوق محفوظة</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}
