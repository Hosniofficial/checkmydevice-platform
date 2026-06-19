import React, { useState } from 'react';
import {
  Search, Shield, ShieldAlert, HelpCircle, CheckCircle,
  Smartphone, Clock, X, Database, Wifi,
} from 'lucide-react';
import { Spinner, StatusBadge } from '../../components/ui/index.jsx';
import api from '../../lib/api.js';
import { getCountryName } from '../../lib/countries.js';
import { formatDate, formatDateTime } from '../../lib/format.js';

// ── helpers ───────────────────────────────────────────────────────
function overallStatus(reports = []) {
  const approved = reports.filter(r => r.status === 'approved');
  if (!approved.length) return 'clean';
  return approved[0].report_type; // 'stolen' | 'lost'
}

function OverallBadge({ reports }) {
  const status = overallStatus(reports);
  if (status === 'clean')
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-green-50 text-green-700 border border-green-200">
        <CheckCircle className="w-4 h-4" /> نظيف ✅
      </span>
    );
  if (status === 'stolen')
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-red-50 text-red-700 border border-red-200">
        <ShieldAlert className="w-4 h-4" /> مسروق 🔴
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200">
      <HelpCircle className="w-4 h-4" /> مفقود 🟡
    </span>
  );
}

function DeviceInfoCard({ info, source, dbCache }) {
  const rows = [
    { label: 'الماركة',    value: info?.brand },
    { label: 'الموديل',    value: info?.model },
    { label: 'الكود التقني', value: info?.model_code },
    { label: 'نوع الجهاز', value: info?.device_type },
    { label: 'التخزين',    value: info?.storage },
    { label: 'اللون',      value: info?.color },
    { label: 'الشبكة',     value: info?.network },
    { label: 'سنة الإصدار', value: info?.released },
  ].filter(r => r.value);

  const sourceLabel = {
    redis_cache: '⚡ Redis Cache',
    db_cache:    '🗄️ قاعدة البيانات',
    api:         '🌐 API خارجي',
    api_error:   '⚠️ خطأ في API',
  }[source] || source;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Smartphone className="w-4 h-4 text-primary-600" /> معلومات الجهاز
        </div>
        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">{sourceLabel}</span>
      </div>
      {rows.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {rows.map(r => (
            <div key={r.label} className="bg-gray-50 rounded-xl px-3 py-2.5">
              <div className="text-xs text-gray-400 mb-0.5">{r.label}</div>
              <div className="text-sm font-medium text-gray-800">{r.value}</div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 bg-gray-50 rounded-xl px-4 py-3">
          لا توجد معلومات متاحة عن هذا الجهاز
        </p>
      )}
    </div>
  );
}

function AllReportsCard({ reports }) {
  if (!reports?.length) return (
    <div className="mt-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
        <Shield className="w-4 h-4 text-gray-400" /> البلاغات
      </div>
      <p className="text-sm text-gray-400 bg-gray-50 rounded-xl px-4 py-3">لا توجد بلاغات لهذا الجهاز</p>
    </div>
  );

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
        <ShieldAlert className="w-4 h-4 text-red-500" />
        البلاغات ({reports.length})
        <span className="text-xs font-normal text-gray-400 mr-1">— جميع الحالات</span>
      </div>
      <div className="space-y-3">
        {reports.map((rep, i) => (
          <div key={rep.id || i} className="border border-gray-100 rounded-xl p-4 space-y-3">
            {/* Header row */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full
                  ${rep.report_type === 'stolen' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                  {rep.report_type === 'stolen' ? '🔴 مسروق' : '🟡 مفقود'}
                </span>
                <StatusBadge status={rep.status} />
              </div>
              <span className="text-xs text-gray-400">{formatDate(rep.created_at)}</span>
            </div>

            {/* Owner info — admin-only data */}
            {(rep.owner_email || rep.owner_name) && (
              <div className="bg-blue-50 rounded-lg px-3 py-2 text-xs">
                <span className="text-blue-500 font-medium">صاحب البلاغ: </span>
                <span className="text-blue-800">{rep.owner_name || '—'}</span>
                {rep.owner_email && (
                  <span className="text-blue-600 mr-2" dir="ltr">({rep.owner_email})</span>
                )}
              </div>
            )}

            {/* Location */}
            {(rep.country_code || rep.city) && (
              <div className="grid grid-cols-2 gap-x-4 text-sm">
                {rep.country_code && <div><span className="text-gray-400 text-xs">الدولة: </span><span>{getCountryName(rep.country_code)}</span></div>}
                {rep.city         && <div><span className="text-gray-400 text-xs">المدينة: </span><span>{rep.city}</span></div>}
              </div>
            )}

            {/* Contact */}
            {(rep.contact_phone || rep.contact_whatsapp || rep.contact_email) && (
              <div className="pt-2 border-t border-gray-100 space-y-1 text-xs text-gray-600">
                <div className="font-medium text-gray-700 mb-1">بيانات التواصل</div>
                {rep.contact_phone    && <div>📞 {rep.contact_phone}</div>}
                {rep.contact_whatsapp && <div>💬 واتساب: {rep.contact_whatsapp}</div>}
                {rep.contact_email    && <div dir="ltr">✉️ {rep.contact_email}</div>}
              </div>
            )}

            {/* Reward */}
            {rep.reward_offered && (
              <div className="text-xs font-medium text-green-700 bg-green-50 rounded-lg px-3 py-1.5">
                💰 يوجد مكافأة {rep.reward_amount ? `— ${rep.reward_amount} ${rep.reward_currency || ''}` : ''}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────
export default function AdminSearch() {
  const [imei, setImei]       = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState('');
  const [history, setHistory] = useState([]);

  const doSearch = (searchImei) => {
    const target = (searchImei || imei).trim();
    if (!/^\d{14,16}$/.test(target)) { setError('يجب أن يتكون IMEI من 14 إلى 16 رقمًا'); return; }
    setError('');
    setResult(null);
    setLoading(true);
    api.get(`/admin/search/${target}`)
      .then(r => {
        const data = r.data.data;
        setResult(data);
        setHistory(prev => {
          const status = overallStatus(data.reports || []);
          const entry  = { imei: target, status, timestamp: new Date() };
          return [entry, ...prev.filter(h => h.imei !== target)].slice(0, 10);
        });
      })
      .catch(e => setError(e.response?.data?.error?.message_ar || 'حدث خطأ أثناء البحث'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">بحث IMEI</h1>
        <p className="text-sm text-gray-500 mt-1">
          بحث مباشر في قاعدة البيانات والـ API الخارجي — يعرض جميع البلاغات بكل الحالات مع بيانات المالك.
        </p>
      </div>

      {/* Search input */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" inputMode="numeric" dir="ltr"
              className="w-full border border-gray-200 rounded-xl pr-10 pl-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 tracking-widest"
              placeholder="أدخل رقم IMEI (14–16 رقمًا)"
              value={imei} maxLength={16}
              onChange={e => { setImei(e.target.value.replace(/\D/g, '')); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && doSearch()}
            />
          </div>
          <button onClick={() => doSearch()} disabled={loading || !imei}
            className="btn-primary px-6 py-3 text-sm font-medium disabled:opacity-50 flex items-center gap-2">
            {loading ? <Spinner size={18} /> : <Search className="w-4 h-4" />}
            بحث
          </button>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5">
            <X className="w-4 h-4 flex-shrink-0" /> {error}
          </p>
        )}
        {/* Info chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            { icon: Database, label: 'جميع البلاغات (كل الحالات)' },
            { icon: Wifi,     label: 'بيانات الجهاز من DB + API' },
            { icon: Shield,   label: 'IMEI كامل بدون إخفاء' },
          ].map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
              <Icon className="w-3.5 h-3.5" /> {label}
            </span>
          ))}
        </div>
      </div>

      {loading && <div className="flex justify-center py-12"><Spinner size={40} /></div>}

      {/* Result card */}
      {!loading && result && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          {/* IMEI header */}
          <div className="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-gray-100 mb-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">رقم IMEI</p>
              <p className="font-mono text-lg font-bold text-gray-900 tracking-widest" dir="ltr">
                {result.imei}
              </p>
            </div>
            <OverallBadge reports={result.reports} />
          </div>

          <DeviceInfoCard
            info={result.device_info}
            source={result.lookup_source}
            dbCache={result.db_cache}
          />
          <AllReportsCard reports={result.reports} />
        </div>
      )}

      {/* Recent searches */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Clock className="w-4 h-4 text-gray-400" /> آخر عمليات البحث
            </div>
            <button onClick={() => setHistory([])}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1">
              <X className="w-3.5 h-3.5" /> مسح الكل
            </button>
          </div>
          <div className="space-y-2">
            {history.map((item, i) => (
              <button key={i} onClick={() => { setImei(item.imei); doSearch(item.imei); }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-50 text-sm">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  <span className="font-mono text-gray-700 tracking-widest" dir="ltr">{item.imei}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium ${
                    item.status === 'clean'  ? 'text-green-600' :
                    item.status === 'stolen' ? 'text-red-600'   :
                    item.status === 'lost'   ? 'text-amber-600' : 'text-gray-500'}`}>
                    {item.status === 'clean'  ? 'نظيف ✅'  :
                     item.status === 'stolen' ? 'مسروق 🔴' :
                     item.status === 'lost'   ? 'مفقود 🟡' : item.status}
                  </span>
                  <span className="text-xs text-gray-300">{formatDate(item.timestamp)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
