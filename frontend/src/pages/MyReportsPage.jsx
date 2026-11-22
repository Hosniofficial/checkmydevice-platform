import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Smartphone, Laptop, Tablet, ChevronLeft, AlertCircle, RefreshCw } from 'lucide-react';
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
  const [error, setError]     = useState(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/reports?page=${page}&limit=10`);
      setData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error?.message_ar || 'تعذر تحميل بلاغاتك. تحقق من اتصالك ثم أعد المحاولة.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { loadReports(); }, [loadReports]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-5 rounded-3xl border border-[#e7e4dc] bg-white p-5 shadow-sm sm:mb-7 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
            <FileText className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-accent-500">متابعة الأجهزة</p>
            <h1 className="mt-1 text-2xl font-bold text-primary-900">بلاغاتي</h1>
            <p className="mt-2 text-sm leading-6 text-gray-500">تابع حالة البلاغات التي أرسلتها وأدر تفاصيل كل بلاغ.</p>
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          {data?.meta?.total > 0 && (
            <span className="rounded-xl bg-[#f7f6f2] px-3 py-2 text-center text-xs font-medium text-gray-600">
              {data.meta.total} بلاغ
            </span>
          )}
          <Link to="/reports/new" className="btn-primary flex w-full items-center justify-center gap-2 py-2.5 text-sm sm:w-auto sm:px-4">
            <Plus className="w-4 h-4" /> بلاغ جديد
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="surface-card flex min-h-56 items-center justify-center" role="status" aria-label="جاري تحميل البلاغات">
          <Spinner size={40} />
        </div>
      ) : error ? (
        <section className="surface-card flex flex-col items-center px-5 py-12 text-center" role="alert">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertCircle className="h-6 w-6" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-xl font-bold text-gray-900">تعذر تحميل البلاغات</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">{error}</p>
          <button type="button" onClick={loadReports} className="btn-primary mt-5 inline-flex items-center gap-2">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            إعادة المحاولة
          </button>
        </section>
      ) : !data?.items?.length ? (
        <div className="surface-card px-5 py-2">
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
                  className="surface-card group flex items-center gap-3 p-4 transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:bg-white hover:shadow-md sm:gap-4">

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
