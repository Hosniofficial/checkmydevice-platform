import React, { useEffect, useState } from 'react';
import {
  Filter, Search, UserX, UserCheck, CreditCard, Copy,
  ShieldCheck, ShieldAlert, User, Store, Crown, Shield,
  CheckCircle, Ban, Clock, Users,
} from 'lucide-react';
import { Spinner, Pagination, ConfirmDialog } from '../../components/ui/index.jsx';
import { useAuthStore } from '../../store/auth.store.js';
import api from '../../lib/api.js';
import toast from 'react-hot-toast';
import SEOHead from '../../components/SEOHead.jsx';
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
      <SEOHead page="admin/users" />
      {/* Header */}
      <div>
        <p className="text-sm font-semibold text-accent-500">الإدارة</p>
        <h1 className="mt-1 text-2xl font-bold text-primary-900">إدارة المستخدمين</h1>
        <p className="mt-1 text-sm text-gray-500">ابحث عن حساب، راجع حالته، أو حدّث صلاحياته واشتراكه.</p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-800">
          <span className="h-1.5 w-1.5 rounded-full bg-primary-600" />
          {data?.meta?.total ?? '—'} مستخدم
        </div>
      </div>

      {/* Filters */}
      <div className="surface-card space-y-4 p-4 sm:p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
            <Filter className="h-4 w-4" />
          </div>
          بحث وتصفية
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              className="input w-full py-2.5 pr-9 text-sm"
              placeholder="ابحث بالاسم أو البريد الإلكتروني"
              aria-label="بحث عن مستخدم"
              value={q}
              onChange={e => { setQ(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex max-w-full gap-1 overflow-x-auto rounded-xl bg-[#f5f3ee] p-1 lg:flex-1">
            {[['', 'الكل'], ['user', 'مستخدم'], ['merchant', 'تاجر'], ['admin', 'مشرف']].map(([v, l]) => (
              <button key={v}
                onClick={() => { setRoleFilter(v); setPage(1); }}
                aria-pressed={roleFilter === v}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-all
                  ${roleFilter === v ? 'bg-white shadow-sm text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}>
                {l}
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
              <Users className="h-5 w-5" />
            </div>
            <p className="font-semibold text-gray-700">لا يوجد مستخدمون مطابقون</p>
            <p className="mt-1 text-sm text-gray-500">جرّب البحث باسم أو بريد مختلف.</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 p-3 sm:p-4 2xl:hidden">
              {data.items.map(u => (
                <article key={u.id} className="surface-card space-y-4 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-800">
                      {(u.full_name || u.email || '?')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-gray-900">{u.full_name || 'بدون اسم'}</p>
                      <p className="truncate text-xs text-gray-500" dir="ltr">{u.email}</p>
                      <div className="mt-1"><CopyableId id={u.id} /></div>
                    </div>
                    <StatusDot status={u.status} />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-y border-[#eeece5] py-3">
                    {canChangeRole(u) ? (
                      <label className="flex items-center gap-2 text-xs text-gray-500">
                        الدور
                        <select
                          value={u.role}
                          disabled={roleChanging === u.id}
                          onChange={e => changeRole(u.id, e.target.value)}
                          aria-label={`دور ${u.full_name || u.email}`}
                          className="rounded-lg border border-[#d8d6d0] bg-white px-2.5 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60"
                        >
                          {ASSIGNABLE_ROLES.map(r => <option key={r} value={r}>{ROLE_CONFIG[r]?.label || r}</option>)}
                        </select>
                      </label>
                    ) : <RoleBadge role={u.role} />}
                    <span className="rounded-full bg-[#f7f6f2] px-2.5 py-1 text-xs text-gray-600">
                      {u.plan_name_ar || 'مجاني'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="mb-1 text-gray-500">الدولة</p>
                      <p className="font-medium text-gray-800">{getCountryName(u.country_code) || '—'}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-gray-500">آخر دخول</p>
                      <p className="font-medium text-gray-800">{u.last_login_at ? formatDate(u.last_login_at) : 'لم يدخل بعد'}</p>
                    </div>
                  </div>

                  {!['super_admin', 'admin'].includes(u.role) && (
                    <div className="flex flex-wrap gap-2 border-t border-[#eeece5] pt-3">
                      <button onClick={() => setSubDialog({ user: u, plan_type: 'basic', months: 1 })}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary-50 px-3 py-2 text-xs font-medium text-primary-800 transition-colors hover:bg-primary-100">
                        <CreditCard className="h-4 w-4" /> تفعيل اشتراك
                      </button>
                      <button onClick={() => setConfirm({ user: u })}
                        className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors
                          ${u.status === 'suspended'
                            ? 'bg-green-50 text-green-700 hover:bg-green-100'
                            : 'bg-red-50 text-red-700 hover:bg-red-100'}`}>
                        {u.status === 'suspended'
                          ? <><UserCheck className="h-4 w-4" /> تفعيل الحساب</>
                          : <><UserX className="h-4 w-4" /> إيقاف الحساب</>}
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
            <div className="hidden overflow-x-auto 2xl:block">
              <table className="w-full min-w-[980px] text-sm">
                <thead className="border-b border-[#e7e4dc] bg-[#f5f3ee] text-xs font-medium text-gray-600">
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
                          <span className="rounded-full bg-[#f7f6f2] px-2 py-0.5 text-gray-500">مجاني</span>
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
            <div className="border-t border-[#e7e4dc] p-4">
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
          <div className="surface-card fade-in w-full max-w-md p-6 shadow-xl">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-primary-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">تفعيل اشتراك</h3>
                <p className="mt-0.5 break-all text-xs text-gray-500" dir="ltr">{subDialog.user.email}</p>
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

            <div className="mt-6 flex flex-col-reverse justify-end gap-3 sm:flex-row">
              <button onClick={() => setSubDialog(null)} className="btn-outline w-full px-5 py-2.5 text-sm sm:w-auto">إلغاء</button>
              <button onClick={activateSubscription} disabled={subSaving}
                className="btn-primary flex w-full items-center justify-center gap-2 px-5 py-2.5 text-sm sm:w-auto">
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
