export const COUNTRIES = [
  { code: 'EG', name: 'مصر' },
  { code: 'SA', name: 'السعودية' },
  { code: 'AE', name: 'الإمارات' },
  { code: 'KW', name: 'الكويت' },
  { code: 'QA', name: 'قطر' },
  { code: 'BH', name: 'البحرين' },
  { code: 'OM', name: 'عُمان' },
  { code: 'JO', name: 'الأردن' },
  { code: 'LB', name: 'لبنان' },
  { code: 'IQ', name: 'العراق' },
  { code: 'SY', name: 'سوريا' },
  { code: 'YE', name: 'اليمن' },
  { code: 'LY', name: 'ليبيا' },
  { code: 'TN', name: 'تونس' },
  { code: 'DZ', name: 'الجزائر' },
  { code: 'MA', name: 'المغرب' },
  { code: 'SD', name: 'السودان' },
];

const countryMap = Object.fromEntries(COUNTRIES.map((c) => [c.code, c.name]));

export function getCountryName(code) {
  if (!code) return '—';
  return countryMap[code] || code;
}
