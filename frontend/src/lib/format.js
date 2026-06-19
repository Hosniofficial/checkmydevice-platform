/** Arabic labels with Western (0-9) numerals */
const LOCALE = 'ar-EG-u-nu-latn';

function toDate(value) {
  if (!value) return null;
  return value instanceof Date ? value : new Date(value);
}

export function formatDate(value) {
  const d = toDate(value);
  if (!d || Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(LOCALE);
}

export function formatDateTime(value) {
  const d = toDate(value);
  if (!d || Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(LOCALE);
}

export function formatDateLong(value) {
  const d = toDate(value);
  if (!d || Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(LOCALE, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
