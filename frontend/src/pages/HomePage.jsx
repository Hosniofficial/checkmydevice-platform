import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Search, AlertTriangle, CheckCircle, FileText, Zap, Users, Database } from 'lucide-react';

export default function HomePage() {
  const [imei, setImei] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (imei.trim()) navigate(`/search?q=${encodeURIComponent(imei.trim())}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-bl from-primary-700 via-primary-700 to-blue-900 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm mb-6">
            <Zap className="w-4 h-4 text-yellow-300"/>
            <span>منصة عربية لفحص الأجهزة المحمولة</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            تحقق من جهازك<br/>
            <span className="text-yellow-300">قبل الشراء</span>
          </h1>
          <p className="text-blue-200 text-lg mb-10 max-w-xl mx-auto">
            ابحث عن أي جهاز في قاعدة بياناتنا — هل هو مسروق أو مفقود؟
			</p>

          {/* Search box */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <input
              type="text"
              value={imei}
              onChange={e => setImei(e.target.value)}
              placeholder="أدخل رقم IMEI (15 رقم)"
              className="imei-input flex-1 px-5 py-4 rounded-xl text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-yellow-300/50"
              maxLength={16}
            />
            <button type="submit" disabled={!imei.trim()}
              className="bg-yellow-400 text-gray-900 font-bold px-8 py-4 rounded-xl hover:bg-yellow-300 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2 justify-center">
              <Search className="w-5 h-5"/>
              فحص الآن
            </button>
          </form>

          <p className="text-blue-300 text-xs mt-4">
            💡 كيف أجد رقم IMEI؟ اتصل بـ *#06# من هاتفك
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '50,000+', label: 'جهاز مسجل', icon: Database },
              { value: '15',      label: 'دولة عربية', icon: Shield },
              { value: '100%',    label: 'مراجعة يدوية', icon: CheckCircle },
              { value: '24/7',    label: 'خدمة مستمرة', icon: Zap },
            ].map(({ value, label, icon: Icon }) => (
              <div key={label} className="py-2">
                <div className="text-2xl font-bold text-primary-700">{value}</div>
                <div className="text-sm text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">كيف يعمل CheckMyDevice؟</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '١', icon: Search,       title: 'ابحث عن الجهاز',       desc: 'أدخل رقم IMEI أو الرقم التسلسلي للجهاز الذي تريد شراءه' },
            { step: '٢', icon: Shield,       title: 'اعرف النتيجة فوراً',   desc: 'نبحث في قاعدة بياناتنا ونخبرك إذا كان الجهاز مسروقاً أو مفقوداً' },
            { step: '٣', icon: FileText,     title: 'أبلغ إن سُرق جهازك',   desc: 'سجّل حساباً وأبلغ عن جهازك المسروق — سنبلغك فور بحث أي شخص عنه' },
          ].map(({ step, icon: Icon, title, desc }) => (
            <div key={step} className="text-center">
              <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4 relative">
                <Icon className="w-8 h-8 text-primary-700"/>
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-primary-700 text-white rounded-full text-xs flex items-center justify-center font-bold">{step}</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Warning box */}
      <section className="max-w-5xl mx-auto px-4 mb-16">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1"/>
          <div>
            <h3 className="font-bold text-amber-800 mb-1">تنبيه مهم</h3>
            <p className="text-amber-700 text-sm leading-relaxed">
              غياب الجهاز من قاعدتنا <strong>لا يعني</strong> بالضرورة أنه غير مسروق.
              قاعدتنا مجتمعية ومبنية على البلاغات التي يرفعها المستخدمون.
              استخدم هذه المنصة كمرجع إضافي فقط ولا تعتمد عليها كمصدر وحيد للتحقق.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-700 text-white py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">هل سُرق جهازك؟</h2>
        <p className="text-blue-200 mb-8 max-w-md mx-auto">سجّل حساباً مجانياً وأبلغ عن جهازك — سنبلغك فور بحث أي شخص عنه.</p>
        <a href="/register" className="bg-yellow-400 text-gray-900 font-bold px-8 py-4 rounded-xl hover:bg-yellow-300 active:scale-95 transition-all inline-block">
          سجّل مجاناً الآن
        </a>
      </section>
    </div>
  );
}
