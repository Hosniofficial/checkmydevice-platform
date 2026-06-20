import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, LogIn, ArrowLeft } from 'lucide-react';
import { loginSchema } from '../lib/validation.js';
import { Field, Spinner } from '../components/ui/index.jsx';
import PasswordInput from '../components/ui/PasswordInput.jsx';
import { useAuthStore } from '../store/auth.store.js';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuthStore();
  const navigate  = useNavigate();
  const location  = useLocation();

  // ✅ ALL hooks before any early return
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    mode:     'onBlur',
  });

  if (user) {
    const dest = ['admin', 'super_admin'].includes(user.role) ? '/admin' : '/dashboard';
    return <Navigate to={dest} replace />;
  }

  const from = location.state?.from || null;

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const user = await login(data.email, data.password);
      toast.success(`مرحباً ${user.full_name || ''}!`);
      if (from) navigate(from, { replace: true });
      else navigate(['admin', 'super_admin'].includes(user.role) ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error?.message_ar || 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <img src="/Logo.png" alt="CheckMyDevice"
            className="w-16 h-16 object-contain rounded-2xl mx-auto mb-5 shadow-sm" />
          <h1 className="text-2xl font-bold text-gray-900">تسجيل الدخول</h1>
          <p className="text-gray-400 text-sm mt-1.5">أهلاً بك في CheckMyDevice</p>
        </div>

        {/* Redirect notice */}
        {from && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700 mb-5">
            <ArrowLeft className="w-4 h-4 flex-shrink-0" />
            سجّل دخولك للوصول إلى هذه الصفحة
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

            {/* Email */}
            <Field label="البريد الإلكتروني" error={errors.email?.message} required>
              <div className="relative">
                <Mail className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  dir="ltr"
                  placeholder="email@example.com"
                  className={`input pr-9 ${errors.email ? 'border-red-400' : ''}`}
                  {...register('email')}
                />
              </div>
            </Field>

            {/* Password */}
            <div className="space-y-1">
              <PasswordInput
                register={register}
                name="password"
                label="كلمة المرور"
                error={errors.password?.message}
                required
              />
              <div className="flex justify-end">
                <Link to="/forgot-password"
                  className="text-xs text-primary-700 hover:text-primary-900 hover:underline mt-1.5 inline-block transition-colors">
                  نسيت كلمة المرور؟
                </Link>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base disabled:opacity-70">
              {loading
                ? <><Spinner size={20} /> جاري تسجيل الدخول...</>
                : <><LogIn className="w-5 h-5" /> دخول</>}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">ليس لديك حساب؟</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <Link to="/register"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border-2 border-primary-100 text-primary-700 text-sm font-semibold hover:bg-primary-50 transition-colors">
            إنشاء حساب مجاني
          </Link>
        </div>

      </div>
    </div>
  );
}
