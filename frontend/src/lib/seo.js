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
};

/**
 * Builds a full <head> meta object for a given page key.
 * @param {keyof SEO_PAGES} pageKey
 * @returns {{ title, description, canonical, ogTags, twitterTags }}
 */
export function buildSEO(pageKey) {
  const page = SEO_PAGES[pageKey] || SEO_PAGES.home;
  return {
    title:       page.title,
    description: page.description,
    canonical:   page.canonical,
    keywords:    page.keywords || '',
    ogTags: {
      'og:type':        'website',
      'og:site_name':   SITE_NAME,
      'og:title':       page.title,
      'og:description': page.description,
      'og:url':         page.canonical,
      'og:image':       OG_IMAGE,
      'og:locale':      'ar_EG',
    },
    twitterTags: {
      'twitter:card':        'summary',
      'twitter:title':       page.title,
      'twitter:description': page.description,
      'twitter:image':       OG_IMAGE,
    },
  };
}
