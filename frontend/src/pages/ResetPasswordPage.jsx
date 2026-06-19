import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, XCircle, KeyRound, ArrowRight } from 'lucide-react';
import { resetPasswordSchema } from '../lib/validation.js';
import { Spinner } from '../components/ui/index.jsx';
import PasswordInput from '../components/ui/PasswordInput.jsx';
import api from '../lib/api.js';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [searchParams]    = useSearchParams();
  const navigate          = useNavigate();
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);
  const [tokenValid, setTokenValid] = useState(true); // assume valid until proven otherwise

  const token = searchParams.get('token');

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
  });

  // Redirect if no token
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
    }
  }, [token]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        password: data.password,
      });
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const code = err.response?.data?.error?.code;
      if (code === 'INVALID_TOKEN') {
        setTokenValid(false);
      } else {
        toast.error(err.response?.data?.error?.message_ar || 'حدث خطأ، حاول مجدداً');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Invalid / expired token ───────────────────────────────────
  if (!tokenValid) return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card max-w-md w-full text-center py-10">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <XCircle className="w-10 h-10 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">رابط غير صالح</h2>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية.<br />
          الرابط صالح لمدة ساعة واحدة فقط.
        </p>
        <Link to="/forgot-password" className="btn-primary inline-block">
          طلب رابط جديد
        </Link>
        <div className="mt-4">
          <Link to="/login" className="text-sm text-gray-400 hover:text-gray-600">
            العودة لتسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );

  // ── Done ──────────────────────────────────────────────────────
  if (done) return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card max-w-md w-full text-center py-10">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">تم تغيير كلمة المرور!</h2>
        <p className="text-gray-500 text-sm mb-6">
          تم تحديث كلمة المرور بنجاح.<br />
          سيتم تحويلك لصفحة تسجيل الدخول خلال ثوانٍ...
        </p>
        <Link to="/login" className="btn-primary inline-block">
          تسجيل الدخول الآن
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold">تعيين كلمة مرور جديدة</h1>
          <p className="text-gray-500 text-sm mt-1">اختر كلمة مرور قوية لحماية حسابك</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* New password with strength meter */}
            <PasswordInput
              register={register}
              name="password"
              label="كلمة المرور الجديدة"
              placeholder="اختر كلمة مرور قوية"
              error={errors.password?.message}
              showStrength
              watch={watch}
              required
            />

            {/* Confirm */}
            <PasswordInput
              register={register}
              name="confirm_password"
              label="تأكيد كلمة المرور"
              placeholder="أعد إدخال كلمة المرور الجديدة"
              error={errors.confirm_password?.message}
              required
            />

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <Spinner size={20} /> : <KeyRound className="w-4 h-4" />}
              {loading ? 'جاري الحفظ...' : 'حفظ كلمة المرور الجديدة'}
            </button>
          </form>

          <div className="mt-5 text-center">
            <Link to="/login"
              className="text-sm text-gray-500 hover:text-primary-700 flex items-center justify-center gap-1 transition-colors">
              <ArrowRight className="w-4 h-4" />
              العودة لتسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
