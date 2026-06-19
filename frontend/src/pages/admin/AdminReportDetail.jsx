import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight, CheckCircle, XCircle, AlertTriangle, Trash2,
  Smartphone, Laptop, Tablet, User, Phone,
  MapPin, Image as ImageIcon, Shield,
} from 'lucide-react';
import { StatusBadge, Spinner } from '../../components/ui/index.jsx';
import { useAuthStore } from '../../store/auth.store.js';
import api from '../../lib/api.js';
import { resolveAssetUrl } from '../../lib/config.js';
import toast from 'react-hot-toast';
import { getCountryName } from '../../lib/countries.js';
import { formatDate, formatDateTime } from '../../lib/format.js';

const DEVICE_TYPE_MAP = {
  phone:  { label: 'هاتف',    icon: Smartphone, color: 'text-blue-600 bg-blue-50' },
  laptop: { label: 'لاب توب', icon: Laptop,     color: 'text-violet-600 bg-violet-50' },
  tablet: { label: 'تابلت',   icon: Tablet,     color: 'text-teal-600 bg-teal-50' },
};

function InfoRow({ label, value, ltr = false }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-400">{label}</span>
      <span className={`text-sm font-medium text-gray-800 ${ltr ? 'direction-ltr text-left' : ''}`}
        dir={ltr ? 'ltr' : 'rtl'}>
        {value}
      </span>
    </div>
  );
}

function SectionCard({ title, icon: Icon, iconColor = 'text-primary-600', children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className={`flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <h2 className="font-semibold text-sm text-gray-700">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function AdminReportDetail() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { isSuperAdmin } = useAuthStore();
  const [report, setReport]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [dialog, setDialog]     = useState(null); // { type: 'approve'|'reject'|'delete', note:'' }
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/admin/reports/${id}`)
      .then(r => setReport(r.data.data))
      .catch(() => toast.error('البلاغ غير موجود'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDecision = async () => {
    if (dialog.type === 'reject' && !dialog.note?.trim())
      return toast.error('يجب كتابة سبب الرفض');
    if (dialog.type === 'delete' && !dialog.note?.trim())
      return toast.error('يجب كتابة سبب الحذف');
    setSubmitting(true);
    try {
      if (dialog.type === 'delete') {
        await api.delete(`/admin/reports/${id}`, { data: { reason: dialog.note } });
        toast.success('🗑️ تم حذف البلاغ نهائياً');
        navigate('/admin/reports');
        return;
      }
      await api.patch(`/admin/reports/${id}/${dialog.type === 'approve' ? 'approve' : 'reject'}`,
        { admin_note: dialog.note });
      toast.success(dialog.type === 'approve' ? '✅ تم قبول البلاغ' : '❌ تم رفض البلاغ');
      navigate('/admin/reports');
    } catch (err) {
      toast.error(err.response?.data?.error?.message_ar || 'حدث خطأ');
    } finally {
      setSubmitting(false);
      setDialog(null);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size={40} /></div>;
  if (!report) return null;

  const canDecide  = ['pending', 'under_review'].includes(report.status);
  const deviceType = DEVICE_TYPE_MAP[report.device_type] || DEVICE_TYPE_MAP.phone;
  const DeviceIcon = deviceType.icon;

  return (
    <div className="max-w-3xl space-y-5">

      {/* Back + header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button onClick={() => navigate('/admin/reports')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm transition-colors">
          <ArrowRight className="w-4 h-4" /> العودة للبلاغات
        </button>
        <StatusBadge status={report.status} />
      </div>

      {/* Title card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${deviceType.color}`}>
            <DeviceIcon className="w-6 h-6" strokeWidth={1.8} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900">{report.brand} {report.model}</h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
                ${report.report_type === 'stolen' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                {report.report_type === 'stolen' ? '🔴 مسروق' : '🟡 مفقود'}
              </span>
              <span className="text-xs text-gray-400">{deviceType.label}</span>
              <span className="text-xs text-gray-400">#{report.id?.slice(0, 8).toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decision buttons */}
      {canDecide && (
        <div className="flex gap-3">
          <button onClick={() => setDialog({ type: 'approve', note: '' })}
            className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
            <CheckCircle className="w-5 h-5" /> قبول البلاغ
          </button>
          <button onClick={() => setDialog({ type: 'reject', note: '' })}
            className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
            <XCircle className="w-5 h-5" /> رفض البلاغ
          </button>
        </div>
      )}

      {/* Delete button — super admin only */}
      {isSuperAdmin() && (
        <div className="flex justify-end">
          <button onClick={() => setDialog({ type: 'delete', note: '' })}
            className="flex items-center gap-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-xl transition-colors">
            <Trash2 className="w-4 h-4" /> حذف البلاغ نهائياً
          </button>
        </div>
      )}

      {/* Admin note */}
      {report.admin_note && (
        <div className={`rounded-2xl p-4 border flex gap-3
          ${report.status === 'approved' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <Shield className={`w-5 h-5 flex-shrink-0 mt-0.5 ${report.status === 'approved' ? 'text-green-600' : 'text-red-600'}`} />
          <div>
            <p className="text-sm font-semibold mb-1 text-gray-800">ملاحظة الإدارة</p>
            <p className="text-sm text-gray-700">{report.admin_note}</p>
            {report.reviewed_at && (
              <p className="text-xs text-gray-400 mt-1">{formatDateTime(report.reviewed_at)}</p>
            )}
          </div>
        </div>
      )}

      {/* Reporter info */}
      <SectionCard title="بيانات المُبلِّغ" icon={User} iconColor="text-blue-600">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <InfoRow label="الاسم الكامل" value={report.full_name} />
          <InfoRow label="البريد الإلكتروني" value={report.email} ltr />
          <InfoRow label="رقم الهاتف" value={report.phone} ltr />
        </div>
      </SectionCard>

      {/* Device info */}
      <SectionCard title="بيانات الجهاز" icon={DeviceIcon} iconColor={deviceType.color.split(' ')[0]}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <InfoRow label="IMEI" value={report.imei} ltr />
          {report.imei2         && <InfoRow label="IMEI 2"           value={report.imei2} ltr />}
          {report.serial_number && <InfoRow label="الرقم التسلسلي"   value={report.serial_number} ltr />}
          <InfoRow label="النوع"    value={deviceType.label} />
          <InfoRow label="الماركة"  value={report.brand} />
          <InfoRow label="الموديل"  value={report.model} />
          {report.color   && <InfoRow label="اللون"  value={report.color} />}
          {report.storage && <InfoRow label="السعة"  value={report.storage} />}
        </div>
      </SectionCard>

      {/* Incident info */}
      <SectionCard title="تفاصيل الحادثة" icon={MapPin} iconColor="text-orange-500">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          <InfoRow label="الدولة"           value={getCountryName(report.country_code)} />
          {report.city         && <InfoRow label="المدينة"          value={report.city} />}
          {report.incident_date && <InfoRow label="تاريخ الحادثة"    value={formatDate(report.incident_date)} />}
          <InfoRow label="تاريخ الإبلاغ"   value={formatDate(report.created_at)} />
          {report.approved_at  && <InfoRow label="تاريخ القبول"      value={formatDate(report.approved_at)} />}
        </div>
        {report.description && (
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-1.5">الوصف</p>
            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl px-4 py-3">{report.description}</p>
          </div>
        )}
        {report.reward_offered && (
          <div className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-xl">
            💰 يوجد مكافأة{report.reward_amount ? `: ${report.reward_amount} ${report.reward_currency || ''}` : ''}
          </div>
        )}
      </SectionCard>

      {/* Contact */}
      {(report.contact_whatsapp || report.contact_email || report.contact_phone) && (
        <SectionCard title="بيانات التواصل" icon={Phone} iconColor="text-green-600">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {report.contact_whatsapp && <InfoRow label="واتساب"              value={report.contact_whatsapp} ltr />}
            {report.contact_phone    && <InfoRow label="هاتف"                value={report.contact_phone} ltr />}
            {report.contact_email    && <InfoRow label="البريد الإلكتروني"   value={report.contact_email} ltr />}
          </div>
        </SectionCard>
      )}

      {/* Documents */}
      {report.documents?.length > 0 && (
        <SectionCard title={`المستندات المرفقة (${report.documents.length})`} icon={ImageIcon} iconColor="text-purple-600">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {report.documents.map(d => (
              <a key={d.id} href={resolveAssetUrl(d.file_url)}
                target="_blank" rel="noopener noreferrer"
                className="aspect-square rounded-xl overflow-hidden bg-gray-100 block hover:opacity-80 transition-opacity border border-gray-200 group relative">
                <img
                  src={resolveAssetUrl(d.file_url)}
                  alt={d.doc_type}
                  className="w-full h-full object-cover"
                  onError={e => { e.target.style.display = 'none'; }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                </div>
              </a>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Decision dialog */}
      {dialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 fade-in">
            <div className="flex items-center gap-3 mb-4">
              {dialog.type === 'approve' && <CheckCircle className="w-7 h-7 text-green-600" />}
              {dialog.type === 'reject'  && <AlertTriangle className="w-7 h-7 text-red-600" />}
              {dialog.type === 'delete'  && <Trash2 className="w-7 h-7 text-red-700" />}
              <h3 className="text-lg font-bold">
                {dialog.type === 'approve' ? 'قبول البلاغ' :
                 dialog.type === 'reject'  ? 'رفض البلاغ'  : 'حذف البلاغ نهائياً'}
              </h3>
            </div>

            {dialog.type === 'delete' && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-700">
                ⚠️ هذا الإجراء <strong>لا يمكن التراجع عنه</strong>. سيتم حذف البلاغ وجميع مستنداته من قاعدة البيانات نهائياً.
              </div>
            )}

            <p className="text-sm text-gray-500 mb-4">
              {dialog.type === 'approve' ? 'سيتم إضافة الجهاز لقاعدة البيانات وإبلاغ المالك بالقبول.' :
               dialog.type === 'reject'  ? 'يجب ذكر سبب واضح — سيصل للمستخدم عبر البريد الإلكتروني.' :
               'اذكر سبب الحذف لتسجيله في سجل الأحداث (audit log).'}
            </p>

            <textarea
              className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              placeholder={
                dialog.type === 'approve' ? 'ملاحظة اختيارية...' :
                dialog.type === 'reject'  ? 'سبب الرفض (إلزامي)...' :
                'سبب الحذف (إلزامي)...'
              }
              value={dialog.note}
              onChange={e => setDialog(p => ({ ...p, note: e.target.value }))}
              autoFocus
            />

            <div className="flex gap-3 mt-4">
              <button onClick={() => setDialog(null)} className="btn-outline flex-1 py-2.5 text-sm">إلغاء</button>
              <button onClick={handleDecision} disabled={submitting}
                className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2
                  ${dialog.type === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                    dialog.type === 'delete'  ? 'bg-red-700 hover:bg-red-800'    :
                                                'bg-red-600 hover:bg-red-700'}`}>
                {submitting ? <Spinner size={18} /> :
                  dialog.type === 'approve' ? <><CheckCircle className="w-4 h-4" /> قبول</> :
                  dialog.type === 'delete'  ? <><Trash2 className="w-4 h-4" /> حذف نهائي</> :
                                              <><XCircle className="w-4 h-4" /> رفض</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
