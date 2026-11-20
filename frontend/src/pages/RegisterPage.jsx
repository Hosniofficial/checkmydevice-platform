import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, Mail, User, Phone, Globe, UserPlus } from 'lucide-react';
import { registerSchema } from '../lib/validation.js';
import { Field, Spinner } from '../components/ui/index.jsx';
import PasswordInput from '../components/ui/PasswordInput.jsx';
import api from '../lib/api.js';
import toast from 'react-hot-toast';
import { COUNTRIES } from '../lib/countries.js';
import { useAuthStore } from '../store/auth.store.js';

export default function RegisterPage() {
  const [done, setDone]       = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  // ✅ ALL hooks before any early return
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    mode:     'onBlur',
    defaultValues: { country_code: 'EG' },
  });

  if (user) {
    const dest = ['admin', 'super_admin'].includes(user.role) ? '/admin' : '/dashboard';
    return <Navigate to={dest} replace />;
  }

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/auth/register', {
        email:        data.email,
        password:     data.password,
        full_name:    data.full_name    || undefined,
        phone:        data.phone        || undefined,
        country_code: data.country_code || 'EG',
      });
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.error?.message_ar || 'حدث خطأ، حاول مجدداً');
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ─────────────────────────────────────────────
  if (done) return (
    <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center px-4 py-10">
      <div className="surface-card w-full max-w-lg px-5 py-10 text-center sm:px-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <Mail className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">تحقق من بريدك الإلكتروني</h2>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          أرسلنا رابط تفعيل إلى بريدك الإلكتروني.<br />
          اضغط على الرابط لإكمال التسجيل والبدء فوراً.
        </p>
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-right text-xs text-amber-700">
          <span className="mt-0.5 flex-shrink-0">💡</span>
          <span>لم يصلك الإيميل؟ تحقق من مجلد <strong>Spam</strong> أو <strong>Junk</strong>، أو اطلب إرسال رابط جديد من إعدادات حسابك.</span>
        </div>
        <div className="flex justify-center">
          <Link to="/login" className="btn-primary inline-flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <div className="grid items-start gap-8 lg:grid-cols-2">
        <section className="order-1">
          <div className="mb-5">
            <p className="text-sm font-semibold text-accent-500">ابدأ باستخدام المنصة</p>
            <h1 className="mt-1 text-2xl font-bold text-primary-900">إنشاء حساب جديد</h1>
            <p className="mt-2 text-sm leading-6 text-gray-500">أنشئ حساباً لمتابعة بلاغاتك وإعداداتك في مكان واحد.</p>
          </div>

          <div className="surface-card p-5 sm:p-7">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

            {/* Full name */}
            <Field label="الاسم الكامل" error={errors.full_name?.message}>
              <div className="relative">
                <User className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  className={`input pr-9 ${errors.full_name ? 'border-red-400' : ''}`}
                  placeholder="محمد أحمد"
                  {...register('full_name')}
                />
              </div>
            </Field>

            {/* Email */}
            <Field label="البريد الإلكتروني" error={errors.email?.message} required>
              <div className="relative">
                <Mail className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  dir="ltr"
                  className={`input pr-9 ${errors.email ? 'border-red-400' : ''}`}
                  placeholder="email@example.com"
                  {...register('email')}
                />
              </div>
            </Field>

            {/* Phone & Country */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="رقم الهاتف" error={errors.phone?.message}>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="tel"
                    dir="ltr"
                    className={`input pr-9 ${errors.phone ? 'border-red-400' : ''}`}
                    placeholder="+201001234567"
                    {...register('phone')}
                  />
                </div>
              </Field>
              <Field label="الدولة">
                <div className="relative">
                  <Globe className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                  <select className="input pr-9" {...register('country_code')}>
                    {COUNTRIES.map(({ code, name }) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                </div>
              </Field>
            </div>

            {/* Password */}
            <PasswordInput
              register={register}
              name="password"
              label="كلمة المرور"
              placeholder="اختر كلمة مرور قوية"
              error={errors.password?.message}
              showStrength
              watch={watch}
              required
            />

            {/* Confirm password */}
            <PasswordInput
              register={register}
              name="confirm_password"
              label="تأكيد كلمة المرور"
              placeholder="أعد إدخال كلمة المرور"
              error={errors.confirm_password?.message}
              required
            />

            {/* Terms */}
            <p className="text-xs text-gray-400 leading-relaxed">
              بالتسجيل، أوافق على{' '}
              <Link to="/privacy" className="text-primary-700 hover:underline">سياسة الخصوصية</Link>
              {' '}و{' '}
              <Link to="/terms" className="text-primary-700 hover:underline">شروط الاستخدام</Link>
            </p>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base disabled:opacity-70">
              {loading
                ? <><Spinner size={20} /> جاري إنشاء الحساب...</>
                : <><UserPlus className="w-5 h-5" /> إنشاء الحساب</>}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">لديك حساب؟</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <Link to="/login" className="btn-outline flex w-full items-center justify-center py-2.5 text-sm">
            تسجيل الدخول
          </Link>
          </div>
        </section>

        <aside className="order-2 rounded-3xl bg-[#f0eee7] p-6 sm:p-8">
          <img src="/Logo.png" alt="" className="mb-6 h-12 w-12 object-contain" />
          <p className="text-sm font-semibold text-primary-700">خطوات بسيطة</p>
          <h2 className="mt-2 text-2xl font-bold leading-relaxed text-primary-900">من التسجيل إلى متابعة البلاغ</h2>
          <p className="mt-3 text-sm leading-7 text-gray-600">
            جهّز بيانات التواصل التي ترغب باستخدامها، ثم أكمل تفعيل بريدك الإلكتروني.
          </p>
          <ol className="mt-7 space-y-4 border-t border-[#dedbd2] pt-5">
            {[
              'أدخل بيانات الحساب الأساسية.',
              'فعّل بريدك الإلكتروني من الرابط المرسل إليك.',
              'تابع البلاغات وإعدادات الحساب بعد تسجيل الدخول.',
            ].map((item, index) => (
              <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-primary-700">
                  {index + 1}
                </span>
                <span className="pt-0.5 leading-6">{item}</span>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  );
}
