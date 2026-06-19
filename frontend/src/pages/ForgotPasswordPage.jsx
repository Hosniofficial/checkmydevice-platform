import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowRight, CheckCircle, KeyRound } from 'lucide-react';
import { forgotPasswordSchema } from '../lib/validation.js';
import { Field, Spinner } from '../components/ui/index.jsx';
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
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card max-w-md w-full text-center py-10">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">تم إرسال الرابط!</h2>
        <p className="text-gray-500 text-sm mb-2">
          إذا كان البريد الإلكتروني مسجلاً في نظامنا، سيصلك رابط إعادة تعيين كلمة المرور على:
        </p>
        <p className="font-semibold text-primary-700 mb-6 dir-ltr" dir="ltr">{sentEmail}</p>

        <div className="space-y-3 text-xs text-gray-500 bg-gray-50 rounded-xl p-4 text-right mb-6">
          <p className="font-medium text-gray-700">ملاحظات مهمة:</p>
          <p>• الرابط صالح لمدة ساعة واحدة فقط</p>
          <p>• تحقق من مجلد Spam أو Junk إذا لم يصلك</p>
          <p>• يمكنك طلب رابط جديد بعد 5 دقائق</p>
        </div>

        <div className="flex gap-3 justify-center">
          <Link to="/login" className="btn-primary text-sm py-2 px-5">
            العودة لتسجيل الدخول
          </Link>
          <button onClick={() => setSent(false)} className="btn-outline text-sm py-2 px-5">
            إعادة الإرسال
          </button>
        </div>
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
          <h1 className="text-2xl font-bold">نسيت كلمة المرور؟</h1>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">
            أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <Field label="البريد الإلكتروني" error={errors.email?.message} required>
              <div className="relative">
                <Mail className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  dir="ltr"
                  placeholder="email@example.com"
                  className={`input pr-9 ${errors.email ? 'border-red-400' : ''}`}
                  {...register('email')}
                />
              </div>
            </Field>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <Spinner size={20} /> : <Mail className="w-4 h-4" />}
              {loading ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين'}
            </button>
          </form>

          <div className="mt-5 text-center">
            <Link to="/login" className="text-sm text-gray-500 hover:text-primary-700 flex items-center justify-center gap-1 transition-colors">
              <ArrowRight className="w-4 h-4" />
              العودة لتسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
