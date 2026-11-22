import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import SEOHead from '../components/SEOHead.jsx';
import {
  Search, Info, Phone, Mail,
  Smartphone, Laptop, Tablet, Gift, ShieldCheck, ShieldAlert,
  HelpCircle, Clock, Calendar,
} from 'lucide-react';
import api from '../lib/api.js';
import { Spinner } from '../components/ui/index.jsx';
import toast from 'react-hot-toast';
import { getCountryName } from '../lib/countries.js';
import { formatDate, formatDateTime } from '../lib/format.js';
import { IMEI_VALIDATION_MESSAGE, isValidIMEI } from '../lib/validation.js';

// ── Brand image map ───────────────────────────────────────────────
const BRAND_IMAGE = {
  // Apple / iPhone
  apple:    '/brands/iphone.png',
  iphone:   '/brands/iphone.png',
  // Samsung
  samsung:  '/brands/samsung.png',
  // Huawei
  huawei:   '/brands/huawei.png',
  // Xiaomi
  xiaomi:   '/brands/xiaomi.png',
  // Oppo
  oppo:     '/brands/oppo.png',
  // Vivo
  vivo:     '/brands/vivo.png',
  // Realme
  realme:   '/brands/realme.png',
  // Honor
  honor:    '/brands/honor.png',
  // Infinix
  infinix:  '/brands/infinix.png',
  // Nokia
  nokia:    '/brands/nokia.png',
  // OnePlus
  oneplus:  '/brands/oneplus.png',
  // Motorola
  motorola: '/brands/motorola.png',
  // Sony
  sony:     '/brands/sony.png',
  // Google Pixel
  google:   '/brands/pixel.png',
  pixel:    '/brands/pixel.png',
  // Asus / ROG
  asus:     '/brands/asus.png',
  rog:      '/brands/asus.png',
  // Lenovo
  lenovo:   '/brands/lenovo.png',
  // Tecno
  tecno:    '/brands/tecno.png',
  // Itel
  itel:     '/brands/itel.png',
  // Nothing
  nothing:  '/brands/nothing.png',
  // Android generic
  android:  '/brands/android.png',
};

function getBrandImage(brand) {
  if (!brand) return '/brands/android.png';
  const key = brand.toLowerCase().replace(/[^a-z]/g, '');
  return BRAND_IMAGE[key] || '/brands/android.png';
}

// ── Status config ─────────────────────────────────────────────────
const STATUS_CONFIG = {
  clean: {
    cardBg:    'bg-[#f3f6f8]',
    border:    'border-slate-200',
    badgeBg:   'bg-primary-700',
    icon:      Info,
    label:     'لا توجد بلاغات مسجلة',
    desc:      'نتيجة "نظيف" لا تعني 100% أن الجهاز غير مسروق — بل تعني أنه غير مُبلَّغ عنه في قاعدة بياناتنا. استخدمها كمرجع إضافي.',
    textColor: 'text-blue-800',
  },
  stolen: {
    cardBg:    'bg-red-50/70',
    border:    'border-red-200',
    badgeBg:   'bg-red-500',
    icon:      ShieldAlert,
    label:     'جهاز مسروق',
    desc:      'تم الإبلاغ عن هذا الجهاز كمسروق',
    textColor: 'text-red-700',
  },
  lost: {
    cardBg:    'bg-amber-50/70',
    border:    'border-amber-200',
    badgeBg:   'bg-amber-500',
    icon:      HelpCircle,
    label:     'جهاز مفقود',
    desc:      'تم الإبلاغ عن هذا الجهاز كمفقود',
    textColor: 'text-amber-700',
  },
};

// ── Quota bar ─────────────────────────────────────────────────────
function QuotaBar({ quota }) {
  if (!quota) return null;
  const pct      = quota.limit > 0 ? Math.round((quota.used / quota.limit) * 100) : 0;
  const barColor = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-400' : 'bg-green-500';
  return (
    <div className="mt-4 border-t border-[#e7e4dc] pt-4">
      <div className="mb-1.5 flex justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> حصة البحث اليوم</span>
        <span>{quota.remaining} متبقٍ من {quota.limit}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#eeece5]">
        <div className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  );
}

// ── Device Result Card ────────────────────────────────────────────
function DeviceResultCard({ result }) {
  const cfg        = STATUS_CONFIG[result.status] || STATUS_CONFIG.clean;
  const StatusIcon = cfg.icon;
  const info       = result.device_info;
  const brandImg   = getBrandImage(info?.brand);

  const modelName = (info?.model      || '').trim();
  const modelCode = (info?.model_code || '').trim();
  const distinctModelCode = modelCode.toLocaleLowerCase() !== modelName.toLocaleLowerCase()
    ? modelCode
    : '';

  const DEVICE_LABELS = { phone: 'هاتف', tablet: 'تابلت', laptop: 'لابتوب' };

  const specs = [
    { label: 'النوع',        value: DEVICE_LABELS[info?.device_type] || info?.device_type },
    { label: 'الموديل',      value: modelName },
    { label: 'الكود التقني', value: distinctModelCode, mono: true },
    { label: 'السعة',        value: info?.storage },
    { label: 'الشبكة',       value: info?.network },
  ].filter(x => x.value);

  return (
    <div className={`surface-card overflow-hidden border ${cfg.border} fade-in`} aria-live="polite">

      <div className="flex items-center justify-between bg-primary-700 px-5 py-3">
        <div className="flex items-center gap-2">
          <StatusIcon className="w-5 h-5 text-white/90" />
          <span className="text-white font-bold text-base">{info?.brand || 'جهاز'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/80">
          <img src="/Logo.png" alt="CheckMyDevice" className="w-4 h-4 object-contain brightness-0 invert" />
          <span className="text-xs font-medium">نتيجة الفحص</span>
        </div>
      </div>

      <div className={`${cfg.cardBg} grid grid-cols-[32%_1fr] sm:grid-cols-[38%_1fr]`}>
        <div className="flex min-w-0 items-center justify-center px-2 py-4 sm:px-5">
          <img
            src={brandImg}
            alt={info?.brand || 'جهاز'}
            className="h-[160px] w-full max-w-[170px] object-contain sm:h-[220px]"
            onError={e => { e.target.src = '/brands/android.png'; }}
            loading="lazy"
          />
        </div>

        <div className="flex min-w-0 flex-col justify-center gap-4 p-4 sm:p-6">
          <span className={`inline-flex w-fit items-center gap-1.5 ${cfg.badgeBg} rounded-full px-3 py-1.5 text-xs font-bold text-white`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {cfg.label}
          </span>

          <div className="grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2">
            {specs.map(({ label, value, mono }) => (
              <div key={label} className="min-w-0 border-b border-[#dedbd3] pb-2">
                <span className="block text-xs text-gray-500">{label}</span>
                <span className={`mt-1 block break-words text-sm font-semibold text-gray-900 ${mono ? 'font-mono text-xs tracking-wide' : ''}`} dir="auto">
                  {value}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
            <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
            تم التحقق في {formatDateTime(result.checked_at)}
          </p>
        </div>
      </div>

      <div className={`flex items-start gap-2.5 border-t px-5 py-4 ${cfg.border} ${result.status === 'clean' ? 'bg-white' : cfg.cardBg}`}>
        <StatusIcon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${cfg.textColor}`} />
        <p className={`text-sm leading-6 ${cfg.textColor}`}>
          {result.status === 'clean' ? (result.disclaimer_ar || cfg.desc) : cfg.desc}
        </p>
      </div>

      {/* ── Reports section ───────────────────────────────────── */}
      {result.reports?.length > 0 && (
        <div className="space-y-3 border-t border-[#e7e4dc] bg-white px-5 pb-5 pt-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">تفاصيل البلاغ</p>
          {result.reports.map((r, i) => (
            <div key={i} className="rounded-2xl border border-[#e7e4dc] bg-[#f7f6f2] p-4">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full
                  ${r.report_type === 'stolen' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                  {r.report_type === 'stolen' ? '🔴 مسروق' : '🟡 مفقود'}
                </span>
                {r.report_date && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(r.report_date)}
                  </span>
                )}
              </div>

              <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  ['اللون',   r.color],
                  ['الدولة',  getCountryName(r.country)],
                  ['المدينة', r.city],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k}>
                    <span className="text-xs text-gray-400 block">{k}</span>
                    <span className="break-words text-sm font-medium text-gray-800">{v}</span>
                  </div>
                ))}
              </div>

              {r.reward_offered && (
                <div className="flex items-center gap-2 text-green-700 text-xs bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-3">
                  <Gift className="w-4 h-4 flex-shrink-0" />
                  <span>مكافأة مقدمة{r.reward_amount ? `: ${r.reward_amount}` : ''}</span>
                </div>
              )}

              {r.contact_available && (
                <div className="border-t border-[#e7e4dc] pt-3">
                  <p className="text-xs text-gray-500 mb-2">تواصل مع صاحب الجهاز:</p>
                  <div className="flex gap-2 flex-wrap">
                    {r.whatsapp && (
                      <a href={`https://wa.me/${r.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors">
                        <Phone className="w-3.5 h-3.5" /> واتساب
                      </a>
                    )}
                    {r.phone && (
                      <a href={`tel:${r.phone.replace(/\s/g,'')}`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                        <Phone className="w-3.5 h-3.5" /> هاتف
                      </a>
                    )}
                    {r.email && (
                      <a href={`mailto:${r.email}`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                        <Mail className="w-3.5 h-3.5" /> إيميل
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location                        = useLocation();
  const [query, setQuery]         = useState(searchParams.get('q') || '');
  const [queryType, setQueryType] = useState('imei');
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState(null);
  const [quota, setQuota]         = useState(null);
  const [validationError, setValidationError] = useState('');
  const initialSearchRef = useRef(null);

  // Reset state when user navigates to /search fresh (no ?q param)
  // location.key changes on every navigation even to the same path
  useEffect(() => {
    const q = searchParams.get('q');
    if (!q) {
      setQuery('');
      setResult(null);
    }
    loadQuota();
  }, [location.key]);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q && initialSearchRef.current !== q) {
      initialSearchRef.current = q;
      setQuery(q);
      doSearch(q);
    }
  }, []);

  const loadQuota = async () => {
    try {
      const { data } = await api.get('/search/quota');
      setQuota(data.data);
    } catch {}
  };

  const doSearch = async (q = query) => {
    const trimmed = q.trim().replace(/\s/g, '');
    if (!trimmed) return;
    if (queryType === 'imei' && !isValidIMEI(trimmed)) {
      setValidationError(IMEI_VALIDATION_MESSAGE);
      return;
    }
    setValidationError('');
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post('/search', { query: trimmed, query_type: queryType });
      setResult(data.data);
      setSearchParams({ q: trimmed });
      loadQuota();
    } catch (err) {
      toast.error(err.response?.data?.error?.message_ar || 'حدث خطأ أثناء البحث');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    doSearch();
  };

  return (
    <div className="min-h-full bg-[#f7f6f2] px-4 py-8 sm:py-12">
      <SEOHead page="search" />
      <div className="mx-auto max-w-3xl">

        <div className="overflow-hidden rounded-3xl bg-primary-900 px-5 py-7 text-white sm:px-8 sm:py-9">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-blue-200">التحقق قبل الشراء</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">راجع حالة الجهاز</h1>
              <p className="mt-2 max-w-xl text-sm leading-7 text-blue-100">
                ابحث برقم IMEI أو الرقم التسلسلي، ثم راجع المعلومات والبلاغات المتاحة.
              </p>
            </div>
            <div className="hidden h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white/10 sm:flex">
              <ShieldCheck className="h-7 w-7 text-blue-100" />
            </div>
          </div>
        </div>

        <div className="relative mx-1 -mt-4 mb-6 rounded-2xl border border-[#e7e4dc] bg-white p-4 shadow-md sm:p-5">
          <div className="mb-4 flex gap-1 rounded-xl bg-[#f0eee7] p-1">
            {[{ v: 'imei', l: 'رقم IMEI' }, { v: 'serial', l: 'الرقم التسلسلي' }].map(({ v, l }) => (
              <button key={v} type="button" onClick={() => { setQueryType(v); setValidationError(''); }}
                aria-pressed={queryType === v}
                className={`min-h-10 flex-1 rounded-md px-3 text-sm font-medium transition-colors
                  ${queryType === v ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
                {l}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} role="search" className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <label htmlFor="search-query" className="mb-2 block text-sm font-semibold text-gray-700">
                {queryType === 'imei' ? 'أدخل رقم IMEI' : 'أدخل الرقم التسلسلي'}
              </label>
              <Search className="absolute right-3 top-[42px] h-5 w-5 text-gray-400" aria-hidden="true" />
              <input
                id="search-query"
                type="text" inputMode={queryType === 'imei' ? 'numeric' : 'text'} dir="ltr"
                aria-invalid={Boolean(validationError)}
                aria-describedby={validationError ? 'search-validation-error' : undefined}
                value={query} onChange={e => { setQuery(e.target.value); setValidationError(''); }}
                placeholder={queryType === 'imei' ? 'أدخل 15 رقماً' : 'أدخل الرقم كما يظهر على الجهاز'}
                className="input w-full pl-4 pr-10 text-left font-mono text-base tracking-wider"
                maxLength={queryType === 'imei' ? 16 : 50}
              />
            </div>
            <button type="submit" disabled={loading || !query.trim()}
              className="btn-primary flex min-h-12 items-center justify-center gap-2 px-6 sm:mt-[30px] sm:flex-shrink-0">
              {loading ? <Spinner size={20} /> : <Search className="h-5 w-5" />}
              افحص الرقم
            </button>
          </form>

          {validationError && (
            <p id="search-validation-error" role="alert" className="mt-2 text-sm text-red-700">
              {validationError}
            </p>
          )}

          {queryType === 'imei' && (
            <p className="mt-3 text-xs leading-5 text-gray-500">
              للحصول على الرقم، اكتب <span className="mx-1 font-mono text-gray-700" dir="ltr">*#06#</span> على الجهاز.
            </p>
          )}
          <QuotaBar quota={quota} />
        </div>

        {loading && (
          <div role="status" className="surface-card py-14 text-center">
            <Spinner size={40} />
            <p className="mt-4 text-sm text-gray-600">جاري البحث في قاعدة البيانات...</p>
          </div>
        )}

        {result && !loading && <DeviceResultCard result={result} />}

        {!loading && (
          <div className="surface-card mt-6 flex flex-wrap items-center gap-4 p-4 sm:p-5">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-50">
              <ShieldAlert className="h-5 w-5 text-primary-700" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900">هل سُرق جهازك؟</p>
              <p className="mt-0.5 text-xs leading-5 text-gray-600">أبلغ عنه لمساعدة الآخرين على التحقق.</p>
            </div>
            <Link to="/reports/new" className="btn-outline flex-shrink-0 px-4 py-2 text-sm">
              إبلاغ
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
