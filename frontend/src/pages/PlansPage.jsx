import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Zap } from 'lucide-react';
import SEOHead from '../components/SEOHead.jsx';
import { Spinner } from '../components/ui/index.jsx';
import api from '../lib/api.js';

const FEATURE_LABELS = {
  searches: 'عمليات بحث يومياً',
  reports: 'الإبلاغ عن الأجهزة',
  notifications: 'إشعارات فورية',
  history: 'سجل البحث',
  bulk: 'Bulk Search (CSV)',
  api: 'API Key للمطورين',
  support: 'أولوية الدعم',
};

const PLAN_COLORS = {
  free: 'border-gray-200',
  basic: 'border-primary-300',
  professional: 'border-primary-700 ring-2 ring-primary-700',
  enterprise: 'border-purple-300',
};

const PLAN_BADGES = {
  professional: { label: 'الأكثر شيوعاً', color: 'bg-primary-700 text-white' },
};

function formatPlanPrice(price, currency = 'EGP') {
  if (!price || Number(price) === 0) return null;
  const amount = Number(price).toLocaleString('ar-EG-u-nu-latn');
  if (currency === 'EGP') return `${amount} ج.م`;
  return `${currency} ${amount}`;
}

export default function PlansPage() {
  const [plans, setPlans]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [yearly, setYearly] = useState(false);

  useEffect(() => {
    api.get('/plans')
      .then(r => setPlans(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size={40}/></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <SEOHead page="plans" />
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">الخطط والأسعار</h1>
        <p className="text-gray-500 mb-6">ابدأ مجاناً — الأسعار بالجنيه المصري (EGP)</p>

        {/* Billing toggle */}
        <div className="inline-flex items-center gap-3 bg-gray-100 rounded-xl p-1">
          <button onClick={() => setYearly(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!yearly ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
            شهري
          </button>
          <button onClick={() => setYearly(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${yearly ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
            سنوي <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">وفر 17%</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map(plan => {
          const price    = yearly ? plan.price_yearly : plan.price_monthly;
          const badge    = PLAN_BADGES[plan.plan_type];
          const features = plan.features || {};
          const priceLabel = formatPlanPrice(price, plan.currency);

          return (
            <div key={plan.id}
              className={`relative bg-white rounded-2xl border-2 p-6 flex flex-col ${PLAN_COLORS[plan.plan_type] || 'border-gray-200'}`}>
              {badge && (
                <div className={`absolute -top-3 right-1/2 translate-x-1/2 ${badge.color} text-xs font-bold px-3 py-1 rounded-full`}>
                  {badge.label}
                </div>
              )}

              <div className="mb-5">
                <h3 className="font-bold text-lg text-gray-900">{plan.name_ar}</h3>
                <div className="mt-2">
                  {!priceLabel ? (
                    <span className="text-3xl font-bold text-gray-900">مجاني</span>
                  ) : (
                    <div>
                      <span className="text-3xl font-bold text-gray-900">{priceLabel}</span>
                      <span className="text-gray-500 text-sm"> / {yearly ? 'سنة' : 'شهر'}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {plan.daily_search_limit === 9999 ? 'بحث غير محدود' : `${plan.daily_search_limit} بحث / يوم`}
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-2 flex-1 mb-6">
                {Object.entries(features).map(([key, val]) => (
                  <li key={key} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5"/>
                    <span className="text-gray-700">
                      {key === 'searches' ? `${val} بحث يومياً` : FEATURE_LABELS[key] || key}
                      {key === 'support' && val === 'priority' ? ' (أولوية)' : ''}
                      {key === 'support' && val === 'dedicated' ? ' (مخصص)' : ''}
                    </span>
                  </li>
                ))}
              </ul>

              <Link to={priceLabel ? '/contact' : '/register'}
                className={`w-full text-center py-3 rounded-xl font-semibold text-sm transition-all
                  ${plan.plan_type === 'professional'
                    ? 'bg-primary-700 text-white hover:bg-primary-900'
                    : 'border-2 border-primary-700 text-primary-700 hover:bg-primary-50'}`}>
                {priceLabel ? 'تواصل للاشتراك' : 'ابدأ مجاناً'}
              </Link>
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="mt-16 max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-center mb-8">أسئلة شائعة</h2>
        {[
          ['هل الاشتراك المجاني كافٍ؟', 'نعم! الاشتراك المجاني يتيح 5 عمليات بحث يومياً وإمكانية رفع البلاغات والاستقبال الإشعارات. معظم المستخدمين الأفراد لا يحتاجون أكثر من ذلك.'],
          ['كيف أفعّل الاشتراك المدفوع؟', 'بعد التواصل معنا وتأكيد الدفع، يقوم فريق الإدارة بتفعيل اشتراكك من لوحة التحكم — يبدأ الحساب بالعمل فوراً.'],
          ['هل يمكنني إلغاء الاشتراك؟', 'نعم، يمكنك إلغاء الاشتراك في أي وقت دون أي رسوم إضافية.'],
          ['ما الفرق بين الخطة الاحترافية والمؤسسية؟', 'الخطة المؤسسية تتيح حصة بحث أعلى بكثير ودعماً مخصصاً ومزيداً من مميزات API للشركات الكبيرة.'],
        ].map(([q, a]) => (
          <div key={q} className="border-b border-gray-200 py-5">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary-700 flex-shrink-0"/>{q}
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">{a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
