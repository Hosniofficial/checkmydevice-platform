import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, Search, Smartphone, Laptop, Tablet } from 'lucide-react';
import { StatusBadge, Spinner, Pagination } from '../../components/ui/index.jsx';
import api from '../../lib/api.js';
import { getCountryName } from '../../lib/countries.js';
import { formatDate } from '../../lib/format.js';

const STATUS_OPTS = ['', 'pending', 'under_review', 'approved', 'rejected', 'cancelled'];
const STATUS_AR   = { '':'الكل', pending:'معلق', under_review:'قيد المراجعة', approved:'مقبول', rejected:'مرفوض', cancelled:'ملغي' };

const DEVICE_TYPE_ICONS = {
  phone:  { icon: Smartphone, label: 'هاتف',      color: 'text-blue-500' },
  laptop: { icon: Laptop,     label: 'لاب توب',   color: 'text-violet-500' },
  tablet: { icon: Tablet,     label: 'تابلت',     color: 'text-teal-500' },
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">إدارة البلاغات</h1>
        <p className="text-sm text-gray-500 mt-1">{data?.meta?.total ?? '—'} بلاغ إجمالي</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <div className="relative">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="border border-gray-200 rounded-lg pr-9 pl-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-52"
            placeholder="بحث بـ IMEI أو الماركة..."
            value={filters.q} onChange={f('q')}
          />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {STATUS_OPTS.map(s => (
            <button key={s}
              onClick={() => { setFilters(p => ({ ...p, status: s })); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${filters.status === s ? 'bg-white shadow text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}>
              {STATUS_AR[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size={36} /></div>
        ) : !data?.items?.length ? (
          <div className="text-center py-16 text-gray-400 text-sm">لا توجد نتائج</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs font-medium">
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
                    <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
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
            <div className="p-4 border-t border-gray-50">
              <Pagination meta={data.meta} onPage={setPage} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
