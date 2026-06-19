import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Search, Plus, ArrowLeft,
  Smartphone, Laptop, Tablet, CreditCard, Zap,
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
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
          <span>{used} مستخدم</span>
          <span>{limit} إجمالي</span>
        </div>
      </div>
    </div>
  );
}

// ── Subscription card ─────────────────────────────────────────────
function SubCard({ sub }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
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

  useEffect(() => {
    Promise.all([
      api.get('/reports?limit=5'),
      api.get('/search/quota'),
      api.get('/plans/current').catch(() => ({ data: { data: null } })),
    ]).then(([r, q, s]) => {
      setReports(r.data.data.items || []);
      setTotal(r.data.data.meta?.total ?? null);
      setQuota(q.data.data);
      setSub(s.data.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size={40} /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Welcome */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900">
          مرحباً، {user?.full_name || user?.email} 👋
        </h1>
        <p className="text-gray-400 text-sm mt-1">لوحة تحكم حسابك</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
        <ReportsStatCard total={totalReports} />
        <QuotaCard quota={quota} />
        <SubCard sub={sub} />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-7">
        <Link to="/search"
          className="bg-white rounded-2xl border-2 border-transparent hover:border-primary-200 shadow-sm p-4 flex items-center gap-4 transition-all group">
          <div className="w-11 h-11 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 transition-colors">
            <Search className="w-5 h-5 text-primary-700" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900">فحص جهاز</div>
            <div className="text-xs text-gray-500 mt-0.5">تحقق من IMEI قبل الشراء</div>
          </div>
          <ArrowLeft className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors" />
        </Link>

        <Link to="/reports/new"
          className="bg-white rounded-2xl border-2 border-transparent hover:border-red-200 shadow-sm p-4 flex items-center gap-4 transition-all group">
          <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-red-100 transition-colors">
            <Plus className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900">بلاغ جديد</div>
            <div className="text-xs text-gray-500 mt-0.5">أبلغ عن جهاز مسروق أو مفقود</div>
          </div>
          <ArrowLeft className="w-4 h-4 text-gray-300 group-hover:text-red-400 transition-colors" />
        </Link>
      </div>

      {/* Recent reports */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" />
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
          <div className="divide-y divide-gray-50">
            {reports.map(r => {
              const dt   = DEVICE_TYPE[r.device_type] || DEVICE_TYPE.phone;
              const Icon = dt.icon;
              return (
                <Link key={r.id} to={`/reports/${r.id}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/80 transition-colors group">
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
        <div className="mt-4 bg-gradient-to-l from-primary-700 to-primary-600 rounded-2xl p-5 text-white flex items-center gap-4">
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
