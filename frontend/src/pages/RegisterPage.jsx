import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Shield, CheckCircle, Mail } from 'lucide-react';
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
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // ✅ ALL hooks before any early return
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    mode:     'onBlur',
    defaultValues: { country_code: 'EG' },
  });

  // Redirect already-logged-in users (after all hooks)
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
        full_name:    data.full_name || undefined,
        phone:        data.phone    || undefined,
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
      <div className="card max-w-md w-full text-center py-10">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <Mail className="w-10 h-10 text-green-600" />
        </div>
        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-1" />
        <h2 className="text-2xl font-bold mb-2">تحقق من بريدك الإلكتروني</h2>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          أرسلنا رابط تفعيل إلى بريدك الإلكتروني.<br />
          يرجى التحقق منه وضغط على رابط التفعيل لإكمال التسجيل.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 mb-6">
          لم يصلك الإيميل؟ تحقق من مجلد الـ Spam أو Junk
        </div>
        <Link to="/login" className="btn-primary inline-block">
          الذهاب لتسجيل الدخول
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold">إنشاء حساب جديد</h1>
          <p className="text-gray-500 text-sm mt-1">جرّب مجانًا فورًا — بدون بطاقة ائتمانية</p>
		  </div>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Full name */}
            <Field label="الاسم الكامل" error={errors.full_name?.message}>
              <input
                className={`input ${errors.full_name ? 'border-red-400' : ''}`}
                placeholder="محمد أحمد"
                {...register('full_name')}
              />
            </Field>

            {/* Email */}
            <Field label="البريد الإلكتروني" error={errors.email?.message} required>
              <input
                type="email"
                dir="ltr"
                className={`input ${errors.email ? 'border-red-400' : ''}`}
                placeholder="email@example.com"
                {...register('email')}
              />
            </Field>

            {/* Phone & Country */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="رقم الهاتف" error={errors.phone?.message}>
                <input
                  type="tel"
                  dir="ltr"
                  className={`input ${errors.phone ? 'border-red-400' : ''}`}
                  placeholder="+201001234567"
                  {...register('phone')}
                />
              </Field>
              <Field label="الدولة">
                <select className="input" {...register('country_code')}>
                  {COUNTRIES.map(({ code, name }) => (
                    <option key={code} value={code}>{name}</option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Password with strength meter */}
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

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <Spinner size={20} /> : null}
              {loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            لديك حساب؟{' '}
            <Link to="/login" className="text-primary-700 font-semibold hover:underline">سجّل دخولك</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
