import React, { useEffect, useState } from 'react';
import {
  Search, UserX, UserCheck, CreditCard, Copy,
  ShieldCheck, ShieldAlert, User, Store, Crown, Shield,
  CheckCircle, Ban, Clock,
} from 'lucide-react';
import { Spinner, Pagination, ConfirmDialog } from '../../components/ui/index.jsx';
import { useAuthStore } from '../../store/auth.store.js';
import api from '../../lib/api.js';
import toast from 'react-hot-toast';
import { getCountryName } from '../../lib/countries.js';
import { formatDate } from '../../lib/format.js';

// ── Config ────────────────────────────────────────────────────────
const ROLE_CONFIG = {
  user:        { label: 'مستخدم',   icon: User,       color: 'bg-gray-100 text-gray-700' },
  merchant:    { label: 'تاجر',     icon: Store,      color: 'bg-blue-50 text-blue-700' },
  admin:       { label: 'مشرف',     icon: ShieldCheck, color: 'bg-purple-50 text-purple-700' },
  super_admin: { label: 'مدير عام', icon: Crown,       color: 'bg-amber-50 text-amber-700' },
};

const STATUS_CONFIG = {
  active:         { label: 'نشط',              icon: CheckCircle, color: 'bg-green-50 text-green-700',  dot: 'bg-green-500' },
  suspended:      { label: 'موقوف',            icon: Ban,         color: 'bg-red-50 text-red-700',      dot: 'bg-red-500' },
  pending_verify: { label: 'بانتظار التفعيل',  icon: Clock,       color: 'bg-amber-50 text-amber-700',  dot: 'bg-amber-400' },
};

const ASSIGNABLE_ROLES = ['user', 'merchant', 'admin'];
const SUBSCRIBABLE_PLANS = ['basic', 'professional', 'enterprise'];

// ── Sub-components ────────────────────────────────────────────────
function RoleBadge({ role }) {
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.user;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
}

function StatusDot({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.active;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function CopyableId({ id }) {
  const [copied, setCopied] = useState(false);
  const copy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button onClick={copy} title="نسخ المعرف"
      className="group flex items-center gap-1 text-xs text-gray-300 hover:text-gray-500 transition-colors font-mono">
      {id.slice(0, 8)}…
      <Copy className={`w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ${copied ? 'text-green-500 opacity-100' : ''}`} />
    </button>
  );
}

// ── Main Component ────────────────────────────────────────────────
export default function AdminUsers() {
  const { user: currentUser, isSuperAdmin } = useAuthStore();
  const [data, setData]           = useState(null);
  const [plans, setPlans]         = useState([]);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);
  const [q, setQ]                 = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [confirm, setConfirm]     = useState(null);
  const [subDialog, setSubDialog] = useState(null);
  const [roleChanging, setRoleChanging] = useState(null);
  const [subSaving, setSubSaving] = useState(false);

  useEffect(() => {
    api.get('/admin/plans').then(r => setPlans(r.data.data)).catch(console.error);
  }, []);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams({
      page, limit: 15,
      ...(q          && { q }),
      ...(roleFilter && { role: roleFilter }),
    });
    api.get(`/admin/users?${params}`)
      .then(r => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, roleFilter]);
  useEffect(() => { const t = setTimeout(load, 400); return () => clearTimeout(t); }, [q]);

  const toggleSuspend = async () => {
    const u = confirm.user;
    try {
      const { data: res } = await api.patch(`/admin/users/${u.id}/suspend`);
      toast.success(res.data.message_ar);
      setConfirm(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.error?.message_ar || 'حدث خطأ');
    }
  };

  const changeRole = async (userId, newRole) => {
    setRoleChanging(userId);
    try {
      const { data: res } = await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      toast.success(res.data.message_ar);
      load();
    } catch (e) {
      toast.error(e.response?.data?.error?.message_ar || 'حدث خطأ');
    } finally {
      setRoleChanging(null);
    }
  };

  const activateSubscription = async () => {
    if (!subDialog) return;
    setSubSaving(true);
    try {
      const { data: res } = await api.post(`/admin/users/${subDialog.user.id}/subscription`, {
        plan_type: subDialog.plan_type,
        months:    subDialog.months,
      });
      toast.success(res.data.message_ar);
      setSubDialog(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.error?.message_ar || 'حدث خطأ');
    } finally {
      setSubSaving(false);
    }
  };

  const canChangeRole = (u) =>
    isSuperAdmin() && u.id !== currentUser?.id && u.role !== 'super_admin';

  const paidPlans = plans.filter(p => SUBSCRIBABLE_PLANS.includes(p.plan_type));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h1>
        <p className="text-sm text-gray-500 mt-1">
          {data?.meta?.total ?? '—'} مستخدم — فعّل الاشتراك بعد تأكيد الدفع. الأسعار بالجنيه المصري.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="border border-gray-200 rounded-lg pr-9 pl-4 py-2 text-sm w-60 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="بحث بالاسم أو البريد الإلكتروني..."
            value={q}
            onChange={e => { setQ(e.target.value); setPage(1); }}
          />
        </div>

        {/* Role filter tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {[['', 'الكل'], ['user', 'مستخدم'], ['merchant', 'تاجر'], ['admin', 'مشرف']].map(([v, l]) => (
            <button key={v}
              onClick={() => { setRoleFilter(v); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${roleFilter === v ? 'bg-white shadow text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size={36} /></div>
        ) : !data?.items?.length ? (
          <div className="text-center py-12 text-gray-400 text-sm">لا توجد نتائج</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs font-medium text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-right">المستخدم</th>
                    <th className="px-4 py-3 text-right">الدور</th>
                    <th className="px-4 py-3 text-right">الحالة</th>
                    <th className="px-4 py-3 text-right">الاشتراك</th>
                    <th className="px-4 py-3 text-right">الدولة</th>
                    <th className="px-4 py-3 text-right">آخر دخول</th>
                    <th className="px-4 py-3 text-right">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.items.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">

                      {/* User info cell */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 text-primary-700 font-bold text-sm">
                            {(u.full_name || u.email || '?')[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 truncate max-w-[160px]">
                              {u.full_name || <span className="text-gray-400 font-normal">بدون اسم</span>}
                            </div>
                            <div className="text-xs text-gray-500 truncate max-w-[160px]" dir="ltr">
                              {u.email}
                            </div>
                            <CopyableId id={u.id} />
                          </div>
                        </div>
                      </td>

                      {/* Role cell */}
                      <td className="px-4 py-3">
                        {canChangeRole(u) ? (
                          <div className="relative">
                            <select
                              value={u.role}
                              disabled={roleChanging === u.id}
                              onChange={e => changeRole(u.id, e.target.value)}
                              className="appearance-none border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white pr-7 cursor-pointer disabled:opacity-60"
                            >
                              {ASSIGNABLE_ROLES.map(r => (
                                <option key={r} value={r}>{ROLE_CONFIG[r]?.label || r}</option>
                              ))}
                            </select>
                            {roleChanging === u.id && (
                              <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                                <Spinner size={14} />
                              </div>
                            )}
                          </div>
                        ) : (
                          <RoleBadge role={u.role} />
                        )}
                      </td>

                      {/* Status cell */}
                      <td className="px-4 py-3">
                        <StatusDot status={u.status} />
                      </td>

                      {/* Subscription cell */}
                      <td className="px-4 py-3 text-xs">
                        {u.plan_name_ar ? (
                          <div>
                            <span className="font-semibold text-primary-700">{u.plan_name_ar}</span>
                            {u.subscription_expires_at && (
                              <span className="block text-gray-400 mt-0.5">
                                حتى {formatDate(u.subscription_expires_at)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">مجاني</span>
                        )}
                      </td>

                      {/* Country */}
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {getCountryName(u.country_code) || '—'}
                      </td>

                      {/* Last login */}
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {u.last_login_at ? formatDate(u.last_login_at) : <span className="text-gray-300">لم يدخل بعد</span>}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        {!['super_admin', 'admin'].includes(u.role) ? (
                          <div className="flex items-center gap-1.5">
                            {/* Subscription button */}
                            <button onClick={() => setSubDialog({ user: u, plan_type: 'basic', months: 1 })}
                              title="تفعيل اشتراك"
                              className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg text-primary-700 bg-primary-50 hover:bg-primary-100 transition-colors">
                              <CreditCard className="w-3.5 h-3.5" />
                              اشتراك
                            </button>

                            {/* Suspend / Activate button */}
                            {u.status === 'suspended' ? (
                              <button onClick={() => setConfirm({ user: u })}
                                title="تفعيل الحساب"
                                className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg text-green-700 bg-green-50 hover:bg-green-100 transition-colors">
                                <UserCheck className="w-3.5 h-3.5" />
                                تفعيل
                              </button>
                            ) : (
                              <button onClick={() => setConfirm({ user: u })}
                                title="إيقاف الحساب مؤقتاً"
                                className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg text-red-700 bg-red-50 hover:bg-red-100 transition-colors">
                                <UserX className="w-3.5 h-3.5" />
                                إيقاف
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
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

      {/* Suspend / Activate confirm dialog */}
      <ConfirmDialog
        open={!!confirm}
        title={confirm?.user?.status === 'suspended' ? 'تفعيل الحساب' : 'إيقاف الحساب'}
        message={confirm?.user?.status === 'suspended'
          ? `هل تريد تفعيل حساب "${confirm?.user?.full_name || confirm?.user?.email}"؟ سيتمكن من تسجيل الدخول مجدداً.`
          : `هل تريد إيقاف حساب "${confirm?.user?.full_name || confirm?.user?.email}"؟ لن يتمكن من تسجيل الدخول حتى يُعاد تفعيله.`}
        onConfirm={toggleSuspend}
        onCancel={() => setConfirm(null)}
        danger={confirm?.user?.status !== 'suspended'}
      />

      {/* Subscription dialog */}
      {subDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 fade-in">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-primary-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">تفعيل اشتراك</h3>
                <p className="text-xs text-gray-500 mt-0.5" dir="ltr">{subDialog.user.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">الخطة</label>
                <select
                  className="input"
                  value={subDialog.plan_type}
                  onChange={e => setSubDialog(d => ({ ...d, plan_type: e.target.value }))}
                >
                  {paidPlans.map(p => (
                    <option key={p.plan_type} value={p.plan_type}>
                      {p.name_ar} — {Number(p.price_monthly).toLocaleString('ar-EG-u-nu-latn')} ج.م/شهر
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">المدة</label>
                <select
                  className="input"
                  value={subDialog.months}
                  onChange={e => setSubDialog(d => ({ ...d, months: parseInt(e.target.value, 10) }))}
                >
                  <option value={1}>شهر واحد</option>
                  <option value={3}>3 أشهر</option>
                  <option value={6}>6 أشهر</option>
                  <option value={12}>سنة كاملة (سعر سنوي)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setSubDialog(null)} className="btn-outline py-2.5 px-5 text-sm">إلغاء</button>
              <button onClick={activateSubscription} disabled={subSaving}
                className="btn-primary py-2.5 px-5 text-sm flex items-center gap-2">
                {subSaving
                  ? <><Spinner size={16} /> جاري التفعيل...</>
                  : <><CheckCircle className="w-4 h-4" /> تفعيل الاشتراك</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
