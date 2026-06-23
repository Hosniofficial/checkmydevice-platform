import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Home, FileText, HelpCircle } from 'lucide-react';

export default function NotFoundPage() {
  const { pathname } = useLocation();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">

        {/* 404 visual */}
        <div className="mb-8">
          <p className="text-8xl font-bold text-primary-100 select-none leading-none">404</p>
          <div className="relative -mt-6">
            <div className="w-16 h-16 bg-primary-700 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Search className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          الصفحة غير موجودة
        </h1>
        <p className="text-gray-500 mb-2 leading-relaxed">
          الرابط الذي أدخلته غير صحيح أو لم يعد موجوداً.
        </p>
        {pathname !== '/' && (
          <p className="text-xs text-gray-400 font-mono bg-gray-50 rounded-lg px-3 py-2 mb-8 break-all" dir="ltr">
            {pathname}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
          <Link to="/" className="btn-primary flex items-center justify-center gap-2">
            <Home className="w-4 h-4" />
            الصفحة الرئيسية
          </Link>
          <Link to="/search" className="btn-outline flex items-center justify-center gap-2">
            <Search className="w-4 h-4" />
            فحص جهاز
          </Link>
        </div>

        {/* Quick links */}
        <div className="border-t border-gray-100 pt-6">
          <p className="text-xs text-gray-400 mb-3">روابط مفيدة</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { to: '/faq',     label: 'الأسئلة الشائعة', icon: HelpCircle },
              { to: '/reports/new', label: 'رفع بلاغ',    icon: FileText },
              { to: '/contact', label: 'تواصل معنا',      icon: Search },
            ].map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to}
                className="flex items-center gap-1.5 text-sm text-primary-700 hover:text-primary-900 transition-colors">
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
