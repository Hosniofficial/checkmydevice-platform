import React, { useEffect, useState } from 'react';
import {
  Shield, User, FileText, ChevronDown, ChevronUp,
  Filter, Search, Clock, Trash2, CheckCircle,
  XCircle, LogIn, Key, RefreshCw, CreditCard, UserCog,
} from 'lucide-react';
import { Spinner, Pagination } from '../../components/ui/index.jsx';
import api from '../../lib/api.js';
import { formatDateTime } from '../../lib/format.js';

// ── Action config — icon + label + color ──────────────────────────
const ACTION_CONFIG = {
  'user.login':            { icon: LogIn,        label: 'تسجيل دخول',    color: 'bg-blue-50 text-blue-700' },
  'user.registered':       { icon: User,         label: 'تسجيل جديد',    color: 'bg-indigo-50 text-indigo-700' },
  'user.role_changed':     { icon: UserCog,      label: 'تغيير الدور',   color: 'bg-purple-50 text-purple-700' },
  'user.suspended':        { icon: XCircle,      label: 'إيقاف حساب',    color: 'bg-red-50 text-red-700' },
  'user.active':           { icon: CheckCircle,  label: 'تفعيل حساب',    color: 'bg-green-50 text-green-700' },
  'user.deleted':          { icon: Trash2,       label: 'حذف حساب',      color: 'bg-red-50 text-red-700' },
  'report.created':        { icon: FileText,     label: 'بلاغ جديد',     color: 'bg-gray-100 text-gray-700' },
  'report.approved':       { icon: CheckCircle,  label: 'قبول بلاغ',     color: 'bg-green-50 text-green-700' },
  'report.rejected':       { icon: XCircle,      label: 'رفض بلاغ',      color: 'bg-red-50 text-red-700' },
  'report.deleted':        { icon: Trash2,       label: 'حذف بلاغ',      color: 'bg-red-100 text-red-800' },
  'report.cancelled':      { icon: XCircle,      label: 'إلغاء بلاغ',    color: 'bg-gray-100 text-gray-600' },
  'subscription.activated':{ icon: CreditCard,   label: 'تفعيل اشتراك',  color: 'bg-teal-50 text-teal-700' },
};

function getActionCfg(action) {
  if (!action) return { icon: Clock, label: action || '—', color: 'bg-gray-100 text-gray-500' };
  return ACTION_CONFIG[action] || {
    icon: RefreshCw,
    label: action,
    color: action.startsWith('user.')         ? 'bg-blue-50 text-blue-700'
         : action.startsWith('report.')       ? 'bg-amber-50 text-amber-700'
         : action.startsWith('subscription.') ? 'bg-teal-50 text-teal-700'
         : 'bg-gray-100 text-gray-600',
  };
}

function ActionBadge({ action }) {
  const cfg  = getActionCfg(action);
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      {cfg.label}
    </span>
  );
}

function EntityIcon({ type }) {
  if (type === 'user')         return <User     className="w-3.5 h-3.5 text-blue-500 inline ml-1" />;
  if (type === 'report')       return <FileText  className="w-3.5 h-3.5 text-amber-500 inline ml-1" />;
  if (type === 'subscription') return <Shield    className="w-3.5 h-3.5 text-teal-500 inline ml-1" />;
  return null;
}

const ENTITY_LABELS = { user: 'مستخدم', report: 'بلاغ', subscription: 'اشتراك' };

function formatIp(ip) {
  if (!ip || ip === '::1' || ip === '127.0.0.1') return 'محلي';
  return ip;
}

function JsonDiff({ oldData, newData }) {
  if (!oldData && !newData) return <p className="text-xs text-gray-400 py-2">لا توجد بيانات إضافية</p>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs" dir="ltr">
      <div>
        <div className="text-gray-400 mb-1.5 font-medium text-right" dir="rtl">قبل التغيير</div>
        <pre className="bg-gray-50 rounded-xl p-3 overflow-auto max-h-40 text-gray-600 border border-gray-100 leading-relaxed">
          {oldData ? JSON.stringify(oldData, null, 2) : 'null'}
        </pre>
      </div>
      <div>
        <div className="text-gray-400 mb-1.5 font-medium text-right" dir="rtl">بعد التغيير</div>
        <pre className="bg-gray-50 rounded-xl p-3 overflow-auto max-h-40 text-gray-700 border border-gray-100 leading-relaxed">
          {newData ? JSON.stringify(newData, null, 2) : 'null'}
        </pre>
      </div>
    </div>
  );
}

// ── Entity type options ───────────────────────────────────────────
const ENTITY_TYPES = [
  { value: '',             label: 'كل الأنواع' },
  { value: 'user',         label: 'مستخدم' },
  { value: 'report',       label: 'بلاغ' },
  { value: 'subscription', label: 'اشتراك' },
];

// ── Main component ────────────────────────────────────────────────
export default function AdminAuditLogs() {
  const [data, setData]               = useState(null);
  const [page, setPage]               = useState(1);
  const [loading, setLoading]         = useState(true);
  const [actionQ, setActionQ]         = useState('');
  const [entityType, setEntityType]   = useState('');
  const [expanded, setExpanded]       = useState(null);

  const load = (p = page) => {
    setLoading(true);
    const params = new URLSearchParams({ page: p, limit: 20 });
    if (actionQ)    params.set('action', actionQ);
    if (entityType) params.set('entity_type', entityType);
    api.get(`/admin/audit-logs?${params}`)
      .then(r => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, entityType]);
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(1); }, 400);
    return () => clearTimeout(t);
  }, [actionQ]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">سجل الأحداث</h1>
        <p className="text-sm text-gray-500 mt-1">
          جميع الإجراءات الإدارية مسجّلة تلقائياً — اضغط على أي سطر لعرض تفاصيل التغيير.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />

        {/* Action search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="border border-gray-200 rounded-lg pr-9 pl-4 py-2 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="بحث في الإجراء..."
            value={actionQ}
            onChange={e => setActionQ(e.target.value)}
          />
        </div>

        {/* Entity type tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {ENTITY_TYPES.map(t => (
            <button key={t.value}
              onClick={() => { setEntityType(t.value); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${entityType === t.value ? 'bg-white shadow text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-gray-400 mr-auto">
          {data?.meta?.total ?? '—'} حدث
        </span>
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
                <thead className="bg-gray-50 text-xs font-medium text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 w-10" />
                    <th className="px-4 py-3 text-right">المستخدم</th>
                    <th className="px-4 py-3 text-right">الإجراء</th>
                    <th className="px-4 py-3 text-right">النوع</th>
                    <th className="px-4 py-3 text-right">التاريخ والوقت</th>
                    <th className="px-4 py-3 text-right">المصدر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.items.map(row => (
                    <React.Fragment key={row.id}>
                      {/* Main row */}
                      <tr
                        className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
                        onClick={() => setExpanded(prev => prev === row.id ? null : row.id)}
                      >
                        {/* Expand toggle */}
                        <td className="px-4 py-3">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors
                            ${expanded === row.id ? 'bg-primary-100 text-primary-700' : 'text-gray-300 group-hover:text-gray-500'}`}>
                            {expanded === row.id
                              ? <ChevronUp className="w-3.5 h-3.5" />
                              : <ChevronDown className="w-3.5 h-3.5" />}
                          </div>
                        </td>

                        {/* User email */}
                        <td className="px-4 py-3 text-xs text-gray-600 font-medium" dir="ltr">
                          {row.user_email || <span className="text-gray-300">نظام</span>}
                        </td>

                        {/* Action badge */}
                        <td className="px-4 py-3">
                          <ActionBadge action={row.action} />
                        </td>

                        {/* Entity type */}
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {row.entity_type ? (
                            <span className="inline-flex items-center gap-1">
                              <EntityIcon type={row.entity_type} />
                              {ENTITY_LABELS[row.entity_type] || row.entity_type}
                            </span>
                          ) : '—'}
                        </td>

                        {/* DateTime */}
                        <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                          {formatDateTime(row.created_at)}
                        </td>

                        {/* IP */}
                        <td className="px-4 py-3">
                          <span className={`text-xs font-mono px-2 py-0.5 rounded-md
                            ${formatIp(row.ip_address) === 'محلي'
                              ? 'bg-gray-100 text-gray-400'
                              : 'bg-blue-50 text-blue-600'}`}>
                            {formatIp(row.ip_address)}
                          </span>
                        </td>
                      </tr>

                      {/* Expanded detail row */}
                      {expanded === row.id && (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 bg-gray-50/60 border-b border-gray-100">
                            <JsonDiff oldData={row.old_data} newData={row.new_data} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-gray-50">
              <Pagination meta={data.meta} onPage={p => { setPage(p); setExpanded(null); }} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
