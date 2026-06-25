import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
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
    gradient:  'from-primary-700 to-blue-800',
    cardBg:    'bg-gradient-to-br from-emerald-50 to-teal-50',
    border:    'border-emerald-200',
    badgeBg:   'bg-emerald-500',
    icon:      ShieldCheck,
    label:     'جهاز نظيف',
    desc:      'لا يوجد بلاغ مسروق على هذا الجهاز',
    textColor: 'text-emerald-700',
  },
  stolen: {
    gradient:  'from-primary-700 to-blue-800',
    cardBg:    'bg-gradient-to-br from-red-50 to-rose-50',
    border:    'border-red-200',
    badgeBg:   'bg-red-500',
    icon:      ShieldAlert,
    label:     'جهاز مسروق',
    desc:      'تم الإبلاغ عن هذا الجهاز كمسروق',
    textColor: 'text-red-700',
  },
  lost: {
    gradient:  'from-primary-700 to-blue-800',
    cardBg:    'bg-gradient-to-br from-amber-50 to-orange-50',
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
    <div className="mt-4 pt-4 border-t border-gray-100">
      <div className="flex justify-between text-xs text-gray-400 mb-1.5">
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> حصة البحث اليوم</span>
        <span>{quota.remaining} متبقٍ من {quota.limit}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
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

  // model_code already contains the full display string e.g. "iPhone 12 Pro Max (A2412)"
  // fall back to model if model_code is absent
  const modelName = (info?.model      || '').trim();
  const modelCode = (info?.model_code || '').trim();

  const DEVICE_LABELS = { phone: 'هاتف', tablet: 'تابلت', laptop: 'لابتوب' };

  const specs = [
    { label: 'النوع',        value: DEVICE_LABELS[info?.device_type] || info?.device_type },
    { label: 'الموديل',      value: modelName },
    { label: 'الكود التقني', value: modelCode, mono: true },
    { label: 'السعة',        value: info?.storage },
    { label: 'الشبكة',       value: info?.network },
    { label: 'حالة الجهاز',  value: cfg.label, highlight: true },
  ].filter(x => x.value);

  return (
    <div className={`rounded-3xl overflow-hidden shadow-lg border ${cfg.border} fade-in`}>

      {/* ── Header bar: brand name + logo ────────────────────── */}
      <div className={`bg-gradient-to-l ${cfg.gradient} px-5 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <StatusIcon className="w-5 h-5 text-white/90" />
          <span className="text-white font-bold text-base">{info?.brand || 'جهاز'}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white/20 rounded-xl px-3 py-1.5">
          <img src="/Logo.png" alt="CheckMyDevice" className="w-4 h-4 object-contain brightness-0 invert" />
          <span className="text-white text-xs font-semibold">CheckMyDevice</span>
        </div>
      </div>

      {/* ── Main body: image left, info right ────────────────── */}
      <div className={`${cfg.cardBg} flex`}>

        {/* Device image */}
        <div className="relative w-2/5 flex items-end justify-center pt-4 pb-0 overflow-hidden">
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <span className="text-gray-200 font-bold text-xl rotate-[-25deg] opacity-40 whitespace-nowrap">
              CheckMyDevice
            </span>
          </div>
          <img
            src={brandImg}
            alt={info?.brand || 'جهاز'}
            className="relative z-10 w-full max-w-[180px] h-[240px] object-contain drop-shadow-xl"
            onError={e => { e.target.src = '/brands/android.png'; }}
          />
        </div>

        {/* Info panel */}
        <div className="flex-1 p-5 flex flex-col justify-center gap-3">

          {/* Status badge */}
          <span className={`inline-flex items-center gap-1.5 self-start ${cfg.badgeBg} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {cfg.label}
          </span>

          {/* Specs table */}
          <div className="space-y-2">
            {specs.map(({ label, value, highlight, mono }) => (
              <div key={label} className="flex items-center justify-between border-b border-gray-200/60 pb-1.5 last:border-0">
                <span className="text-xs text-gray-500">{label}</span>
                <span className={`text-sm font-semibold ${highlight ? cfg.textColor : 'text-gray-900'} ${mono ? 'font-mono text-xs tracking-wide bg-white/70 px-2 py-0.5 rounded-lg' : ''}`} dir="ltr">
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Check timestamp */}
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-gray-300" />
            تم التحقق في {formatDateTime(result.checked_at)}
          </p>
        </div>
      </div>

      {/* ── Status description bar ────────────────────────────── */}
      <div className={`px-5 py-3 bg-white border-t ${cfg.border} flex items-center gap-2`}>
        <StatusIcon className={`w-4 h-4 flex-shrink-0 ${cfg.textColor}`} />
        <p className={`text-sm font-medium ${cfg.textColor}`}>{cfg.desc}</p>
      </div>

      {/* ── Reports section ───────────────────────────────────── */}
      {result.reports?.length > 0 && (
        <div className="bg-white px-5 pb-5 pt-3 space-y-3 border-t border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">تفاصيل البلاغ</p>
          {result.reports.map((r, i) => (
            <div key={i} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
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

              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  ['اللون',   r.color],
                  ['الدولة',  getCountryName(r.country)],
                  ['المدينة', r.city],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k}>
                    <span className="text-xs text-gray-400 block">{k}</span>
                    <span className="text-sm font-medium text-gray-800">{v}</span>
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
                <div className="pt-3 border-t border-gray-200">
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

      {/* ── Disclaimer ────────────────────────────────────────── */}
      <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
        <p className="text-xs text-gray-400 flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          {result.disclaimer_ar}
        </p>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery]         = useState(searchParams.get('q') || '');
  const [queryType, setQueryType] = useState('imei');
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState(null);
  const [quota, setQuota]         = useState(null);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) { setQuery(q); doSearch(q); }
    loadQuota();
  }, []);

  const loadQuota = async () => {
    try {
      const { data } = await api.get('/search/quota');
      setQuota(data.data);
    } catch {}
  };

  const doSearch = async (q = query) => {
    const trimmed = q.trim();
    if (!trimmed) return;
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

  const handleSubmit = (e) => { e.preventDefault(); doSearch(); };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <SEOHead page="search" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">فحص جهاز</h1>
        <p className="text-gray-500 text-sm">تحقق من حالة الجهاز قبل الشراء باستخدام رقم IMEI</p>
      </div>

      {/* Search card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
          {[{ v: 'imei', l: 'رقم IMEI' }, { v: 'serial', l: 'الرقم التسلسلي' }].map(({ v, l }) => (
            <button key={v} type="button" onClick={() => setQueryType(v)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all
                ${queryType === v ? 'bg-white shadow text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}>
              {l}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" inputMode="numeric" dir="ltr"
              value={query} onChange={e => setQuery(e.target.value)}
              placeholder={queryType === 'imei' ? '356938035643809' : 'C39XXXXXXXXXX'}
              className="input pr-10 font-mono tracking-widest text-base w-full"
              maxLength={20}
            />
          </div>
          <button type="submit" disabled={loading || !query.trim()}
            className="btn-primary px-6 flex items-center gap-2 flex-shrink-0 disabled:opacity-50">
            {loading ? <Spinner size={20} /> : <Search className="w-5 h-5" />}
            فحص
          </button>
        </form>

        {queryType === 'imei' && (
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            💡 اتصل بـ <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">*#06#</span> للحصول على رقم IMEI
          </p>
        )}
        <QuotaBar quota={quota} />
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-14">
          <Spinner size={40} />
          <p className="text-gray-500 mt-4 text-sm">جاري البحث في قاعدة البيانات...</p>
        </div>
      )}

      {/* Result */}
      {result && !loading && <DeviceResultCard result={result} />}

      {/* Report CTA */}
      {!loading && (
        <div className="mt-6 bg-primary-50 border border-primary-100 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-5 h-5 text-primary-700" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-primary-800">هل سُرق جهازك؟</p>
            <p className="text-xs text-primary-600 mt-0.5">أبلغ عنه الآن وساعد المشترين على تجنبه</p>
          </div>
          <Link to="/reports/new" className="btn-primary py-2 px-4 text-sm flex-shrink-0">
            إبلاغ
          </Link>
        </div>
      )}
    </div>
  );
}
