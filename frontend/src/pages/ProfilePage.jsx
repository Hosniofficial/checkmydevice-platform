import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Key, Trash2, CheckCircle, Mail, AlertCircle, Send } from 'lucide-react';
import { z } from 'zod';
import { changePasswordSchema } from '../lib/validation.js';
import { useAuthStore } from '../store/auth.store.js';
import { Field, Spinner, ConfirmDialog } from '../components/ui/index.jsx';
import PasswordInput from '../components/ui/PasswordInput.jsx';
import api from '../lib/api.js';
import toast from 'react-hot-toast';
import { COUNTRIES } from '../lib/countries.js';

// Profile info schema
const profileSchema = z.object({
  full_name:    z.string().min(2, 'الاسم يجب حرفين على الأقل').optional().or(z.literal('')),
  phone:        z.string().regex(/^\+?[0-9\s\-]{7,20}$/, 'رقم غير صحيح').optional().or(z.literal('')),
  whatsapp:     z.string().regex(/^\+?[0-9\s\-]{7,20}$/, 'رقم غير صحيح').optional().or(z.literal('')),
  country_code: z.string().length(2).optional(),
});

export default function ProfilePage() {
  const { user, init, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const isSuperAdmin = user?.role === 'super_admin';
  const TABS = [
    { id: 'profile',  label: 'البيانات الشخصية', icon: User },
    { id: 'password', label: 'كلمة المرور',        icon: Key  },
    ...(!isSuperAdmin ? [{ id: 'danger', label: 'حذف الحساب', icon: Trash2 }] : []),
  ];

  // ── Profile form ──────────────────────────────────────────────
  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name:    user?.full_name    || '',
      phone:        user?.phone        || '',
      whatsapp:     user?.whatsapp     || '',
      country_code: user?.country_code || 'EG',
    },
    mode: 'onBlur',
  });

  const onSaveProfile = async (data) => {
    setSavingProfile(true);
    try {
      await api.patch('/auth/me', data);
      await init();
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
      toast.success('تم تحديث البيانات بنجاح');
    } catch (err) {
      toast.error(err.response?.data?.error?.message_ar || 'حدث خطأ');
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Password form ─────────────────────────────────────────────
  const pwForm = useForm({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onBlur',
  });

  const onChangePassword = async (data) => {
    setSavingPassword(true);
    try {
      await api.patch('/auth/me/password', {
        current_password: data.current_password,
        new_password:     data.new_password,
      });
      pwForm.reset();
      toast.success('تم تغيير كلمة المرور بنجاح');
    } catch (err) {
      const code = err.response?.data?.error?.code;
      if (code === 'WRONG_PASSWORD') {
        pwForm.setError('current_password', { message: 'كلمة المرور الحالية غير صحيحة' });
      } else {
        toast.error(err.response?.data?.error?.message_ar || 'حدث خطأ');
      }
    } finally {
      setSavingPassword(false);
    }
  };

  // ── Resend verification ───────────────────────────────────────
  const handleResendVerification = async () => {
    setResendingVerification(true);
    try {
      await api.post('/auth/resend-verification');
      setVerificationSent(true);
      toast.success('تم إرسال رابط التفعيل — تحقق من بريدك الإلكتروني');
    } catch (err) {
      const code = err.response?.data?.error?.code;
      if (code === 'TOO_MANY_REQUESTS') {
        toast.error('انتظر دقيقتين قبل إعادة الإرسال');
      } else {
        toast.error(err.response?.data?.error?.message_ar || 'حدث خطأ');
      }
    } finally {
      setResendingVerification(false);
    }
  };

  // ── Delete account ────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    try {
      await api.delete('/auth/me');
      logout();
      toast.success('تم حذف الحساب');
    } catch {
      toast.error('حدث خطأ أثناء حذف الحساب، تواصل مع الدعم');
    }
    setDeleteConfirm(false);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      <div className="mb-6 flex items-start gap-4 rounded-3xl border border-[#e7e4dc] bg-white p-5 shadow-sm sm:mb-7 sm:p-7">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
          <User className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-accent-500">حسابك</p>
          <h1 className="mt-1 text-2xl font-bold text-primary-900">إعدادات الحساب</h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">حدّث بياناتك وأمّن حسابك وراجع خيارات الحساب.</p>
        </div>
      </div>

      {/* Email verification banner */}
      {!user?.email_verified && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5" role="status">
          <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100">
            <AlertCircle className="h-5 w-5 text-amber-600" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800">بريدك الإلكتروني غير مفعّل</p>
            <p className="text-xs text-amber-600 mt-0.5 leading-relaxed">
              تحقق من صندوق الوارد أو Spam في <span dir="ltr" className="font-mono">{user?.email}</span> واضغط على رابط التفعيل.
            </p>
            {verificationSent ? (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-green-700 font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                تم الإرسال — تحقق من بريدك
              </div>
            ) : (
              <button
                onClick={handleResendVerification}
                disabled={resendingVerification}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60">
                {resendingVerification
                  ? <><Spinner size={12} /> جاري الإرسال...</>
                  : <><Send className="w-3.5 h-3.5" /> إعادة إرسال رابط التفعيل</>}
              </button>
            )}
          </div>
        </div>
      )}

      {/* User info bar */}
      <div className="surface-card mb-6 flex items-center gap-4 p-4 sm:p-5">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-primary-50">
          <User className="h-7 w-7 text-primary-700" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{user?.full_name || '—'}</p>
          <p className="text-sm text-gray-500 truncate" dir="ltr">{user?.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium
              ${user?.email_verified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {user?.email_verified ? '✓ بريد مفعّل' : '⚠ بريد غير مفعّل'}
            </span>
            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium capitalize">
              {user?.role === 'super_admin' ? 'مدير عام' : user?.role === 'admin' ? 'مشرف' : user?.role === 'merchant' ? 'تاجر' : 'مستخدم'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-2xl bg-[#f0eee7] p-1" role="group" aria-label="إعدادات الحساب">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} id={`profile-tab-${id}`} type="button" aria-label={label}
            aria-pressed={activeTab === id}
            onClick={() => setActiveTab(id)}
            className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-medium transition-all sm:gap-2 sm:px-3 sm:text-sm
              ${activeTab === id
                ? 'bg-white shadow text-primary-700'
                : id === 'danger' ? 'text-red-600 hover:text-red-700' : 'text-gray-500 hover:text-gray-700'}`}>
            <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* ── Tab: Profile ───────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <section id="profile-panel-profile" role="region" aria-labelledby="profile-tab-profile" className="surface-card p-5 sm:p-7">
          <h2 className="mb-5 text-lg font-bold text-gray-900">البيانات الشخصية</h2>
          <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4" noValidate>
            <Field label="البريد الإلكتروني">
              <input className="input bg-gray-50 cursor-not-allowed" value={user?.email} disabled dir="ltr" />
              <p className="text-xs text-gray-400 mt-1">لا يمكن تغيير البريد الإلكتروني</p>
            </Field>

            <Field label="الاسم الكامل" error={profileForm.formState.errors.full_name?.message}>
              <input className={`input ${profileForm.formState.errors.full_name ? 'border-red-400' : ''}`}
                placeholder="اسمك الكامل"
                {...profileForm.register('full_name')} />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="رقم الهاتف" error={profileForm.formState.errors.phone?.message}>
                <input dir="ltr" className={`input ${profileForm.formState.errors.phone ? 'border-red-400' : ''}`}
                  placeholder="+201001234567"
                  {...profileForm.register('phone')} />
              </Field>
              <Field label="واتساب" error={profileForm.formState.errors.whatsapp?.message}>
                <input dir="ltr" className={`input ${profileForm.formState.errors.whatsapp ? 'border-red-400' : ''}`}
                  placeholder="+201001234567"
                  {...profileForm.register('whatsapp')} />
              </Field>
            </div>

            <Field label="الدولة">
              <select className="input" {...profileForm.register('country_code')}>
                {COUNTRIES.map(({ code, name }) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </Field>

            <button type="submit" disabled={savingProfile}
              className="btn-primary flex w-full items-center justify-center gap-2 sm:w-auto">
              {savingProfile ? <Spinner size={18} /> : profileSaved ? <CheckCircle className="w-4 h-4" /> : null}
              {savingProfile ? 'جاري الحفظ...' : profileSaved ? 'تم الحفظ!' : 'حفظ التغييرات'}
            </button>
          </form>
        </section>
      )}

      {/* ── Tab: Password ───────────────────────────────────────── */}
      {activeTab === 'password' && (
        <section id="profile-panel-password" role="region" aria-labelledby="profile-tab-password" className="surface-card p-5 sm:p-7">
          <h2 className="mb-5 text-lg font-bold text-gray-900">تغيير كلمة المرور</h2>
          <form onSubmit={pwForm.handleSubmit(onChangePassword)} className="space-y-4" noValidate>
            <PasswordInput
              register={pwForm.register}
              name="current_password"
              label="كلمة المرور الحالية"
              placeholder="أدخل كلمة المرور الحالية"
              error={pwForm.formState.errors.current_password?.message}
              required
            />
            <PasswordInput
              register={pwForm.register}
              name="new_password"
              label="كلمة المرور الجديدة"
              placeholder="اختر كلمة مرور قوية"
              error={pwForm.formState.errors.new_password?.message}
              showStrength
              watch={pwForm.watch}
              required
            />
            <PasswordInput
              register={pwForm.register}
              name="confirm_password"
              label="تأكيد كلمة المرور الجديدة"
              placeholder="أعد إدخال كلمة المرور الجديدة"
              error={pwForm.formState.errors.confirm_password?.message}
              required
            />
            <button type="submit" disabled={savingPassword} className="btn-primary flex w-full items-center justify-center gap-2 sm:w-auto">
              {savingPassword ? <Spinner size={18} /> : <Key className="w-4 h-4" />}
              {savingPassword ? 'جاري الحفظ...' : 'تغيير كلمة المرور'}
            </button>
          </form>
        </section>
      )}

      {/* ── Tab: Delete ─────────────────────────────────────────── */}
      {activeTab === 'danger' && (
        <section id="profile-panel-danger" role="region" aria-labelledby="profile-tab-danger" className="surface-card border-red-200 p-5 sm:p-7">
          <h2 className="mb-2 text-lg font-bold text-red-700">حذف الحساب</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            سيتم حذف حسابك نهائياً وجميع بياناتك الشخصية خلال 30 يوماً.
            البلاغات المقبولة تبقى في قاعدة البيانات بصورة مجهولة الهوية لأسباب أمنية.
            <strong className="text-red-700 block mt-2">هذا الإجراء لا يمكن التراجع عنه.</strong>
          </p>
          <button onClick={() => setDeleteConfirm(true)}
            className="btn-danger flex items-center gap-2 text-sm py-2 px-5">
            <Trash2 className="w-4 h-4" />
            حذف حسابي نهائياً
          </button>
        </section>
      )}

      <ConfirmDialog
        open={deleteConfirm}
        title="حذف الحساب نهائياً"
        message="هل أنت متأكد؟ سيتم حذف حسابك وجميع بياناتك الشخصية. لا يمكن التراجع عن هذا الإجراء."
        onConfirm={handleDeleteAccount}
        onCancel={() => setDeleteConfirm(false)}
        danger
      />
    </div>
  );
}
