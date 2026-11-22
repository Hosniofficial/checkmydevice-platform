import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Search, Plus, ArrowLeft,
  Smartphone, Laptop, Tablet, CreditCard, Zap, AlertCircle, RefreshCw,
} from 'lucide-react';
import { useAuthStore } from '../store/auth.store.js';
import { StatusBadge, Spinner } from '../components/ui/index.jsx';
import api from '../lib/api.js';
import { getCountryName } from '../lib/countries.js';
import { formatDate } from '../lib/format.js';

const DEVICE_TYPE = {
  phone:  { icon: Smartphone, color: 'text-blue-500 bg-blue-50' },
  laptop: { icon: Laptop,     color: 'text-violet-500 bg-violet-50' },
  tablet: { icon: Tablet,     color: 'text-teal-500 bg-teal-50' },
};

// ── Quota bar component ───────────────────────────────────────────
function QuotaCard({ quota }) {
  const used      = quota?.used      ?? 0;
  const limit     = quota?.limit     ?? 0;
  const remaining = quota?.remaining ?? 0;
  const pct       = limit > 0 ? Math.round((used / limit) * 100) : 0;
  const barColor  = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-400' : 'bg-green-500';

  return (
    <div className="surface-card p-5 transition-shadow hover:shadow-md">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
          <Search className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900 leading-none">{remaining}</div>
          <div className="text-sm text-gray-500 mt-0.5">بحث متبقٍ اليوم</div>
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>تم استخدام {used}</span>
          <span>{limit} إجمالي</span>
        </div>
      </div>
    </div>
  );
}

// ── Subscription card ─────────────────────────────────────────────
function SubCard({ sub }) {
  return (
    <div className="surface-card p-5 transition-shadow hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
          <CreditCard className="w-5 h-5 text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-lg font-bold text-gray-900 leading-none">
            {sub ? sub.name_ar : 'مجاني'}
          </div>
          <div className="text-sm text-gray-500 mt-0.5">
            {sub
              ? `ينتهي ${formatDate(sub.expires_at)}`
              : <Link to="/plans" className="text-primary-700 hover:underline text-xs">ترقية الخطة ←</Link>
            }
          </div>
        </div>
        {sub && (
          <span className="text-xs font-medium bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full flex-shrink-0">
            نشط
          </span>
        )}
      </div>
    </div>
  );
}

// ── Reports stat card ─────────────────────────────────────────────
function ReportsStatCard({ total }) {
  return (
    <div className="surface-card p-5 transition-shadow hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900 leading-none">{total ?? '—'}</div>
          <div className="text-sm text-gray-500 mt-0.5">إجمالي بلاغاتي</div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function DashboardPage() {
  const { user }  = useAuthStore();
  const [reports, setReports]   = useState([]);
  const [totalReports, setTotal] = useState(null);
  const [quota, setQuota]       = useState(null);
  const [sub, setSub]           = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [r, q, s] = await Promise.all([
        api.get('/reports?limit=5'),
        api.get('/search/quota'),
        api.get('/plans/current').catch(() => ({ data: { data: null } })),
      ]);
      setReports(r.data.data.items || []);
      setTotal(r.data.data.meta?.total ?? null);
      setQuota(q.data.data);
      setSub(s.data.data);
    } catch (err) {
      setError(err.response?.data?.error?.message_ar || 'تعذر تحميل بيانات لوحة التحكم. تحقق من اتصالك ثم أعد المحاولة.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  if (loading) return (
    <div className="mx-auto max-w-5xl px-4 py-10" role="status" aria-label="جاري تحميل لوحة التحكم">
      <div className="surface-card flex min-h-56 items-center justify-center">
        <Spinner size={40} />
      </div>
    </div>
  );

  if (error) return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <section className="surface-card flex flex-col items-center px-5 py-12 text-center" role="alert">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <AlertCircle className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-xl font-bold text-gray-900">تعذر تحميل لوحة التحكم</h1>
        <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">{error}</p>
        <button type="button" onClick={loadDashboard} className="btn-primary mt-5 inline-flex items-center gap-2">
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          إعادة المحاولة
        </button>
      </section>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">

      {/* Welcome */}
      <div className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-l from-[#173e75] to-[#2d619f] p-5 text-white shadow-sm sm:mb-7 sm:p-8">
        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-100">نظرة عامة على حسابك</p>
            <h1 className="mt-1 text-2xl font-bold">
              مرحباً، {user?.full_name || user?.email} 👋
            </h1>
            <p className="mt-2 text-sm leading-6 text-blue-100">تابع بلاغاتك واستخدامك لخدمات CheckMyDevice من مكان واحد.</p>
          </div>
          <Link to="/reports/new" className="inline-flex min-h-11 items-center justify-center gap-2 self-start whitespace-nowrap rounded-xl border border-primary-100 bg-white px-4 py-2.5 text-sm font-bold text-primary-700 shadow-sm transition-colors hover:bg-primary-50 focus-visible:ring-offset-primary-900 sm:self-center">
            <Plus className="h-4 w-4" aria-hidden="true" />
            تسجيل بلاغ جديد
          </Link>
        </div>
        <div aria-hidden="true" className="absolute -left-10 -top-20 h-56 w-56 rounded-full border-[28px] border-white/5" />
      </div>

      {/* Stats row */}
      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ReportsStatCard total={totalReports} />
        <QuotaCard quota={quota} />
        <SubCard sub={sub} />
      </div>

      {/* Quick actions */}
      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link to="/search"
          className="surface-card group flex items-center gap-4 p-4 transition-all hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 transition-colors group-hover:bg-primary-100">
            <Search className="h-5 w-5 text-primary-700" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900">فحص جهاز</div>
            <div className="text-xs text-gray-500 mt-0.5">تحقق من IMEI قبل الشراء</div>
          </div>
          <ArrowLeft className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors" />
        </Link>

        <Link to="/reports/new"
          className="surface-card group flex items-center gap-4 p-4 transition-all hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#f7f6f2] transition-colors group-hover:bg-primary-50">
            <Plus className="h-5 w-5 text-primary-700" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900">بلاغ جديد</div>
            <div className="text-xs text-gray-500 mt-0.5">أبلغ عن جهاز مسروق أو مفقود</div>
          </div>
          <ArrowLeft className="h-4 w-4 text-gray-300 transition-colors group-hover:text-primary-500" aria-hidden="true" />
        </Link>
      </div>

      {/* Recent reports */}
      <div className="surface-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#e7e4dc] bg-[#fcfbf8] px-5 py-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary-700" aria-hidden="true" />
            آخر البلاغات
          </h2>
          <Link to="/reports" className="text-xs font-medium text-primary-700 hover:text-primary-900 flex items-center gap-1 transition-colors">
            عرض الكل <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        {reports.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-sm text-gray-500 font-medium">لا توجد بلاغات بعد</p>
            <p className="text-xs text-gray-400 mt-1 mb-4">ابدأ برفع بلاغ عن جهازك المسروق أو المفقود</p>
            <Link to="/reports/new" className="btn-primary inline-block text-sm py-2 px-5">
              رفع بلاغ
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#f0eee7]">
            {reports.map(r => {
              const dt   = DEVICE_TYPE[r.device_type] || DEVICE_TYPE.phone;
              const Icon = dt.icon;
              return (
                <Link key={r.id} to={`/reports/${r.id}`}
                  className="group flex items-center gap-3 px-4 py-4 transition-colors hover:bg-[#fcfbf8] sm:px-5">
                  {/* Device icon */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${dt.color}`}>
                    <Icon className="w-4 h-4" strokeWidth={1.8} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm text-gray-900">{r.brand} {r.model}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">{formatDate(r.created_at)}</span>
                      <span className="text-gray-200">·</span>
                      <span className="text-xs text-gray-400">{getCountryName(r.country_code)}</span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full hidden sm:inline-flex
                      ${r.report_type === 'stolen' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                      {r.report_type === 'stolen' ? '🔴 مسروق' : '🟡 مفقود'}
                    </span>
                    <StatusBadge status={r.status} />
                    <ArrowLeft className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Upgrade banner — show only on free plan with low quota */}
      {!sub && quota && quota.remaining <= 2 && (
        <div className="mt-4 flex items-center gap-4 rounded-2xl bg-primary-700 p-5 text-white">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">اقتربت من حد البحث اليومي</p>
            <p className="text-xs text-primary-200 mt-0.5">
              {quota.remaining === 0 ? 'استنفدت' : `تبقى لك ${quota.remaining}`} عمليات البحث اليوم — ترقية الخطة تمنحك المزيد
            </p>
          </div>
          <Link to="/plans" className="text-xs font-semibold bg-white text-primary-700 px-3 py-2 rounded-lg hover:bg-primary-50 transition-colors flex-shrink-0">
            ترقية
          </Link>
        </div>
      )}

    </div>
  );
}
