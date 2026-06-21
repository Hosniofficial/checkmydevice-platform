import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight, XCircle, Image as ImageIcon,
  Smartphone, Laptop, Tablet, MapPin, Phone, Shield,
  Share2, MessageCircle, Facebook, Link as LinkIcon, CheckCircle,
} from 'lucide-react';
import { StatusBadge, Spinner, ConfirmDialog } from '../components/ui/index.jsx';
import api from '../lib/api.js';
import { resolveAssetUrl } from '../lib/config.js';
import toast from 'react-hot-toast';
import { getCountryName } from '../lib/countries.js';
import { formatDate } from '../lib/format.js';

const DEVICE_TYPE = {
  phone:  { icon: Smartphone, label: 'هاتف',    color: 'text-blue-600 bg-blue-50' },
  laptop: { icon: Laptop,     label: 'لاب توب', color: 'text-violet-600 bg-violet-50' },
  tablet: { icon: Tablet,     label: 'تابلت',   color: 'text-teal-600 bg-teal-50' },
};

function InfoRow({ label, value, ltr = false }) {
  if (!value) return null;
  return (
    <div>
      <span className="text-xs text-gray-400 block mb-0.5">{label}</span>
      <span className="text-sm font-medium text-gray-800" dir={ltr ? 'ltr' : 'rtl'}>{value}</span>
    </div>
  );
}

function SectionCard({ title, icon: Icon, iconColor = 'text-primary-600', children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <h2 className="font-semibold text-sm text-gray-700">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ── Share card — shown only for approved reports ──────────────────
function ShareCard({ report }) {
  const [copied, setCopied] = useState(false);

  // Last 4 digits of IMEI only — safe to share
  const imeiSuffix = report.imei ? report.imei.slice(-4) : null;

  // Build device description
  const parts = [report.brand, report.model];
  if (report.color)   parts.push(report.color);
  if (report.storage) parts.push(report.storage);
  const deviceDesc = parts.join(' ');

  const reportTypeAr = report.report_type === 'stolen' ? 'مسروق' : 'مفقود';
  const searchUrl    = `https://checkmydevice.online/search?q=${report.imei}`;

  const whatsappText = [
    `🚨 ${reportTypeAr}: ${deviceDesc}`,
    imeiSuffix ? `📱 رقم IMEI ينتهي بـ: ${imeiSuffix}` : '',
    ``,
    `لو اشتريته أو وجدته، تحقق منه:`,
    `🔍 اتصل بـ ‎*#06#‎ وشوف لو آخر 4 أرقام هي ${imeiSuffix || '—'}`,
    ``,
    `✅ تحقق مجاناً: ${searchUrl}`,
  ].filter(Boolean).join('\n');

  const facebookText = encodeURIComponent(
    `${reportTypeAr}: ${deviceDesc}${imeiSuffix ? ` — IMEI ينتهي بـ ${imeiSuffix}` : ''}. تحقق منه مجاناً: ${searchUrl}`
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(searchUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-gradient-to-l from-primary-700 to-primary-600 rounded-2xl p-5 text-white">
      <div className="flex items-center gap-2 mb-1">
        <Share2 className="w-5 h-5 text-blue-200" />
        <h2 className="font-bold text-base">شارك بلاغك — ربما يساعد</h2>
      </div>
      <p className="text-blue-200 text-sm mb-4 leading-relaxed">
        انشر رابط البحث عن جهازك. من وجده أو اشتراه يقدر يتحقق منه مجاناً.
        <br />
        <span className="text-white font-medium">الرابط لا يكشف بياناتك الشخصية.</span>
      </p>

      {/* Instruction hint */}
      {imeiSuffix && (
        <div className="bg-white/10 rounded-xl px-4 py-2.5 mb-4 text-sm">
          <span className="text-blue-200">اطلب من من وجده:</span>
          {' '}يتصل بـ{' '}
          <span className="font-mono bg-white/20 px-1.5 py-0.5 rounded text-white">*#06#</span>
          {' '}ويشوف لو آخر 4 أرقام هي{' '}
          <span className="font-mono font-bold text-yellow-300">{imeiSuffix}</span>
        </div>
      )}

      {/* Share buttons */}
      <div className="flex gap-2 flex-wrap">
        {/* WhatsApp */}
        <a
          href={`https://wa.me/?text=${encodeURIComponent(whatsappText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          واتساب
        </a>

        {/* Facebook */}
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(searchUrl)}&quote=${facebookText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Facebook className="w-4 h-4" />
          فيسبوك
        </a>

        {/* Copy link */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          {copied
            ? <><CheckCircle className="w-4 h-4 text-green-300" /> تم النسخ</>
            : <><LinkIcon className="w-4 h-4" /> نسخ الرابط</>
          }
        </button>
      </div>
    </div>
  );
}

function resolveUrl(url) {
  return resolveAssetUrl(url);
}

export default function ReportDetailPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [report, setReport]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [confirm, setConfirm]       = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    api.get(`/reports/${id}`)
      .then(r => setReport(r.data.data))
      .catch(() => toast.error('البلاغ غير موجود'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await api.patch(`/reports/${id}/cancel`, { reason: 'تم استرداد الجهاز' });
      toast.success('تم إلغاء البلاغ');
      navigate('/reports');
    } catch (err) {
      toast.error(err.response?.data?.error?.message_ar || 'حدث خطأ');
    } finally {
      setCancelling(false);
      setConfirm(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size={40} /></div>;
  if (!report) return null;

  const canCancel  = !['cancelled', 'rejected'].includes(report.status);
  const isApproved = report.status === 'approved';
  const dt         = DEVICE_TYPE[report.device_type] || DEVICE_TYPE.phone;
  const DeviceIcon = dt.icon;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">

      {/* Back */}
      <button onClick={() => navigate('/reports')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm transition-colors">
        <ArrowRight className="w-4 h-4" /> العودة للبلاغات
      </button>

      {/* Title card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${dt.color}`}>
            <DeviceIcon className="w-6 h-6" strokeWidth={1.8} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900">{report.brand} {report.model}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <StatusBadge status={report.status} />
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full
                ${report.report_type === 'stolen'
                  ? 'bg-red-50 text-red-600'
                  : 'bg-amber-50 text-amber-600'}`}>
                {report.report_type === 'stolen' ? '🔴 مسروق' : '🟡 مفقود'}
              </span>
              <span className="text-xs text-gray-400">{dt.label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Share card — approved reports only */}
      {isApproved && <ShareCard report={report} />}

      {/* Admin note */}
      {report.admin_note && (
        <div className={`rounded-2xl p-4 border flex gap-3
          ${report.status === 'approved' ? 'bg-green-50 border-green-200' :
            report.status === 'rejected' ? 'bg-red-50 border-red-200'   :
                                           'bg-blue-50 border-blue-200'}`}>
          <Shield className={`w-5 h-5 flex-shrink-0 mt-0.5
            ${report.status === 'approved' ? 'text-green-600' :
              report.status === 'rejected' ? 'text-red-600'   : 'text-blue-600'}`} />
          <div>
            <p className="text-sm font-semibold mb-1 text-gray-800">ملاحظة الإدارة</p>
            <p className="text-sm text-gray-700">{report.admin_note}</p>
          </div>
        </div>
      )}

      {/* Device details */}
      <SectionCard title="تفاصيل الجهاز" icon={DeviceIcon} iconColor={dt.color.split(' ')[0]}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <InfoRow label="IMEI"            value={report.imei}           ltr />
          {report.imei2          && <InfoRow label="IMEI 2"         value={report.imei2}          ltr />}
          {report.serial_number  && <InfoRow label="الرقم التسلسلي" value={report.serial_number}  ltr />}
          <InfoRow label="النوع"           value={dt.label} />
          <InfoRow label="الماركة"         value={report.brand} />
          <InfoRow label="الموديل"         value={report.model} />
          {report.color   && <InfoRow label="اللون"  value={report.color} />}
          {report.storage && <InfoRow label="السعة"  value={report.storage} />}
        </div>
      </SectionCard>

      {/* Incident details */}
      <SectionCard title="تفاصيل الحادثة" icon={MapPin} iconColor="text-orange-500">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-3">
          <InfoRow label="الدولة"          value={getCountryName(report.country_code)} />
          {report.city           && <InfoRow label="المدينة"         value={report.city} />}
          {report.incident_date  && <InfoRow label="تاريخ الحادثة"   value={formatDate(report.incident_date)} />}
          <InfoRow label="تاريخ البلاغ"    value={formatDate(report.created_at)} />
          {report.approved_at    && <InfoRow label="تاريخ القبول"    value={formatDate(report.approved_at)} />}
        </div>
        {report.description && (
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-1.5">الوصف</p>
            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl px-4 py-3">
              {report.description}
            </p>
          </div>
        )}
        {report.reward_offered && (
          <div className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-xl">
            💰 يوجد مكافأة{report.reward_amount ? `: ${report.reward_amount} ${report.reward_currency || ''}` : ''}
          </div>
        )}
      </SectionCard>

      {/* Contact */}
      {(report.contact_whatsapp || report.contact_phone || report.contact_email) && (
        <SectionCard title="بيانات التواصل" icon={Phone} iconColor="text-green-600">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {report.contact_whatsapp && <InfoRow label="واتساب"            value={report.contact_whatsapp} ltr />}
            {report.contact_phone    && <InfoRow label="هاتف"              value={report.contact_phone}    ltr />}
            {report.contact_email    && <InfoRow label="البريد الإلكتروني" value={report.contact_email}    ltr />}
          </div>
        </SectionCard>
      )}

      {/* Documents */}
      {report.documents?.length > 0 && (
        <SectionCard title={`صور الإثبات (${report.documents.length})`} icon={ImageIcon} iconColor="text-purple-600">
          <div className="grid grid-cols-3 gap-3">
            {report.documents.map(d => (
              <a key={d.id} href={resolveUrl(d.file_url)} target="_blank" rel="noopener noreferrer"
                className="aspect-square rounded-xl overflow-hidden bg-gray-100 block hover:opacity-80 transition-opacity border border-gray-200">
                <img
                  src={resolveUrl(d.file_url)}
                  alt={d.doc_type}
                  className="w-full h-full object-cover"
                  onError={e => { e.target.style.display = 'none'; }}
                />
              </a>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Cancel action */}
      {canCancel && (
        <button onClick={() => setConfirm(true)} disabled={cancelling}
          className="flex items-center gap-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-5 py-2.5 rounded-xl transition-colors">
          <XCircle className="w-4 h-4" />
          إلغاء البلاغ (تم استرداد الجهاز)
        </button>
      )}

      <ConfirmDialog
        open={confirm}
        title="إلغاء البلاغ"
        message="هل أنت متأكد من إلغاء هذا البلاغ؟ يُستخدم هذا عند استرداد جهازك أو عدم الرغبة في استمرار البلاغ."
        onConfirm={handleCancel}
        onCancel={() => setConfirm(false)}
        danger
      />
    </div>
  );
}
