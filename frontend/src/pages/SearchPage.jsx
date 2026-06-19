import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search, AlertTriangle, CheckCircle, Info, Phone, Mail,
  Smartphone, Laptop, Tablet, Gift, ShieldCheck, ShieldAlert,
  HelpCircle, Zap, Clock,
} from 'lucide-react';
import api from '../lib/api.js';
import { Spinner } from '../components/ui/index.jsx';
import toast from 'react-hot-toast';
import { getCountryName } from '../lib/countries.js';
import { formatDate, formatDateTime } from '../lib/format.js';

// ── helpers ───────────────────────────────────────────────────────
const DEVICE_TYPE = {
  phone:  { icon: Smartphone, label: 'هاتف' },
  tablet: { icon: Tablet,     label: 'تابلت' },
  laptop: { icon: Laptop,     label: 'لابتوب' },
};

function DeviceTypeIcon({ type, className = 'w-5 h-5' }) {
  const cfg  = DEVICE_TYPE[type] || DEVICE_TYPE.phone;
  const Icon = cfg.icon;
  return <Icon className={className} strokeWidth={1.8} />;
}

function whatsAppHref(number) {
  if (!number) return null;
  const digits = number.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : null;
}

// ── Result status config ──────────────────────────────────────────
const STATUS_CONFIG = {
  clean: {
    bg: 'bg-green-50', border: 'border-green-200',
    icon: ShieldCheck, iconColor: 'text-green-600', iconBg: 'bg-green-100',
    title: 'الجهاز نظيف', titleColor: 'text-green-800',
  },
  stolen: {
    bg: 'bg-red-50', border: 'border-red-300',
    icon: ShieldAlert, iconColor: 'text-red-600', iconBg: 'bg-red-100',
    title: 'جهاز مسروق', titleColor: 'text-red-800',
  },
  lost: {
    bg: 'bg-amber-50', border: 'border-amber-300',
    icon: HelpCircle, iconColor: 'text-amber-600', iconBg: 'bg-amber-100',
    title: 'جهاز مفقود', titleColor: 'text-amber-800',
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

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">فحص جهاز</h1>
        <p className="text-gray-500 text-sm">تحقق من حالة الجهاز قبل الشراء باستخدام رقم IMEI</p>
      </div>

      {/* Search card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">

        {/* Type toggle */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
          {[{ v: 'imei', l: 'رقم IMEI' }, { v: 'serial', l: 'الرقم التسلسلي' }].map(({ v, l }) => (
            <button key={v} type="button" onClick={() => setQueryType(v)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all
                ${queryType === v ? 'bg-white shadow text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Search input */}
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              inputMode="numeric"
              dir="ltr"
              value={query}
              onChange={e => setQuery(e.target.value)}
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

        {/* IMEI hint */}
        {queryType === 'imei' && (
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            اتصل بـ <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">*#06#</span> للحصول على رقم IMEI
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
      {result && !loading && (() => {
        const cfg  = STATUS_CONFIG[result.status] || STATUS_CONFIG.clean;
        const Icon = cfg.icon;
        return (
          <div className={`rounded-2xl border-2 ${cfg.bg} ${cfg.border} overflow-hidden fade-in`}>

            {/* Status header */}
            <div className="p-5 flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${cfg.iconBg}`}>
                <Icon className={`w-7 h-7 ${cfg.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className={`text-xl font-bold ${cfg.titleColor}`}>{cfg.title}</h2>
                <p className="text-sm text-gray-600 mt-0.5 leading-snug">{result.message_ar}</p>
              </div>
              {result.device_info && (
                <div className={`flex-shrink-0 ${cfg.iconColor} opacity-30`}>
                  <DeviceTypeIcon type={result.device_info.device_type} className="w-10 h-10" />
                </div>
              )}
            </div>

            <div className="px-5 pb-5 space-y-4">

              {/* Device info */}
              {result.device_info && (
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                    <DeviceTypeIcon type={result.device_info.device_type} className="w-4 h-4 text-gray-500" />
                    معلومات الجهاز
                    <span className="text-xs text-gray-400 font-normal mr-auto flex items-center gap-1">
                      <Zap className="w-3 h-3 text-yellow-500" /> من الكاش
                    </span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      ['الماركة',     result.device_info.brand],
                      ['الموديل',     result.device_info.model],
                      ['النوع',       DEVICE_TYPE[result.device_info.device_type]?.label || result.device_info.device_type],
                      ['السعة',       result.device_info.storage],
                      ['الشبكة',      result.device_info.network],
                      ['سنة الإصدار', result.device_info.released],
                    ].filter(([, v]) => v).map(([k, v]) => (
                      <div key={k}>
                        <span className="text-xs text-gray-400 block mb-0.5">{k}</span>
                        <span className="text-sm font-medium text-gray-900">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reports */}
              {result.reports?.map((r, i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  {/* Report header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
                      ${r.report_type === 'stolen' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                      {r.report_type === 'stolen' ? '🔴 مسروق' : '🟡 مفقود'}
                    </span>
                    {r.report_date && (
                      <span className="text-xs text-gray-400">{formatDate(r.report_date)}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {[
                      ['الجهاز',   `${r.brand} ${r.model}`],
                      ['اللون',    r.color],
                      ['الدولة',   getCountryName(r.country)],
                      ['المدينة',  r.city],
                    ].filter(([, v]) => v).map(([k, v]) => (
                      <div key={k}>
                        <span className="text-xs text-gray-400 block mb-0.5">{k}</span>
                        <span className="text-sm font-medium text-gray-900">{v}</span>
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
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-2">تواصل مع صاحب الجهاز:</p>
                      <div className="flex gap-2 flex-wrap">
                        {whatsAppHref(r.whatsapp) && (
                          <a href={whatsAppHref(r.whatsapp)} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-medium bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors">
                            <Phone className="w-3.5 h-3.5" /> واتساب
                          </a>
                        )}
                        {r.phone && (
                          <a href={`tel:${r.phone.replace(/\s/g, '')}`}
                            className="inline-flex items-center gap-1.5 text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
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

              {/* Footer */}
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs text-gray-400 flex items-start gap-1">
                  <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  {result.disclaimer_ar}
                </p>
                <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                  {formatDateTime(result.checked_at)}
                </span>
              </div>
            </div>
          </div>
        );
      })()}

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
          <Link to="/reports/new"
            className="btn-primary py-2 px-4 text-sm flex-shrink-0">
            إبلاغ
          </Link>
        </div>
      )}
    </div>
  );
}
