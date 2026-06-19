import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, Mail } from 'lucide-react';
import api from '../lib/api.js';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    api.get(`/auth/verify-email/${token}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
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
        <h2 className="text-2xl font-bold mb-2">تم تفعيل حسابك!</h2>
        <p className="text-gray-500 text-sm mb-6">
          تم التحقق من بريدك الإلكتروني بنجاح.<br />
          يمكنك الآن تسجيل الدخول والاستمتاع بجميع المميزات.
        </p>
        <Link to="/login" className="btn-primary inline-block">تسجيل الدخول</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card max-w-md w-full text-center py-10">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <XCircle className="w-10 h-10 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">رابط غير صالح</h2>
        <p className="text-gray-500 text-sm mb-6">
          رابط التفعيل غير صالح أو منتهي الصلاحية (صالح 24 ساعة).
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/register" className="btn-primary">إنشاء حساب جديد</Link>
          <Link to="/login" className="btn-outline">تسجيل الدخول</Link>
        </div>
      </div>
    </div>
  );
}
