import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Check, Zap, BadgeCheck, HelpCircle, RefreshCw } from 'lucide-react';
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
  free: 'border-[#e7e4dc]',
  basic: 'border-primary-200',
  professional: 'border-primary-700 shadow-md',
  enterprise: 'border-[#e7e4dc]',
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
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    setLoading(true);
    setError(null);
    api.get('/plans', { signal: controller.signal })
      .then(r => {
        if (!Array.isArray(r.data?.data)) {
          throw new Error('Invalid plans response');
        }
        if (active) setPlans(r.data.data);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.response?.data?.error?.message_ar || 'تعذر تحميل الخطط والأسعار. تحقق من اتصالك ثم أعد المحاولة.');
      })
      .finally(() => {
        clearTimeout(timeout);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [retryCount]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <SEOHead page="plans" />
      <div className="mb-7 rounded-3xl bg-primary-900 px-5 py-7 text-white sm:mb-8 sm:px-9 sm:py-10">
        <p className="text-sm font-semibold text-blue-200">خطط مرنة للأفراد والتجار</p>
        <h1 className="mt-2 text-3xl font-bold">الخطط والأسعار</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-blue-100">
          ابدأ مجاناً، واختر الخطة المناسبة عندما تحتاج إلى حصة بحث أكبر. الأسعار بالجنيه المصري.
        </p>
      </div>

      {loading ? (
        <div className="surface-card flex min-h-56 items-center justify-center" role="status" aria-label="جاري تحميل الخطط">
          <Spinner size={40}/>
        </div>
      ) : error ? (
        <section className="surface-card flex flex-col items-center px-5 py-12 text-center" role="alert">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertCircle className="h-6 w-6" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-xl font-bold text-gray-900">تعذر تحميل الخطط</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">{error}</p>
          <button type="button" onClick={() => setRetryCount(count => count + 1)}
            className="btn-primary mt-5 inline-flex items-center gap-2">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            إعادة المحاولة
          </button>
        </section>
      ) : plans.length === 0 ? (
        <section className="surface-card px-5 py-10 text-center" role="status">
          <p className="font-semibold text-gray-800">لا توجد خطط متاحة حالياً</p>
          <p className="mt-2 text-sm text-gray-500">يرجى المحاولة لاحقاً أو التواصل مع فريقنا.</p>
          <Link to="/contact" className="btn-outline mt-5 inline-flex px-5 py-2.5 text-sm">تواصل معنا</Link>
        </section>
      ) : (
      <>
      {/* Billing toggle */}
      <div className="surface-card mb-8 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <p className="font-semibold text-gray-800">اختر طريقة الفوترة</p>
          <p className="mt-0.5 text-xs text-gray-500">قارن الأسعار الشهرية والسنوية قبل الاختيار.</p>
        </div>
        <div className="inline-flex w-fit items-center gap-1 rounded-xl bg-[#f0eee7] p-1">
          <button onClick={() => setYearly(false)}
            aria-pressed={!yearly}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${!yearly ? 'bg-white shadow-sm text-primary-800' : 'text-gray-500'}`}>
            شهري
          </button>
          <button onClick={() => setYearly(true)}
            aria-pressed={yearly}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${yearly ? 'bg-white shadow-sm text-primary-800' : 'text-gray-500'}`}>
            سنوي <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">وفر 17%</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map(plan => {
          const price    = yearly ? plan.price_yearly : plan.price_monthly;
          const badge    = PLAN_BADGES[plan.plan_type];
          const features = plan.features || {};
          const priceLabel = formatPlanPrice(price, plan.currency);

          return (
            <div key={plan.id}
              className={`surface-card relative flex flex-col overflow-hidden border-2 ${PLAN_COLORS[plan.plan_type] || 'border-[#e7e4dc]'}`}>
              {badge && (
                <div className={`absolute left-4 top-4 ${badge.color} rounded-full px-3 py-1 text-xs font-bold`}>
                  {badge.label}
                </div>
              )}

              <div className={`min-h-[205px] border-b border-[#e7e4dc] p-5 ${plan.plan_type === 'professional' ? 'bg-primary-50' : 'bg-[#f7f6f2]'}`}>
                <div className="mb-5 flex items-center justify-between gap-2">
                  <h3 className="font-bold text-lg text-gray-900">{plan.name_ar}</h3>
                  {plan.plan_type === 'professional' && <BadgeCheck className="h-5 w-5 text-primary-700" />}
                </div>
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
                <p className="mt-2 text-xs text-gray-500">
                  {plan.daily_search_limit === 9999 ? 'بحث غير محدود' : `${plan.daily_search_limit} بحث / يوم`}
                </p>
              </div>

              {/* Features */}
              <ul className="flex-1 space-y-3 p-5">
                {Object.entries(features).map(([key, val]) => (
                  <li key={key} className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600"/>
                    <span className="leading-relaxed text-gray-700">
                      {key === 'searches' ? `${val} بحث يومياً` : FEATURE_LABELS[key] || key}
                      {key === 'support' && val === 'priority' ? ' (أولوية)' : ''}
                      {key === 'support' && val === 'dedicated' ? ' (مخصص)' : ''}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-[#e7e4dc] p-5 pt-4">
                <Link to={priceLabel ? '/contact' : '/register'}
                className={`block w-full rounded-xl py-3 text-center text-sm font-semibold transition-all
                  ${plan.plan_type === 'professional'
                    ? 'bg-primary-700 text-white hover:bg-primary-900'
                    : 'border border-primary-200 bg-white text-primary-800 hover:bg-primary-50'}`}>
                {priceLabel ? 'تواصل للاشتراك' : 'ابدأ مجاناً'}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="mt-14">
        <div className="mb-5 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
            <HelpCircle className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">أسئلة شائعة</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[
          ['هل الاشتراك المجاني كافٍ؟', 'نعم! الاشتراك المجاني يتيح 20 عملية بحث يومياً وإمكانية رفع البلاغات واستقبال الإشعارات. معظم المستخدمين الأفراد لا يحتاجون أكثر من ذلك.'],
          ['كيف أفعّل الاشتراك المدفوع؟', 'بعد التواصل معنا وتأكيد الدفع، يقوم فريق الإدارة بتفعيل اشتراكك من لوحة التحكم — يبدأ الحساب بالعمل فوراً.'],
          ['هل يمكنني إلغاء الاشتراك؟', 'نعم، يمكنك إلغاء الاشتراك في أي وقت دون أي رسوم إضافية.'],
          ['ما الفرق بين الخطة الاحترافية والمؤسسية؟', 'الخطة المؤسسية تتيح حصة بحث أعلى بكثير ودعماً مخصصاً ومزيداً من مميزات API للشركات الكبيرة.'],
        ].map(([q, a]) => (
          <div key={q} className="surface-card p-5">
            <h3 className="mb-2 flex items-start gap-2 font-semibold text-gray-900">
              <Zap className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-700"/>{q}
            </h3>
            <p className="text-sm leading-relaxed text-gray-500">{a}</p>
          </div>
        ))}
        </div>
      </div>
      </>
      )}
    </div>
  );
}
