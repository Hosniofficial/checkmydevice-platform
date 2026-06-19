import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Smartphone, Laptop, Tablet, ChevronLeft } from 'lucide-react';
import { StatusBadge, Spinner, EmptyState, Pagination } from '../components/ui/index.jsx';
import api from '../lib/api.js';
import { getCountryName } from '../lib/countries.js';
import { formatDate } from '../lib/format.js';

const DEVICE_TYPE = {
  phone:  { icon: Smartphone, label: 'هاتف',    color: 'text-blue-500 bg-blue-50' },
  laptop: { icon: Laptop,     label: 'لاب توب', color: 'text-violet-500 bg-violet-50' },
  tablet: { icon: Tablet,     label: 'تابلت',   color: 'text-teal-500 bg-teal-50' },
};

export default function MyReportsPage() {
  const [data, setData]       = useState(null);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/reports?page=${page}&limit=10`)
      .then(r => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">بلاغاتي</h1>
          {data?.meta?.total > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">{data.meta.total} بلاغ</p>
          )}
        </div>
        <Link to="/reports/new" className="btn-primary flex items-center gap-2 py-2 px-4 text-sm">
          <Plus className="w-4 h-4" /> بلاغ جديد
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size={40} /></div>
      ) : !data?.items?.length ? (
        <div className="card">
          <EmptyState
            icon={FileText}
            title="لا توجد بلاغات"
            description="لم تقم برفع أي بلاغات بعد. إذا فقدت جهازك أو تعرضت للسرقة، أبلغ عنه الآن."
            action={
              <Link to="/reports/new" className="btn-primary inline-block text-sm py-2 px-5">
                رفع أول بلاغ
              </Link>
            }
          />
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {data.items.map(r => {
              const dt   = DEVICE_TYPE[r.device_type] || DEVICE_TYPE.phone;
              const Icon = dt.icon;
              return (
                <Link key={r.id} to={`/reports/${r.id}`}
                  className="bg-white rounded-2xl border-2 border-transparent hover:border-primary-200 shadow-sm p-4 flex items-center gap-4 transition-all group">

                  {/* Device icon */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${dt.color}`}>
                    <Icon className="w-5 h-5" strokeWidth={1.8} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900">
                      {r.brand} {r.model}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-gray-400">{dt.label}</span>
                      <span className="text-gray-200">·</span>
                      <span className="text-xs text-gray-400">{getCountryName(r.country_code)}</span>
                      <span className="text-gray-200">·</span>
                      <span className="text-xs text-gray-400">{formatDate(r.created_at)}</span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <StatusBadge status={r.status} />
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full
                      ${r.report_type === 'stolen'
                        ? 'bg-red-50 text-red-600'
                        : 'bg-amber-50 text-amber-600'}`}>
                      {r.report_type === 'stolen' ? '🔴 مسروق' : '🟡 مفقود'}
                    </span>
                  </div>

                  <ChevronLeft className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0 transition-colors" />
                </Link>
              );
            })}
          </div>
          <Pagination meta={data.meta} onPage={setPage} />
        </>
      )}
    </div>
  );
}
