import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, LogIn, ArrowLeft, FileText, Search, ShieldCheck } from 'lucide-react';
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
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <div className="grid items-center gap-8 lg:grid-cols-2">
        <section className="surface-card order-1 p-5 sm:p-7">
          <div className="mb-6">
            <p className="text-sm font-semibold text-accent-500">حسابك في المنصة</p>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">تسجيل الدخول</h1>
            <p className="mt-2 text-sm leading-6 text-gray-500">أدخل بيانات حسابك لمتابعة استخدامك للمنصة.</p>
          </div>

          {from && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-primary-100 bg-primary-50 px-4 py-3 text-sm text-primary-800">
              <ArrowLeft className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              سجّل دخولك للوصول إلى هذه الصفحة
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <Field label="البريد الإلكتروني" error={errors.email?.message} required>
              <div className="relative">
                <Mail className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                <input
                  type="email"
                  dir="ltr"
                  placeholder="email@example.com"
                  className={`input pr-9 ${errors.email ? 'border-red-400' : ''}`}
                  {...register('email')}
                />
              </div>
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
                <Link to="/forgot-password"
                  className="mt-1.5 inline-block text-xs text-primary-700 transition-colors hover:text-primary-900 hover:underline">
                  نسيت كلمة المرور؟
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex w-full items-center justify-center gap-2 py-3 text-base disabled:opacity-70">
              {loading
                ? <><Spinner size={20} /> جاري تسجيل الدخول...</>
                : <><LogIn className="h-5 w-5" /> دخول</>}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-500">ليس لديك حساب؟</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <Link to="/register" className="btn-outline flex w-full items-center justify-center py-2.5 text-sm">
            إنشاء حساب مجاني
          </Link>
        </section>

        <aside className="order-2 rounded-3xl bg-[#f0eee7] p-6 sm:p-8">
          <img src="/Logo.png" alt="" className="mb-6 h-12 w-12 object-contain" />
          <p className="text-sm font-semibold text-primary-700">CheckMyDevice</p>
          <h2 className="mt-2 max-w-md text-2xl font-bold leading-relaxed text-primary-900">
            تابع بلاغاتك وعمليات البحث من مكان واحد
          </h2>
          <p className="mt-3 text-sm leading-7 text-gray-600">
            سجّل الدخول للوصول إلى أدوات حسابك ومتابعة حالة البلاغات التي أرسلتها.
          </p>
          <div className="mt-7 space-y-4 border-t border-[#dedbd2] pt-5">
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <FileText className="h-4 w-4 flex-shrink-0 text-primary-700" aria-hidden="true" />
              متابعة البلاغات المسجلة في حسابك
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <Search className="h-4 w-4 flex-shrink-0 text-primary-700" aria-hidden="true" />
              الوصول إلى أدوات البحث المتاحة
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <ShieldCheck className="h-4 w-4 flex-shrink-0 text-primary-700" aria-hidden="true" />
              مراجعة بيانات التواصل وإعدادات الحساب
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
