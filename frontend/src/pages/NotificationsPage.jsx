import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { Spinner, EmptyState, Pagination } from '../components/ui/index.jsx';
import api from '../lib/api.js';
import toast from 'react-hot-toast';
import { formatDateTime } from '../lib/format.js';

export default function NotificationsPage() {
  const [data, setData]   = useState(null);
  const [page, setPage]   = useState(1);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get(`/notifications?page=${page}&limit=15`)
      .then(r => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const readAll = async () => {
    await api.patch('/notifications/read-all');
    toast.success('تم تعليم الكل كمقروء');
    load();
  };

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    setData(prev => ({
      ...prev,
      items: prev.items.map(n => n.id === id ? { ...n, is_read: true } : n),
    }));
  };

  const TYPE_ICON = {
    report_approved:      '✅',
    report_rejected:      '❌',
    device_searched:      '🔍',
    device_found:         '🎉',
    subscription_expiring:'⏰',
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">الإشعارات</h1>
          {data?.unread_count > 0 && (
            <span className="text-sm text-primary-700 font-medium">{data.unread_count} غير مقروء</span>
          )}
        </div>
        {data?.unread_count > 0 && (
          <button onClick={readAll} className="btn-outline py-2 px-4 text-sm flex items-center gap-2">
            <CheckCheck className="w-4 h-4"/> تعليم الكل كمقروء
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size={40}/></div>
      ) : !data?.items?.length ? (
        <div className="card">
          <EmptyState icon={Bell} title="لا توجد إشعارات" description="ستظهر الإشعارات هنا عند وصولها"/>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {data.items.map(n => (
              <div key={n.id}
                onClick={() => !n.is_read && markRead(n.id)}
                className={`flex gap-4 p-4 rounded-xl border cursor-pointer transition-colors
                  ${n.is_read ? 'bg-white border-gray-100' : 'bg-primary-50 border-primary-200'}`}>
                <div className="text-2xl flex-shrink-0 w-10 text-center">
                  {TYPE_ICON[n.type] || '🔔'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${n.is_read ? 'text-gray-700' : 'text-gray-900'}`}>
                    {n.title_ar}
                  </p>
                  {n.body_ar && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{n.body_ar}</p>}
                  <p className="text-xs text-gray-400 mt-2">
                    {formatDateTime(n.created_at)}
                  </p>
                </div>
                {!n.is_read && <div className="w-2 h-2 bg-primary-700 rounded-full flex-shrink-0 mt-2"/>}
              </div>
            ))}
          </div>
          <Pagination meta={data.meta} onPage={setPage}/>
        </>
      )}
    </div>
  );
}
