import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowRight, CheckCircle, KeyRound } from 'lucide-react';
import { forgotPasswordSchema } from '../lib/validation.js';
import { Spinner } from '../components/ui/index.jsx';
import api from '../lib/api.js';

export default function ForgotPasswordPage() {
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setSentEmail(data.email);
      setSent(true);
    } catch {
      // Always show success to prevent email enumeration
      setSentEmail(data.email);
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) return (
    <div className="flex min-h-[70vh] items-center justify-center bg-[#f7f6f2] px-4 py-10">
      <div className="surface-card w-full max-w-lg px-5 py-9 text-center sm:px-8 sm:py-11" role="status">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50">
          <CheckCircle className="h-9 w-9 text-green-600" aria-hidden="true" />
        </div>
        <p className="text-sm font-semibold text-green-700">خطوة استعادة الحساب</p>
        <h1 className="mb-2 mt-1 text-2xl font-bold text-gray-900">تحقق من بريدك الإلكتروني</h1>
        <p className="mb-2 text-sm leading-6 text-gray-500">
          إذا كان البريد الإلكتروني مسجلاً في نظامنا، سيصلك رابط إعادة تعيين كلمة المرور على:
        </p>
        <p className="mb-6 break-all font-semibold text-primary-700" dir="ltr">{sentEmail}</p>

        <div className="mb-6 space-y-3 rounded-2xl border border-[#e7e4dc] bg-[#fcfbf8] p-4 text-right text-xs leading-5 text-gray-500">
          <p className="font-medium text-gray-700">ملاحظات مهمة:</p>
          <p>الرابط صالح لمدة ساعة واحدة فقط.</p>
          <p>تحقق من مجلد Spam أو Junk إذا لم يصلك.</p>
          <p>يمكنك طلب رابط جديد بعد 5 دقائق.</p>
        </div>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/login" className="btn-primary px-5 py-2.5 text-sm">
            العودة لتسجيل الدخول
          </Link>
          <button onClick={() => setSent(false)} className="btn-outline px-5 py-2.5 text-sm">
            إعادة الإرسال
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-[#f7f6f2] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
            <KeyRound className="h-7 w-7 text-primary-700" aria-hidden="true" />
          </div>
          <p className="text-sm font-semibold text-accent-500">استعادة الحساب</p>
          <h1 className="mt-1 text-2xl font-bold text-primary-900">نسيت كلمة المرور؟</h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور
          </p>
        </div>

        <div className="surface-card p-5 sm:p-7">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="space-y-1.5">
              <label htmlFor="forgot-password-email" className="block text-sm font-medium text-gray-700">
                البريد الإلكتروني <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                <input
                  id="forgot-password-email"
                  type="email"
                  dir="ltr"
                  placeholder="email@example.com"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'forgot-password-email-error' : undefined}
                  className={`input pr-9 ${errors.email ? 'border-red-400' : ''}`}
                  {...register('email')}
                />
              </div>
              {errors.email && <p id="forgot-password-email-error" role="alert" className="text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary flex min-h-12 w-full items-center justify-center gap-2">
              {loading ? <Spinner size={20} /> : <Mail className="w-4 h-4" />}
              {loading ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين'}
            </button>
          </form>

          <div className="mt-5 text-center">
            <Link to="/login" className="flex items-center justify-center gap-1 text-sm text-gray-500 transition-colors hover:text-primary-700">
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
              العودة لتسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
