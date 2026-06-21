import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock, CheckCircle, XCircle, Users, UserPlus,
  Search, BarChart2, Zap, TrendingUp, ArrowLeft,
  FileText, AlertCircle,
} from 'lucide-react';
import { Spinner, StatusBadge } from '../../components/ui/index.jsx';
import api from '../../lib/api.js';
import { getCountryName } from '../../lib/countries.js';
import SEOHead from '../../components/SEOHead.jsx';
import { formatDate, formatDateLong } from '../../lib/format.js';

// ── StatCard component ────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, iconBg, iconColor, border }) {
  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-5 flex items-start gap-4 ${border || 'border-gray-100'}`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-2xl font-bold text-gray-900 leading-none mb-1">
          {value ?? <span className="text-gray-300 text-lg">—</span>}
        </div>
        <div className="text-sm text-gray-500">{label}</div>
        {sub && <div className="text-xs text-gray-400 mt-1 leading-snug">{sub}</div>}
      </div>
    </div>
  );
}

// ── Acceptance rate card ──────────────────────────────────────────
function AcceptanceRateCard({ approved, rejected }) {
  const total = (Number(approved) || 0) + (Number(rejected) || 0);
  const rate  = total > 0 ? Math.round((Number(approved) / total) * 100) : null;
  const color = rate === null ? 'bg-gray-200' : rate >= 70 ? 'bg-green-500' : rate >= 40 ? 'bg-amber-400' : 'bg-red-500';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-teal-50">
        <TrendingUp className="w-5 h-5 text-teal-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-2xl font-bold text-gray-900 leading-none mb-1">
          {rate !== null ? `${rate}%` : <span className="text-gray-300 text-lg">—</span>}
        </div>
        <div className="text-sm text-gray-500">معدل قبول البلاغات</div>
        {total > 0 && (
          <>
            <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${rate}%` }} />
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {approved} مقبول / {rejected} مرفوض من أصل {total}
            </div>
          </>
        )}
        {total === 0 && <div className="text-xs text-gray-400 mt-1">لا توجد بيانات كافية بعد</div>}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function AdminDashboard() {
  const [stats, setStats]     = useState(null);
  const [recent, setRecent]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats/dashboard'),
      api.get('/admin/reports?status=pending&limit=5'),
    ]).then(([s, r]) => {
      setStats(s.data.data);
      setRecent(r.data.data.items || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size={40} /></div>;

  const r = stats?.reports || {};
  const s = stats?.searches || {};
  const u = stats?.users || {};

  return (
    <div className="space-y-6">
      <SEOHead page="admin/dashboard" />
      <div>
        <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
        <p className="text-sm text-gray-400 mt-1">{formatDateLong(new Date())}</p>
      </div>

      {/* ── Row 1: Reports (4 cards) ──────────────────────────────── */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">البلاغات</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="بلاغات معلقة"
            value={r.pending}
            sub="تحتاج مراجعة"
            icon={Clock}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            border={Number(r.pending) > 0 ? 'border-amber-200' : 'border-gray-100'}
          />
          <StatCard
            label="بلاغات مقبولة"
            value={r.approved}
            sub="في قاعدة البيانات"
            icon={CheckCircle}
            iconBg="bg-green-50"
            iconColor="text-green-600"
          />
          <StatCard
            label="بلاغات مرفوضة"
            value={r.rejected}
            icon={XCircle}
            iconBg="bg-red-50"
            iconColor="text-red-500"
          />
          <AcceptanceRateCard approved={r.approved} rejected={r.rejected} />
        </div>
      </div>

      {/* ── Row 2: Users (2 cards) ────────────────────────────────── */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">المستخدمون</h2>
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            label="إجمالي المستخدمين"
            value={u.total}
            sub={`${u.merchants || 0} تاجر`}
            icon={Users}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />
          <StatCard
            label="مستخدمون جدد اليوم"
            value={u.today}
            icon={UserPlus}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
          />
        </div>
      </div>

      {/* ── Row 3: Search + Cache (3 cards) ──────────────────────── */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">عمليات البحث</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="عمليات البحث اليوم"
            value={s.today}
            icon={Search}
            iconBg="bg-primary-50"
            iconColor="text-primary-600"
          />
          <StatCard
            label="إجمالي عمليات البحث"
            value={s.total}
            icon={BarChart2}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
          />
          <StatCard
            label="أجهزة مخزنة مؤقتاً"
            value={stats?.device_cache?.total}
            sub="تقلل استدعاءات API الخارجية وتحسّن الأداء"
            icon={Zap}
            iconBg="bg-yellow-50"
            iconColor="text-yellow-600"
          />
        </div>
      </div>

      {/* ── Pending reports table ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${Number(r.pending) > 0 ? 'bg-amber-500 animate-pulse' : 'bg-gray-300'}`} />
            الطلبات المعلقة
            <span className="text-sm font-normal text-gray-400">({r.pending || 0})</span>
          </h2>
          <Link to="/admin/reports?status=pending"
            className="text-xs font-medium text-primary-700 hover:text-primary-900 flex items-center gap-1 transition-colors">
            عرض الكل <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        {!recent.length ? (
          <div className="px-6 py-10 text-center">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-5 h-5 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">لا توجد طلبات تحتاج مراجعة حالياً</p>
            <p className="text-xs text-gray-400 mt-1">ستظهر هنا البلاغات الجديدة عند وصولها</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recent.map(item => (
              <Link key={item.id} to={`/admin/reports/${item.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/80 transition-colors group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-medium text-sm text-gray-900">{item.brand} {item.model}</span>
                    <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-2 flex-wrap">
                      <span dir="ltr">{item.owner_email}</span>
                      <span>·</span>
                      <span>{getCountryName(item.country_code)}</span>
                      <span>·</span>
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full
                    ${item.report_type === 'stolen' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                    {item.report_type === 'stolen' ? 'مسروق' : 'مفقود'}
                  </span>
                  <StatusBadge status={item.status} />
                  <ArrowLeft className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
