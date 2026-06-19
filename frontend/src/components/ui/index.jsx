import React from 'react';
import clsx from 'clsx';

// ── Spinner ───────────────────────────────────────────────────────
export function Spinner({ size = 24 }) {
  return <div className="spinner" style={{ width: size, height: size }}/>;
}

// ── Badge ────────────────────────────────────────────────────────
const STATUS_LABELS = {
  pending:        'في الانتظار',
  under_review:   'قيد المراجعة',
  approved:       'مقبول',
  rejected:       'مرفوض',
  cancelled:      'ملغي',
  clean:          'نظيف',
  stolen:         'مسروق',
  lost:           'مفقود',
  active:         'نشط',
  suspended:      'موقوف',
  pending_verify: 'بانتظار التفعيل',
};
export function StatusBadge({ status }) {
  return (
    <span className={clsx('badge', `badge-${status}`)}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

// ── StatCard ─────────────────────────────────────────────────────
export function StatCard({ label, value, icon: Icon, color = 'blue', sub }) {
  const colors = {
    blue:   'bg-blue-50 text-blue-700',
    green:  'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    red:    'bg-red-50 text-red-700',
    purple: 'bg-purple-50 text-purple-700',
  };
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        {Icon && <Icon className="w-6 h-6"/>}
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value ?? '—'}</div>
        <div className="text-sm text-gray-500">{label}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="text-center py-16">
      {Icon && <Icon className="w-12 h-12 text-gray-300 mx-auto mb-4"/>}
      <h3 className="text-lg font-semibold text-gray-600 mb-2">{title}</h3>
      {description && <p className="text-gray-400 text-sm mb-6">{description}</p>}
      {action}
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────
export function Pagination({ meta, onPage }) {
  if (!meta || meta.total_pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button onClick={() => onPage(meta.page - 1)} disabled={!meta.has_prev}
        className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors">
        السابق
      </button>
      <span className="text-sm text-gray-600 px-4">
        صفحة {meta.page} من {meta.total_pages}
      </span>
      <button onClick={() => onPage(meta.page + 1)} disabled={!meta.has_next}
        className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors">
        التالي
      </button>
    </div>
  );
}

// ── Confirm Dialog ────────────────────────────────────────────────
export function ConfirmDialog({ open, title, message, onConfirm, onCancel, danger = false }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 fade-in">
        <h3 className="text-lg font-bold mb-3">{title}</h3>
        <p className="text-gray-600 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-outline py-2 px-5 text-sm">إلغاء</button>
          <button onClick={onConfirm} className={danger ? 'btn-danger py-2 px-5 text-sm' : 'btn-primary py-2 px-5 text-sm'}>
            تأكيد
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Form Field ─────────────────────────────────────────────────────
export function Field({ label, error, required, children }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}
