import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST  || 'smtp.gmail.com',
  port:   parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.EMAIL_FROM || 'CheckMyDevice <noreply@checkmydevice.com>';

export async function sendVerificationEmail(email, name, token) {
  const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: FROM, to: email,
    subject: 'تفعيل حسابك في CheckMyDevice',
    html: `
      <div dir="rtl" style="font-family:Arial;max-width:480px;margin:auto">
        <h2 style="color:#1B4F9B">مرحباً ${name || ''}</h2>
        <p>اضغط على الرابط التالي لتفعيل حسابك:</p>
        <a href="${url}" style="background:#1B4F9B;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">
          تفعيل الحساب
        </a>
        <p style="color:#888;font-size:12px;margin-top:20px">الرابط صالح لمدة 24 ساعة</p>
      </div>`,
  });
}

export async function sendPasswordResetEmail(email, name, token) {
  const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: FROM, to: email,
    subject: 'إعادة تعيين كلمة المرور — CheckMyDevice',
    html: `
      <div dir="rtl" style="font-family:Arial;max-width:480px;margin:auto">
        <h2 style="color:#1B4F9B">إعادة تعيين كلمة المرور</h2>
        <p>اضغط على الرابط التالي لإعادة تعيين كلمة المرور:</p>
        <a href="${url}" style="background:#E67E22;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">
          إعادة تعيين كلمة المرور
        </a>
        <p style="color:#888;font-size:12px;margin-top:20px">الرابط صالح لمدة ساعة واحدة</p>
      </div>`,
  });
}

export async function sendDeviceSearchedAlert(ownerEmail, ownerName, deviceInfo, searcherInfo) {
  await transporter.sendMail({
    from: FROM, to: ownerEmail,
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
  await transporter.sendMail({
    from: FROM, to: email,
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
