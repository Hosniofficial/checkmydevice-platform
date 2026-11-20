import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Filter, Search, Smartphone, Laptop, Tablet } from 'lucide-react';
import { StatusBadge, Spinner, Pagination } from '../../components/ui/index.jsx';
import api from '../../lib/api.js';
import { getCountryName } from '../../lib/countries.js';
import { formatDate } from '../../lib/format.js';
import SEOHead from '../../components/SEOHead.jsx';

const STATUS_OPTS = ['', 'pending', 'under_review', 'approved', 'rejected', 'cancelled'];
const STATUS_AR   = { '':'الكل', pending:'معلق', under_review:'قيد المراجعة', approved:'مقبول', rejected:'مرفوض', cancelled:'ملغي' };

const DEVICE_TYPE_ICONS = {
  phone:  { icon: Smartphone, label: 'هاتف',      color: 'text-primary-700' },
  laptop: { icon: Laptop,     label: 'لاب توب',   color: 'text-primary-700' },
  tablet: { icon: Tablet,     label: 'تابلت',     color: 'text-primary-700' },
};

function DeviceTypeCell({ type }) {
  const cfg = DEVICE_TYPE_ICONS[type] || { icon: Smartphone, label: type, color: 'text-gray-400' };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${cfg.color}`}>
      <Icon className="w-3.5 h-3.5" strokeWidth={1.8} />
      {cfg.label}
    </span>
  );
}

function ReportTypeBadge({ type }) {
  if (type === 'stolen')
    return <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">🔴 مسروق</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">🟡 مفقود</span>;
}

function ReportCard({ report }) {
  const type = DEVICE_TYPE_ICONS[report.device_type] || DEVICE_TYPE_ICONS.phone;
  const DeviceIcon = type.icon;

  return (
    <article className="surface-card space-y-4 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
            <DeviceIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate font-bold text-gray-900">{report.brand} {report.model}</h2>
            <p className="mt-0.5 text-xs text-gray-500">{type.label} · {getCountryName(report.country_code) || '—'}</p>
          </div>
        </div>
        <StatusBadge status={report.status} />
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-xl bg-[#f7f6f2] p-3 text-xs">
        <div className="min-w-0">
          <p className="mb-1 text-gray-500">رقم IMEI</p>
          <p className="truncate font-mono text-gray-800" dir="ltr">{report.imei || '—'}</p>
        </div>
        <div className="min-w-0">
          <p className="mb-1 text-gray-500">صاحب البلاغ</p>
          <p className="truncate font-medium text-gray-800">{report.owner_name || '—'}</p>
          <p className="truncate text-gray-500" dir="ltr">{report.owner_email}</p>
        </div>
        <div>
          <p className="mb-1 text-gray-500">نوع البلاغ</p>
          <ReportTypeBadge type={report.report_type} />
        </div>
        <div>
          <p className="mb-1 text-gray-500">تاريخ البلاغ</p>
          <p className="text-gray-800">{formatDate(report.created_at)}</p>
        </div>
      </div>

      <Link to={`/admin/reports/${report.id}`}
        className="flex w-full items-center justify-between rounded-xl border border-primary-100 px-4 py-2.5 text-sm font-semibold text-primary-800 transition-colors hover:bg-primary-50">
        مراجعة البلاغ <ArrowLeft className="h-4 w-4" />
      </Link>
    </article>
  );
}

export default function AdminReports() {
  const [sp]              = useSearchParams();
  const [data, setData]   = useState(null);
  const [page, setPage]   = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: sp.get('status') || '', q: '' });

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page, limit: 15,
      ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
    });
    api.get(`/admin/reports?${params}`)
      .then(r => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, filters]);

  const f = k => e => { setFilters(p => ({ ...p, [k]: e.target.value })); setPage(1); };

  return (
    <div className="space-y-5">
      <SEOHead page="admin/reports" />
      <div>
        <p className="text-sm font-semibold text-accent-500">الإدارة</p>
        <h1 className="mt-1 text-2xl font-bold text-primary-900">إدارة البلاغات</h1>
        <p className="mt-1 text-sm text-gray-500">راجع البلاغات وتابع حالتها قبل اتخاذ القرار.</p>
      </div>

      {/* Filters */}
      <div className="surface-card space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
              <Filter className="h-4 w-4" />
            </div>
            تصفية البلاغات
          </div>
          <span className="rounded-full bg-[#f0eee7] px-3 py-1.5 text-xs text-gray-600">
            {data?.meta?.total ?? '—'} بلاغ
          </span>
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative w-full lg:max-w-xs">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              className="input w-full py-2.5 pr-9 text-sm"
              placeholder="ابحث برقم IMEI أو الماركة"
              aria-label="بحث في البلاغات"
              value={filters.q} onChange={f('q')}
            />
          </div>
          <div className="flex max-w-full gap-1 overflow-x-auto rounded-xl bg-[#f5f3ee] p-1 lg:flex-1">
            {STATUS_OPTS.map(s => (
              <button key={s}
                onClick={() => { setFilters(p => ({ ...p, status: s })); setPage(1); }}
                aria-pressed={filters.status === s}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-all
                  ${filters.status === s ? 'bg-white shadow-sm text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}>
                {STATUS_AR[s]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="surface-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size={36} /></div>
        ) : !data?.items?.length ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7f6f2] text-gray-400">
              <Search className="h-5 w-5" />
            </div>
            <p className="font-semibold text-gray-700">لا توجد بلاغات مطابقة</p>
            <p className="mt-1 text-sm text-gray-500">جرّب تغيير حالة البلاغ أو عبارة البحث.</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 p-3 sm:p-4 2xl:hidden">
              {data.items.map(r => <ReportCard key={r.id} report={r} />)}
            </div>
            <div className="hidden overflow-x-auto 2xl:block">
              <table className="w-full min-w-[1080px] text-sm">
                <thead className="border-b border-[#e7e4dc] bg-[#f5f3ee] text-xs font-medium text-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-right">الجهاز</th>
                    <th className="px-4 py-3 text-right">النوع</th>
                    <th className="px-4 py-3 text-right">IMEI</th>
                    <th className="px-4 py-3 text-right">المالك</th>
                    <th className="px-4 py-3 text-right">الدولة</th>
                    <th className="px-4 py-3 text-right">البلاغ</th>
                    <th className="px-4 py-3 text-right">الحالة</th>
                    <th className="px-4 py-3 text-right">التاريخ</th>
                    <th className="px-4 py-3 text-right">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.items.map(r => (
                    <tr key={r.id} className="transition-colors hover:bg-[#f7f6f2]">
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {r.brand} {r.model}
                      </td>
                      <td className="px-4 py-3">
                        <DeviceTypeCell type={r.device_type} />
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500" dir="ltr">
                        {r.imei}
                      </td>
                      <td className="px-4 py-3 text-xs max-w-[160px]">
                        <div className="text-gray-700 font-medium truncate">{r.owner_name || '—'}</div>
                        <div className="text-gray-400 truncate" dir="ltr">{r.owner_email}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {getCountryName(r.country_code)}
                      </td>
                      <td className="px-4 py-3">
                        <ReportTypeBadge type={r.report_type} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {formatDate(r.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/admin/reports/${r.id}`}
                          className="text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors">
                          مراجعة
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-[#e7e4dc] p-4">
              <Pagination meta={data.meta} onPage={setPage} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
