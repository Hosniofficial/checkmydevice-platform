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
    <div className={`surface-card p-5 ${border || ''}`}>
      <div className="flex items-center justify-between gap-3">
        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <span className="text-sm font-medium text-gray-500">{label}</span>
      </div>
      <div className="mt-5">
        <div className="text-3xl font-bold leading-none text-primary-900">
          {value ?? <span className="text-gray-300 text-lg">—</span>}
        </div>
        {sub && <div className="mt-2 text-xs leading-snug text-gray-500">{sub}</div>}
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
    <div className="surface-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50">
          <TrendingUp className="h-5 w-5 text-primary-700" />
        </div>
        <div className="text-sm font-medium text-gray-500">معدل قبول البلاغات</div>
      </div>
      <div className="mt-5">
        <div className="text-3xl font-bold leading-none text-primary-900">
          {rate !== null ? `${rate}%` : <span className="text-gray-300 text-lg">—</span>}
        </div>
        {total > 0 && (
          <>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#eeece5]">
              <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${rate}%` }} />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {approved} مقبول / {rejected} مرفوض من أصل {total}
            </div>
          </>
        )}
        {total === 0 && <div className="mt-2 text-xs text-gray-500">لا توجد بيانات كافية بعد</div>}
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
        <p className="text-sm font-semibold text-accent-500">الإدارة</p>
        <h1 className="mt-1 text-2xl font-bold text-primary-900">لوحة التحكم</h1>
        <p className="mt-1 text-sm text-gray-500">ملخص البلاغات والمستخدمين وعمليات البحث</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#f0eee7] px-3 py-2 text-xs text-gray-600">
            {formatDateLong(new Date())}
          </span>
          <Link to="/admin/reports?status=pending" className="btn-primary flex items-center justify-center gap-2 px-4 py-2.5 text-sm">
            <Clock className="h-4 w-4" /> مراجعة البلاغات
          </Link>
          <Link to="/admin/users" className="btn-outline flex items-center justify-center px-4 py-2.5 text-sm">
            المستخدمون
          </Link>
        </div>
      </div>

      {/* ── Row 1: Reports (4 cards) ──────────────────────────────── */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 px-1 text-sm font-bold text-primary-900">
          <span className="h-5 w-1 rounded-full bg-primary-700" /> البلاغات
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="بلاغات معلقة"
            value={r.pending}
            sub="تحتاج مراجعة"
            icon={Clock}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            border={Number(r.pending) > 0 ? 'border-amber-200' : 'border-[#e7e4dc]'}
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
        <h2 className="mb-3 flex items-center gap-2 px-1 text-sm font-bold text-primary-900">
          <span className="h-5 w-1 rounded-full bg-primary-700" /> المستخدمون
        </h2>
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
        <h2 className="mb-3 flex items-center gap-2 px-1 text-sm font-bold text-primary-900">
          <span className="h-5 w-1 rounded-full bg-primary-700" /> عمليات البحث
        </h2>
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
      <div className="surface-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e7e4dc] px-5 py-4 sm:px-6">
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
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7f6f2]">
              <FileText className="w-5 h-5 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">لا توجد طلبات تحتاج مراجعة حالياً</p>
            <p className="text-xs text-gray-400 mt-1">ستظهر هنا البلاغات الجديدة عند وصولها</p>
          </div>
        ) : (
          <div className="divide-y divide-[#eeece5]">
            {recent.map(item => (
              <Link key={item.id} to={`/admin/reports/${item.id}`}
                className="group flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-[#f7f6f2] sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-50">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-medium text-sm text-gray-900">{item.brand} {item.model}</span>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                      <span dir="ltr">{item.owner_email}</span>
                      <span>·</span>
                      <span>{getCountryName(item.country_code)}</span>
                      <span>·</span>
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-3">
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
