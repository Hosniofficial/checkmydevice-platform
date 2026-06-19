import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Shield } from 'lucide-react';
import { loginSchema } from '../lib/validation.js';
import { Field, Spinner } from '../components/ui/index.jsx';
import PasswordInput from '../components/ui/PasswordInput.jsx';
import { useAuthStore } from '../store/auth.store.js';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuthStore();
  const navigate    = useNavigate();
  const location    = useLocation();

  // ✅ ALL hooks must be called before any early return
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    mode:     'onBlur',
  });

  // Redirect already-logged-in users (after all hooks)
  if (user) {
    const dest = ['admin', 'super_admin'].includes(user.role) ? '/admin' : '/dashboard';
    return <Navigate to={dest} replace />;
  }

  // Redirect to original page after login
  const from = location.state?.from || null;

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const user = await login(data.email, data.password);
      toast.success(`مرحباً ${user.full_name || ''}!`);
      if (from) navigate(from, { replace: true });
      else navigate(user.role === 'admin' || user.role === 'super_admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error?.message_ar || 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold">تسجيل الدخول</h1>
          <p className="text-gray-500 text-sm mt-1">أهلاً بك في CheckMyDevice</p>
        </div>

        {/* Redirect notice */}
        {from && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700 mb-4 text-center">
            سجّل دخولك للوصول إلى هذه الصفحة
          </div>
        )}

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <Field label="البريد الإلكتروني" error={errors.email?.message} required>
              <input
                type="email"
                dir="ltr"
                placeholder="email@example.com"
                className={`input ${errors.email ? 'border-red-400' : ''}`}
                {...register('email')}
              />
            </Field>

            <div className="space-y-1">
              <PasswordInput
                register={register}
                name="password"
                label="كلمة المرور"
                error={errors.password?.message}
                required
              />
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-xs text-primary-700 hover:underline mt-1 inline-block">
                  نسيت كلمة المرور؟
                </Link>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <Spinner size={20} /> : null}
              {loading ? 'جاري تسجيل الدخول...' : 'دخول'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ليس لديك حساب؟{' '}
            <Link to="/register" className="text-primary-700 font-semibold hover:underline">سجّل مجاناً</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
