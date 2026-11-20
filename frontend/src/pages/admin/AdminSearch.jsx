import React, { useState } from 'react';
import {
  Search, Shield, ShieldAlert, HelpCircle, CheckCircle,
  Smartphone, Clock, X, Database, Wifi,
} from 'lucide-react';
import { Spinner, StatusBadge } from '../../components/ui/index.jsx';
import api from '../../lib/api.js';
import { getCountryName } from '../../lib/countries.js';
import { formatDate, formatDateTime } from '../../lib/format.js';
import SEOHead from '../../components/SEOHead.jsx';

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
            <div key={r.label} className="rounded-xl bg-[#f7f6f2] px-3 py-2.5">
              <div className="text-xs text-gray-400 mb-0.5">{r.label}</div>
              <div className="text-sm font-medium text-gray-800">{r.value}</div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-xl bg-[#f7f6f2] px-4 py-3 text-sm text-gray-400">
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
      <p className="rounded-xl bg-[#f7f6f2] px-4 py-3 text-sm text-gray-400">لا توجد بلاغات لهذا الجهاز</p>
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
          <div key={rep.id || i} className="space-y-3 rounded-xl border border-[#e7e4dc] p-4">
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
              <div className="rounded-lg bg-primary-50 px-3 py-2 text-xs">
                <span className="font-medium text-primary-600">صاحب البلاغ: </span>
                <span className="text-primary-900">{rep.owner_name || '—'}</span>
                {rep.owner_email && (
                  <span className="mr-2 text-primary-700" dir="ltr">({rep.owner_email})</span>
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
      <SEOHead page="admin/search" />
      <div>
        <p className="text-sm font-semibold text-accent-500">الإدارة</p>
        <h1 className="mt-1 text-2xl font-bold text-primary-900">بحث IMEI</h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-500">
          بحث مباشر في قاعدة البيانات والـ API الخارجي — يعرض جميع البلاغات بكل الحالات مع بيانات المالك.
        </p>
      </div>

      {/* Search input */}
      <section className="surface-card overflow-hidden">
        <div className="flex items-center gap-3 border-b border-[#e7e4dc] bg-[#f5f3ee] px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-800">
            <Search className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">استعلام عن جهاز</h2>
            <p className="mt-0.5 text-xs text-gray-500">أدخل رقم IMEI كاملاً لعرض معلومات الجهاز والبلاغات المرتبطة به.</p>
          </div>
        </div>
        <div className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text" inputMode="numeric" dir="ltr"
                className="input w-full pl-4 pr-11 text-left font-mono tracking-widest"
                placeholder="أدخل رقم IMEI (14–16 رقمًا)"
                aria-label="رقم IMEI للبحث"
                value={imei} maxLength={16}
                onChange={e => { setImei(e.target.value.replace(/\D/g, '')); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && doSearch()}
              />
            </div>
            <button onClick={() => doSearch()} disabled={loading || !imei}
              className="btn-primary flex w-full items-center justify-center gap-2 px-7 py-3 text-sm font-semibold disabled:opacity-50 sm:w-auto">
              {loading ? <Spinner size={18} /> : <Search className="h-4 w-4" />}
              بحث
            </button>
          </div>
          {error && (
            <p role="alert" className="mt-3 flex items-center gap-1.5 text-sm text-red-600">
              <X className="h-4 w-4 flex-shrink-0" /> {error}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { icon: Database, label: 'البلاغات بجميع الحالات' },
              { icon: Wifi,     label: 'مصادر بيانات متعددة' },
              { icon: Shield,   label: 'عرض إداري كامل' },
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-1.5 rounded-lg border border-[#e7e4dc] bg-white px-3 py-1.5 text-xs text-gray-600">
                <Icon className="h-3.5 w-3.5 text-primary-700" /> {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {loading && <div className="flex justify-center py-12"><Spinner size={40} /></div>}

      {/* Result card */}
      {!loading && result && (
        <section className="surface-card overflow-hidden">
          {/* IMEI header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e7e4dc] bg-[#f5f3ee] px-5 py-4">
            <div>
              <p className="mb-1 text-xs text-gray-500">نتيجة الاستعلام</p>
              <p className="font-mono text-lg font-bold tracking-widest text-gray-900" dir="ltr">
                {result.imei}
              </p>
            </div>
            <OverallBadge reports={result.reports} />
          </div>

          <div className="p-5">
            <DeviceInfoCard
              info={result.device_info}
              source={result.lookup_source}
              dbCache={result.db_cache}
            />
            <AllReportsCard reports={result.reports} />
          </div>
        </section>
      )}

      {!loading && !result && !error && (
        <div className="surface-card px-5 py-10 text-center sm:py-14">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
            <Smartphone className="h-7 w-7" />
          </div>
          <h2 className="font-bold text-gray-800">ابدأ بالبحث عن جهاز</h2>
          <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-gray-500">
            ستظهر هنا تفاصيل الجهاز وملخص البلاغات بعد إدخال رقم IMEI صحيح.
          </p>
        </div>
      )}

      {/* Recent searches */}
      {history.length > 0 && (
        <div className="surface-card p-5">
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
                className="flex w-full flex-wrap items-center justify-between gap-2 rounded-xl border border-[#e7e4dc] px-4 py-3 text-sm transition-colors hover:bg-[#f7f6f2]">
                <div className="flex min-w-0 items-center gap-3">
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
