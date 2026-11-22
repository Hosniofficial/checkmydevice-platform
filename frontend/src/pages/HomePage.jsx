import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Search } from 'lucide-react';
import SEOHead from '../components/SEOHead.jsx';
import { IMEI_VALIDATION_MESSAGE, isValidIMEI } from '../lib/validation.js';

const serviceDetails = [
  {
    number: '01',
    title: 'معلومات الجهاز',
    description: 'قد تظهر الشركة والموديل عند توفر البيانات.',
  },
  {
    number: '02',
    title: 'البلاغات المتاحة',
    description: 'اعرف إن كان الرقم مرتبطاً ببلاغ مسجل لدينا.',
  },
  {
    number: '03',
    title: 'وقت البحث',
    description: 'راجع وقت إجراء الفحص مع كل نتيجة.',
  },
];

const steps = [
  {
    title: 'اطلب الرقم من البائع',
    description: 'اطلب منه إظهار رقم IMEI مباشرة من الجهاز.',
  },
  {
    title: 'ابحث عن البلاغات',
    description: 'أدخل الرقم وراجع ما هو متاح في قاعدة المنصة.',
  },
  {
    title: 'افحص الجهاز بنفسك',
    description: 'طابق بياناته ومستنداته قبل إتمام الشراء.',
  },
];

export default function HomePage() {
  const [imei, setImei] = useState('');
  const [validationError, setValidationError] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const value = imei.trim().replace(/\s/g, '');
    if (!isValidIMEI(value)) {
      setValidationError(IMEI_VALIDATION_MESSAGE);
      return;
    }
    navigate(`/search?q=${encodeURIComponent(value)}`);
  };

  return (
    <div className="bg-white">
      <SEOHead page="home" />

      <section className="border-b border-[#e7e4dc] bg-[#f5f3ee] px-4 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[1.05fr_0.95fr] md:gap-14">
          <div className="max-w-2xl">
            <p className="mb-5 flex items-center gap-3 text-sm font-semibold text-gray-600">
              <span className="h-px w-8 bg-accent-500" aria-hidden="true" />
              افحص بوعي… واشتري بثقة
            </p>

            <h1 className="text-4xl font-bold leading-[1.25] tracking-tight text-primary-900 sm:text-5xl">
              قبل ما تشتريه،
              <br />
              <span className="text-primary-700">افحص الجهاز.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-8 text-gray-600 sm:text-lg">
              راجع معلومات الجهاز والبلاغات المتاحة باستخدام رقم IMEI، وخذ قرارك بعد ما تتأكد بنفسك.
            </p>

            <form
              onSubmit={handleSearch}
              className="mt-7 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:flex sm:items-end sm:gap-3"
            >
              <div className="min-w-0 flex-1 px-2 pt-1">
                <label htmlFor="home-imei" className="mb-2 block text-sm font-semibold text-gray-700">
                  رقم IMEI
                </label>
                <input
                  id="home-imei"
                  type="text"
                  value={imei}
                  inputMode="numeric"
                  dir="ltr"
                  aria-invalid={Boolean(validationError)}
                  aria-describedby={validationError ? 'home-search-validation-error' : 'home-imei-help'}
                  onChange={e => { setImei(e.target.value); setValidationError(''); }}
                  placeholder="أدخل 15 رقماً"
                  className="imei-input w-full rounded-lg border border-gray-200 px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  maxLength={16}
                />
              </div>
              <button
                type="submit"
                disabled={!imei.trim()}
                className="btn-primary mt-3 flex min-h-12 w-full items-center justify-center gap-2 sm:mt-0 sm:w-auto sm:px-6"
              >
                <Search className="h-5 w-5" aria-hidden="true" />
                افحص الرقم
              </button>
            </form>

            {validationError && (
              <p id="home-search-validation-error" role="alert" className="mt-2 text-sm text-red-700">
                {validationError}
              </p>
            )}

            <p id="home-imei-help" className="mt-3 text-sm leading-6 text-gray-500">
              اطلب من البائع إظهار الرقم بكتابة <span className="font-mono text-gray-700" dir="ltr">*#06#</span> على الجهاز.
            </p>
            <p className="mt-2 text-xs leading-5 text-gray-500">
              نتيجة البحث تعرض البلاغات المتاحة، وليست شهادة بفحص الجهاز.
            </p>
          </div>

          <figure className="mx-auto w-full max-w-[420px] border border-gray-200 bg-white p-3 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.35)] md:ms-0">
            <div className="flex items-center justify-between border-b border-gray-100 px-2 pb-3">
              <span className="text-sm font-semibold text-gray-800">ابدأ من الجهاز نفسه</span>
              <span className="text-xs text-gray-500">صورة توضيحية</span>
            </div>
            <div className="mt-3 flex min-h-[250px] items-center justify-center bg-[#eef1f3] px-6 sm:min-h-[290px]">
              <img
                src="/home-imei-check.webp"
                alt="هاتف يعرض طريقة معرفة رقم IMEI باستخدام الرمز *#06#"
                className="h-[240px] w-full object-contain sm:h-[275px]"
                loading="eager"
                fetchpriority="high"
              />
            </div>
            <figcaption className="flex items-center justify-between gap-4 px-2 pt-4">
              <div>
                <p className="text-xs text-gray-500">رقم تعريف الجهاز</p>
                <p className="mt-1 text-sm font-semibold text-gray-800">IMEI — 15 رقماً</p>
              </div>
              <span className="border-s-2 border-accent-500 ps-3 text-xs leading-5 text-gray-500">
                طابق الرقم مع الجهاز
                <br />
                قبل متابعة الشراء
              </span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-gray-200 px-4 sm:grid-cols-3 sm:divide-y-0 sm:divide-x sm:divide-x-reverse">
          {serviceDetails.map(({ number, title, description }) => (
            <div key={number} className="py-5 sm:px-6 sm:first:ps-0 sm:last:pe-0">
              <p className="text-xs font-semibold tracking-widest text-accent-500" dir="ltr">{number}</p>
              <h2 className="mt-2 text-sm font-bold text-gray-800">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
        <div className="mb-8 max-w-xl">
          <p className="text-sm font-semibold text-accent-500">طريقة الاستخدام</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">ثلاث خطوات قبل ما تحسم قرارك</h2>
        </div>

        <ol className="grid grid-cols-1 border-y border-gray-200 md:grid-cols-3 md:divide-x md:divide-x-reverse">
          {steps.map(({ title, description }, index) => (
            <li key={title} className="border-b border-gray-200 py-6 first:pt-6 last:border-0 md:border-b-0 md:px-6 md:first:ps-0 md:last:pe-0">
              <p className="text-xs font-semibold tracking-widest text-accent-500" dir="ltr">
                الخطوة {String(index + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-3 text-lg font-bold text-gray-900">{title}</h3>
              <p className="mt-2 text-sm leading-7 text-gray-600">{description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="flex gap-4 border border-[#eadfcb] bg-[#faf7f0] p-5 sm:p-6">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-500" aria-hidden="true" />
          <div>
            <h2 className="font-bold text-gray-900">مهم قبل الشراء</h2>
            <p className="mt-1 text-sm leading-7 text-gray-600">
              قاعدة البلاغات مجتمعية وقد لا تشمل كل الأجهزة. عدم ظهور بلاغ لا يثبت أن الجهاز سليم؛ افحص الجهاز ومستنداته لدى جهة موثوقة.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl border-t border-gray-200 px-4 py-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">جهازك مفقود أو مسروق؟</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">أنشئ حساباً وقدّم بلاغاً ليساعد الآخرين على التحقق.</p>
          </div>
          <Link to="/register" className="btn-primary inline-flex items-center justify-center gap-2 self-start sm:self-auto">
            سجّل بلاغك
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
