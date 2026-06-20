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
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm max-w-md w-full text-center py-12 px-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <Mail className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">تحقق من بريدك الإلكتروني</h2>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          أرسلنا رابط تفعيل إلى بريدك الإلكتروني.<br />
          اضغط على الرابط لإكمال التسجيل والبدء فوراً.
        </p>
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 mb-6 text-right">
          <span className="mt-0.5 flex-shrink-0">💡</span>
          <span>لم يصلك الإيميل؟ تحقق من مجلد <strong>Spam</strong> أو <strong>Junk</strong>، أو اطلب إرسال رابط جديد من إعدادات حسابك.</span>
        </div>
        <div className="flex gap-3 justify-center">
          <Link to="/login" className="btn-primary inline-flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <img src="/Logo.png" alt="CheckMyDevice"
            className="w-16 h-16 object-contain rounded-2xl mx-auto mb-5 shadow-sm" />
          <h1 className="text-2xl font-bold text-gray-900">إنشاء حساب جديد</h1>
          <p className="text-gray-400 text-sm mt-1.5">ابدأ الآن مجانًا — بدون بطاقة ائتمانية</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
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
            <div className="grid grid-cols-2 gap-3">
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

          <Link to="/login"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border-2 border-primary-100 text-primary-700 text-sm font-semibold hover:bg-primary-50 transition-colors">
            تسجيل الدخول
          </Link>
        </div>

      </div>
    </div>
  );
}
