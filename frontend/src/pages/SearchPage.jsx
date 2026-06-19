import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, AlertTriangle, CheckCircle, Info, Phone, Mail, Smartphone, Laptop, Tablet, RefreshCw, Gift } from 'lucide-react';
import api from '../lib/api.js';
import { Spinner } from '../components/ui/index.jsx';
import toast from 'react-hot-toast';
import { getCountryName } from '../lib/countries.js';
import { formatDate, formatDateTime } from '../lib/format.js';

const DEVICE_TYPE_LABELS = {
  phone:  'هاتف',
  tablet: 'تابلت',
  laptop: 'لابتوب',
};

const DeviceIcon = ({ type }) => {
  if (type === 'laptop') return <Laptop className="w-5 h-5"/>;
  if (type === 'tablet') return <Tablet className="w-5 h-5"/>;
  return <Smartphone className="w-5 h-5"/>;
};

const formatDeviceType = (type) => DEVICE_TYPE_LABELS[type] || type;

const whatsAppHref = (number) => {
  if (!number) return null;
  const digits = number.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : null;
};

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery]       = useState(searchParams.get('q') || '');
  const [queryType, setQueryType] = useState('imei');
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [quota, setQuota]       = useState(null);

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
    if (!q.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post('/search', { query: q.trim(), query_type: queryType });
      setResult(data.data);
      setSearchParams({ q: q.trim() });
      loadQuota();
    } catch (err) {
      const msg = err.response?.data?.error?.message_ar || 'حدث خطأ أثناء البحث';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); doSearch(); };

  const resultConfig = {
    clean:  { bg: 'bg-green-50',  border: 'border-green-300',  icon: CheckCircle,    iconColor: 'text-green-600',  title: 'الجهاز نظيف' },
    stolen: { bg: 'bg-red-50',    border: 'border-red-400',    icon: AlertTriangle,  iconColor: 'text-red-600',    title: '⚠️ جهاز مسروق' },
    lost:   { bg: 'bg-amber-50',  border: 'border-amber-400',  icon: AlertTriangle,  iconColor: 'text-amber-600',  title: '⚠️ جهاز مفقود' },
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">فحص جهاز</h1>
      <p className="text-gray-500 text-sm mb-8">تحقق من حالة الجهاز قبل الشراء</p>

      {/* Search form */}
      <div className="card mb-6">
        {/* Type toggle */}
        <div className="flex gap-2 mb-4">
          {[{ v: 'imei', l: 'رقم IMEI' }, { v: 'serial', l: 'الرقم التسلسلي' }].map(({ v, l }) => (
            <button key={v} onClick={() => setQueryType(v)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors
                ${queryType === v ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {l}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={queryType === 'imei' ? 'أدخل رقم IMEI (15 رقم)' : 'أدخل الرقم التسلسلي'}
            className="imei-input input flex-1 text-lg"
            maxLength={20}
          />
          <button type="submit" disabled={loading || !query.trim()} className="btn-primary px-6 flex items-center gap-2">
            {loading ? <Spinner size={20}/> : <Search className="w-5 h-5"/>}
            فحص
          </button>
        </form>

        {quota && (
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
            <Info className="w-3 h-3"/>
            <span>الحصة المتبقية اليوم: {quota.remaining} / {quota.limit}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-1.5 mr-2">
              <div className="bg-primary-700 h-1.5 rounded-full transition-all"
                style={{ width: `${Math.max(0, (quota.remaining / quota.limit) * 100)}%` }}/>
            </div>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="card text-center py-12">
          <Spinner size={40}/>
          <p className="text-gray-500 mt-4">جاري البحث في قاعدة البيانات...</p>
        </div>
      )}

      {/* Result */}
      {result && !loading && (() => {
        const cfg = resultConfig[result.status] || resultConfig.clean;
        const Icon = cfg.icon;
        return (
          <div className={`rounded-2xl border-2 ${cfg.bg} ${cfg.border} p-6 fade-in`}>
            {/* Status header */}
            <div className="flex items-center gap-3 mb-5">
              <Icon className={`w-8 h-8 ${cfg.iconColor}`}/>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{cfg.title}</h2>
                <p className="text-sm text-gray-600">{result.message_ar}</p>
              </div>
            </div>

            {/* Device info from cache/API */}
            {result.device_info && (
              <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <DeviceIcon type={result.device_info.device_type}/>
                  معلومات الجهاز
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm text-right">
                  {[
                    ['الماركة', result.device_info.brand],
                    ['الموديل', result.device_info.model],
                    ['النوع', formatDeviceType(result.device_info.device_type)],
                    ['السعة', result.device_info.storage],
                    ['الشبكة', result.device_info.network],
                    ['سنة الإصدار', result.device_info.released],
                  ].filter(([,v]) => v).map(([k, v]) => (
                    <div key={k}>
                      <span className="text-gray-500 block text-xs mb-0.5">{k}</span>
                      <span className="font-medium text-gray-900">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Report details */}
            {result.reports?.map((r, i) => (
              <div key={i} className="bg-white rounded-xl p-4 mb-3 border border-red-200">
                <div className="grid grid-cols-2 gap-3 text-sm text-right mb-3">
                  {[
                    ['الجهاز',     `${r.brand} ${r.model}`],
                    ['النوع',      formatDeviceType(r.device_type)],
                    ['اللون',      r.color],
                    ['نوع البلاغ', r.report_type === 'stolen' ? 'مسروق 🔴' : 'مفقود 🟡'],
                    ['الدولة',     getCountryName(r.country)],
                    ['المدينة',    r.city],
                    ['تاريخ البلاغ', r.report_date ? formatDate(r.report_date) : null],
                  ].filter(([,v]) => v).map(([k, v]) => (
                    <div key={k}>
                      <span className="text-gray-500 block text-xs mb-0.5">{k}</span>
                      <span className="font-medium text-gray-900">{v}</span>
                    </div>
                  ))}
                </div>
                {r.reward_offered && (
                  <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 rounded-lg px-3 py-2 mb-3">
                    <Gift className="w-4 h-4"/>
                    مكافأة مقدمة: {r.reward_amount}
                  </div>
                )}
                {r.contact_available && (
                  <div className="flex gap-2 flex-wrap items-center">
                    <span className="text-xs text-gray-500">التواصل مع الصاحب:</span>
                    {whatsAppHref(r.whatsapp) && (
                      <a href={whatsAppHref(r.whatsapp)} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200 transition-colors">
                        <Phone className="w-3 h-3"/> واتساب
                      </a>
                    )}
                    {r.phone && (
                      <a href={`tel:${r.phone.replace(/\s/g, '')}`}
                        className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors">
                        <Phone className="w-3 h-3"/> هاتف
                      </a>
                    )}
                    {r.email && (
                      <a href={`mailto:${r.email}`}
                        className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors">
                        <Mail className="w-3 h-3"/> إيميل
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Disclaimer */}
            <p className="text-xs text-gray-400 mt-4 flex items-start gap-1">
              <Info className="w-3 h-3 mt-0.5 flex-shrink-0"/>
              {result.disclaimer_ar}
            </p>

            {/* Checked at */}
            <p className="text-xs text-gray-400 mt-1">
              وقت الفحص: {formatDateTime(result.checked_at)}
            </p>
          </div>
        );
      })()}

      {/* Report CTA */}
      {!loading && (
        <div className="card mt-6 bg-primary-50 border-primary-200">
          <p className="text-sm text-primary-700 font-medium mb-3">هل سُرق جهازك؟</p>
          <Link to="/reports/new" className="btn-primary py-2 px-5 text-sm inline-flex items-center gap-2">
            أبلغ عن جهاز مسروق
          </Link>
        </div>
      )}
    </div>
  );
}
