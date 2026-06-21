/**
 * SEO metadata for each public page.
 * Used with react-helmet-async via the useSEO hook.
 */

const BASE_URL   = 'https://checkmydevice.online';
const SITE_NAME  = 'CheckMyDevice';
const OG_IMAGE   = `${BASE_URL}/android-chrome-512x512.png`;

export const SEO_PAGES = {
  home: {
    title: 'CheckMyDevice — فحص الأجهزة المحمولة قبل الشراء',
    description:
      'تحقق من هاتفك قبل الشراء — هل الجهاز مسروق أو مفقود؟ أول منصة عربية لفحص IMEI الأجهزة المحمولة في 15 دولة عربية.',
    canonical: `${BASE_URL}/`,
    keywords: 'فحص IMEI, هاتف مسروق, فحص الجهاز قبل الشراء, CheckMyDevice, هاتف مفقود, تحقق من الجهاز',
  },
  search: {
    title: 'فحص جهاز — تحقق من IMEI | CheckMyDevice',
    description:
      'أدخل رقم IMEI أو الرقم التسلسلي للجهاز وتحقق فوراً هل هو مسروق أو مفقود. فحص مجاني لأي جهاز محمول.',
    canonical: `${BASE_URL}/search`,
    keywords: 'فحص IMEI مجاني, التحقق من هاتف مسروق, رقم IMEI, فحص الرقم التسلسلي',
  },
  plans: {
    title: 'الخطط والأسعار | CheckMyDevice',
    description:
      'ابدأ مجاناً أو اختر خطة مدفوعة تناسب احتياجاتك. خطط للأفراد والتجار والشركات بأسعار بالجنيه المصري.',
    canonical: `${BASE_URL}/plans`,
    keywords: 'اشتراك CheckMyDevice, أسعار فحص الأجهزة, خطة تاجر أجهزة',
  },
  about: {
    title: 'من نحن | CheckMyDevice',
    description:
      'CheckMyDevice منصة عربية رائدة لفحص الأجهزة المحمولة والتحقق من حالتها. نحمي المشترين ونساعد أصحاب الأجهزة المسروقة على استردادها.',
    canonical: `${BASE_URL}/about`,
    keywords: 'عن CheckMyDevice, منصة فحص أجهزة عربية, فريق CheckMyDevice',
  },
  faq: {
    title: 'الأسئلة الشائعة | CheckMyDevice',
    description:
      'إجابات لأكثر الأسئلة شيوعاً حول فحص الأجهزة، الإبلاغ عن الأجهزة المسروقة، الاشتراكات، والخصوصية.',
    canonical: `${BASE_URL}/faq`,
    keywords: 'أسئلة CheckMyDevice, كيفية فحص IMEI, كيفية الإبلاغ عن هاتف مسروق',
  },
  contact: {
    title: 'تواصل معنا | CheckMyDevice',
    description:
      'تواصل مع فريق دعم CheckMyDevice عبر البريد الإلكتروني أو واتساب. نرد خلال 24-48 ساعة.',
    canonical: `${BASE_URL}/contact`,
    keywords: 'تواصل مع CheckMyDevice, دعم فني, بريد إلكتروني',
  },
  privacy: {
    title: 'سياسة الخصوصية | CheckMyDevice',
    description:
      'اقرأ سياسة الخصوصية الخاصة بـ CheckMyDevice — كيف نجمع بياناتك ونحميها ونستخدمها.',
    canonical: `${BASE_URL}/privacy`,
    keywords: 'سياسة الخصوصية CheckMyDevice, حماية البيانات',
  },
  terms: {
    title: 'الشروط والأحكام | CheckMyDevice',
    description:
      'اقرأ شروط وأحكام استخدام منصة CheckMyDevice قبل التسجيل أو استخدام الخدمة.',
    canonical: `${BASE_URL}/terms`,
    keywords: 'شروط الاستخدام CheckMyDevice, أحكام المنصة',
  },

  // ── Blog / SEO articles ───────────────────────────────────────
  'blog': {
    title: 'المدونة — أدلة وتحقق من الأجهزة | CheckMyDevice',
    description: 'دليلك الكامل لحماية جهازك، التحقق قبل الشراء، والتصرف الصح عند السرقة أو الضياع.',
    canonical: `${BASE_URL}/blog`,
    keywords: 'مدونة CheckMyDevice, دليل فحص الهاتف, نصائح شراء هاتف مستعمل',
  },
  'blog/how-to-check-stolen-phone': {
    title: 'كيف أعرف أن الهاتف مسروق؟ — دليل كامل 2026 | CheckMyDevice',
    description: 'تعرف على 7 طرق للتحقق من أن الهاتف المستعمل مسروق قبل الشراء. فحص IMEI، علامات الجهاز المسروق، وكيف تحمي نفسك.',
    canonical: `${BASE_URL}/blog/how-to-check-stolen-phone`,
    keywords: 'كيف أعرف أن الهاتف مسروق, علامات الهاتف المسروق, فحص هاتف مستعمل, التحقق من هاتف قبل الشراء',
  },
  'blog/free-imei-check': {
    title: 'فحص IMEI مجاني — تحقق من جهازك في ثوانٍ | CheckMyDevice',
    description: 'فحص IMEI مجاني بالكامل. أدخل رقم IMEI واعرف فوراً إذا كان الجهاز مسروقاً أو مفقوداً. كيف تجد رقم IMEI وما أهميته.',
    canonical: `${BASE_URL}/blog/free-imei-check`,
    keywords: 'فحص IMEI مجاني, رقم IMEI ما هو, كيف أعرف رقم IMEI, التحقق من IMEI',
  },
  'blog/what-to-do-if-phone-stolen': {
    title: 'ماذا أفعل إذا سُرق هاتفي؟ — 8 خطوات فورية | CheckMyDevice',
    description: 'سُرق هاتفك؟ اتبع هذه الخطوات الـ 8 فوراً: قفل الجهاز عن بُعد، إبلاغ الشرطة، تسجيل IMEI في CheckMyDevice، وحماية بياناتك.',
    canonical: `${BASE_URL}/blog/what-to-do-if-phone-stolen`,
    keywords: 'سرق هاتفي ماذا أفعل, خطوات سرقة الهاتف, إيقاف هاتف مسروق, بلاغ سرقة هاتف',
  },
  'blog/what-to-do-if-phone-lost': {
    title: 'ضاع هاتفي — كيف أجده أو أحمي بياناتي؟ | CheckMyDevice',
    description: 'خطوات عملية إذا ضاع هاتفك: تتبع الجهاز، قفل البيانات، الإبلاغ عنه، وكيف تسترد هاتفك أو تحمي بياناتك من الاستخدام.',
    canonical: `${BASE_URL}/blog/what-to-do-if-phone-lost`,
    keywords: 'ضاع هاتفي ماذا أفعل, تتبع هاتف مفقود, هاتف مفقود خطوات, حماية بيانات هاتف مفقود',
  },
  'blog/how-to-report-stolen-phone': {
    title: 'كيف أبلغ عن هاتف مسروق؟ — دليل الإبلاغ الكامل | CheckMyDevice',
    description: 'تعلم كيف تسجل بلاغاً رسمياً عن هاتفك المسروق في CheckMyDevice. ما البيانات المطلوبة، كيف تثبت الملكية، وما يحدث بعد القبول.',
    canonical: `${BASE_URL}/blog/how-to-report-stolen-phone`,
    keywords: 'كيف أبلغ عن هاتف مسروق, تسجيل بلاغ سرقة هاتف, إثبات ملكية هاتف, الإبلاغ عن جهاز مسروق',
  },

  // ── Admin pages (title only — no public indexing) ──────────────
  'admin/dashboard': {
    title: 'لوحة التحكم | Admin — CheckMyDevice',
    description: '',
    canonical: '',
  },
  'admin/reports': {
    title: 'البلاغات | Admin — CheckMyDevice',
    description: '',
    canonical: '',
  },
  'admin/report-detail': {
    title: 'تفاصيل البلاغ | Admin — CheckMyDevice',
    description: '',
    canonical: '',
  },
  'admin/users': {
    title: 'المستخدمون | Admin — CheckMyDevice',
    description: '',
    canonical: '',
  },
  'admin/search': {
    title: 'بحث IMEI | Admin — CheckMyDevice',
    description: '',
    canonical: '',
  },
  'admin/audit-logs': {
    title: 'سجل الأحداث | Admin — CheckMyDevice',
    description: '',
    canonical: '',
  },
};

/**
 * Builds a full <head> meta object for a given page key.
 * @param {keyof SEO_PAGES} pageKey
 * @returns {{ title, description, canonical, keywords, isAdmin, ogTags, twitterTags }}
 */
export function buildSEO(pageKey) {
  const page    = SEO_PAGES[pageKey] || SEO_PAGES.home;
  const isAdmin = pageKey?.startsWith('admin/');

  return {
    title:       page.title,
    description: page.description || '',
    canonical:   page.canonical   || '',
    keywords:    page.keywords    || '',
    isAdmin,
    ogTags: isAdmin ? {} : {
      'og:type':        'website',
      'og:site_name':   SITE_NAME,
      'og:title':       page.title,
      'og:description': page.description,
      'og:url':         page.canonical,
      'og:image':       OG_IMAGE,
      'og:locale':      'ar_EG',
    },
    twitterTags: isAdmin ? {} : {
      'twitter:card':        'summary',
      'twitter:title':       page.title,
      'twitter:description': page.description,
      'twitter:image':       OG_IMAGE,
    },
  };
}
