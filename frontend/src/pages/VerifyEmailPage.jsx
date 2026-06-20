import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import api from '../lib/api.js';
import { useAuthStore } from '../store/auth.store.js';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading | success | already | error
  const token   = searchParams.get('token');
  const { user } = useAuthStore();

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    api.get(`/auth/verify-email/${token}`)
      .then(() => setStatus('success'))
      .catch(err => {
        const code = err.response?.data?.error?.code;
        // Token used before = already verified (user sees ✓ in profile)
        if (code === 'INVALID_TOKEN' && user?.email_verified) {
          setStatus('already');
        } else {
          setStatus('error');
        }
      });
  }, [token]);

  if (status === 'loading') return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center">
        <Loader className="w-12 h-12 text-primary-700 animate-spin mx-auto mb-4" />
        <p className="text-gray-500">جاري التحقق من الرابط...</p>
      </div>
    </div>
  );

  if (status === 'success') return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card max-w-md w-full text-center py-10">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-green-700">تم تفعيل حسابك!</h2>
        <p className="text-gray-500 text-sm mb-6">
          تم التحقق من بريدك الإلكتروني بنجاح.<br />
          يمكنك الآن الاستمتاع بجميع المميزات.
        </p>
        <Link to={user ? '/dashboard' : '/login'} className="btn-primary inline-block">
          {user ? 'الذهاب للوحة التحكم' : 'تسجيل الدخول'}
        </Link>
      </div>
    </div>
  );

  // Token already used but email IS verified — not an error
  if (status === 'already') return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card max-w-md w-full text-center py-10">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-green-700">البريد مفعّل بالفعل ✓</h2>
        <p className="text-gray-500 text-sm mb-6">
          حسابك مفعّل — هذا الرابط استُخدم من قبل.
        </p>
        <Link to={user ? '/dashboard' : '/login'} className="btn-primary inline-block">
          {user ? 'الذهاب للوحة التحكم' : 'تسجيل الدخول'}
        </Link>
      </div>
    </div>
  );

  // Genuine error — expired or invalid token
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card max-w-md w-full text-center py-10">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <XCircle className="w-10 h-10 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">رابط منتهي الصلاحية</h2>
        <p className="text-gray-500 text-sm mb-6">
          رابط التفعيل غير صالح أو انتهت صلاحيته (صالح 24 ساعة فقط).<br />
          يمكنك طلب رابط جديد من صفحة الإعدادات.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/profile" className="btn-primary">إعدادات الحساب</Link>
          <Link to="/login"   className="btn-outline">تسجيل الدخول</Link>
        </div>
      </div>
    </div>
  );
}
