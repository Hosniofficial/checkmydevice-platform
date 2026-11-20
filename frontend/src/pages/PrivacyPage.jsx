import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Calendar } from 'lucide-react';
import SEOHead from '../components/SEOHead.jsx';

const LAST_UPDATED = '15 يونيو 2026';

const SECTIONS = [
  ['privacy-about', 'من نحن'],
  ['privacy-data', 'البيانات التي نجمعها'],
  ['privacy-use', 'كيف نستخدم بياناتك'],
  ['privacy-sharing', 'مشاركة البيانات'],
  ['privacy-security', 'حماية البيانات'],
  ['privacy-cookies', 'ملفات الكوكيز'],
  ['privacy-rights', 'حقوقك'],
  ['privacy-retention', 'الاحتفاظ بالبيانات'],
  ['privacy-children', 'خصوصية الأطفال'],
  ['privacy-changes', 'التحديثات على هذه السياسة'],
];

const Section = ({ id, num, title, children }) => (
  <section id={id} className="mb-7 scroll-mt-24 border-b border-[#eeece5] pb-6 last:mb-0 last:border-0 last:pb-0">
    <h2 className="mb-3 flex items-center gap-3 text-lg font-bold text-gray-900">
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 text-xs font-bold text-primary-800">
        {num}
      </span>
      {title}
    </h2>
    <div className="mr-1 space-y-3 text-sm leading-loose text-gray-600 sm:mr-11">
      {children}
    </div>
  </section>
);

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <SEOHead page="privacy" />
      {/* Header */}
      <div className="surface-card mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div className="flex items-center gap-4">
          <img src="/Logo.png" alt="" className="h-12 w-12 flex-shrink-0 rounded-2xl object-contain" />
          <div>
            <p className="text-sm font-semibold text-accent-500">معلومات قانونية</p>
            <h1 className="mt-1 text-2xl font-bold text-primary-900 sm:text-3xl">سياسة الخصوصية</h1>
          </div>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#f0eee7] px-3 py-2 text-xs text-gray-600">
          <Calendar className="h-4 w-4 text-primary-700" />
          <span>آخر تحديث: {LAST_UPDATED}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="أقسام سياسة الخصوصية" className="surface-card h-fit p-4 lg:sticky lg:top-24">
          <h2 className="mb-3 text-sm font-bold text-gray-800">في هذه الصفحة</h2>
          <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {SECTIONS.map(([id, title], index) => (
              <a key={id} href={`#${id}`} className="whitespace-nowrap rounded-lg px-3 py-2 text-xs text-gray-600 transition-colors hover:bg-[#f7f6f2] hover:text-primary-800">
                <span className="ml-1.5 text-primary-700">{index + 1}.</span>{title}
              </a>
            ))}
          </div>
        </nav>

        <div className="min-w-0">
          <div className="mb-5 rounded-2xl border border-primary-100 bg-primary-50 p-5 text-sm leading-relaxed text-primary-900">
            <strong>ملخص سريع:</strong> نحن لا نبيع بياناتك لأحد. نجمع فقط ما نحتاجه لتقديم الخدمة.
            بياناتك مشفرة ومحمية. يمكنك حذف حسابك في أي وقت.
          </div>

          <article className="surface-card p-5 sm:p-8">
        <Section id="privacy-about" num="١" title="من نحن">
          <p>
            CheckMyDevice هي منصة إلكترونية لفحص حالة الأجهزة المحمولة في الوطن العربي.
            نعمل كوسيط بين أصحاب الأجهزة المسروقة والمشترين المحتملين لمنع تداول الأجهزة المسروقة.
          </p>
          <p>
            للتواصل معنا بشأن الخصوصية: <a href="mailto:privacy@checkmydevice.online" className="text-primary-700 hover:underline" dir="ltr">privacy@checkmydevice.online</a>
          </p>
        </Section>

        <Section id="privacy-data" num="٢" title="البيانات التي نجمعها">
          <p><strong>بيانات الحساب:</strong> الاسم، البريد الإلكتروني، رقم الهاتف (اختياري)، كلمة المرور (مشفرة ببروتوكول bcrypt — لا نعرفها نحن).</p>
          <p><strong>بيانات البلاغات:</strong> رقم IMEI، معلومات الجهاز، صور الإثبات، بيانات التواصل التي تختار مشاركتها.</p>
          <p><strong>بيانات الاستخدام:</strong> عمليات البحث (IMEI فقط، مُقنَّعة)، عنوان IP، نوع المتصفح، وقت الاستخدام.</p>
          <p><strong>ما لا نجمعه:</strong> معلومات بطاقة الائتمان (تُعالَج عبر بوابات دفع آمنة)، بيانات جهات الاتصال، الموقع الجغرافي الدقيق.</p>
        </Section>

        <Section id="privacy-use" num="٣" title="كيف نستخدم بياناتك">
          <p>• تشغيل وتحسين الخدمة وتقديم نتائج البحث.</p>
          <p>• إرسال إشعارات مهمة (تغيير حالة البلاغ، البحث عن جهازك).</p>
          <p>• مراجعة طلبات البلاغات يدوياً للتحقق من صحتها.</p>
          <p>• الامتثال للمتطلبات القانونية عند الضرورة.</p>
          <p>• تحسين الأمان ومنع الاحتيال.</p>
          <p className="font-medium text-gray-800">⛔ لا نستخدم بياناتك في الإعلانات المستهدفة. لا نبيع بياناتك لأي طرف ثالث.</p>
        </Section>

        <Section id="privacy-sharing" num="٤" title="مشاركة البيانات">
          <p>لا نشارك بياناتك الشخصية مع أطراف ثالثة إلا في الحالات التالية:</p>
          <p>• <strong>مزودو الخدمة:</strong> شركاء تقنيون يساعدوننا في تشغيل المنصة (استضافة، بريد إلكتروني) ملتزمون بسرية البيانات.</p>
          <p>• <strong>الجهات القانونية:</strong> عند صدور أمر قضائي رسمي من جهة مختصة فقط.</p>
          <p>• <strong>بيانات البلاغات المقبولة:</strong> الجزء العام من البلاغ (ماركة الجهاز، الموديل، الدولة) يظهر لجميع المستخدمين — لكن بيانات التواصل تظهر فقط لمن يرغب التواصل معك صراحةً.</p>
        </Section>

        <Section id="privacy-security" num="٥" title="حماية البيانات">
          <p>• <strong>التشفير:</strong> جميع البيانات تُنقل عبر HTTPS/TLS. كلمات المرور مشفرة بـ bcrypt (لا يمكن لأحد معرفتها).</p>
          <p>• <strong>أرقام التواصل:</strong> مشفرة في قاعدة البيانات.</p>
          <p>• <strong>IMEI:</strong> يُعرض مُقنَّعاً للزوار (آخر 4 أرقام فقط).</p>
          <p>• <strong>النسخ الاحتياطي:</strong> يومي تلقائي مع تشفير.</p>
          <p>• <strong>Audit Logs:</strong> كل وصول للبيانات الحساسة مُسجَّل.</p>
        </Section>

        <Section id="privacy-cookies" num="٦" title="ملفات الكوكيز (Cookies)">
          <p>نستخدم كوكيز ضرورية فقط للحفاظ على جلسة تسجيل الدخول. لا نستخدم كوكيز تتبع أو تسويقية.</p>
          <p>يمكنك إيقاف الكوكيز من إعدادات متصفحك، لكن ذلك قد يؤثر على تجربة الاستخدام.</p>
        </Section>

        <Section id="privacy-rights" num="٧" title="حقوقك">
          <p>لديك الحق في أي وقت في:</p>
          <p>• <strong>الاطلاع:</strong> طلب نسخة من بياناتك الشخصية.</p>
          <p>• <strong>التصحيح:</strong> تصحيح بيانات غير دقيقة من إعدادات الحساب.</p>
          <p>• <strong>الحذف:</strong> حذف حسابك من صفحة الملف الشخصي (نحتفظ بالبلاغات لأغراض قانونية وأمنية).</p>
          <p>• <strong>الاعتراض:</strong> الاعتراض على أي معالجة لبياناتك.</p>
          <p>• <strong>النقل:</strong> طلب نسخة من بياناتك بصيغة قابلة للقراءة.</p>
          <p>لممارسة أي من هذه الحقوق: <a href="mailto:privacy@checkmydevice.online" className="text-primary-700 hover:underline" dir="ltr">privacy@checkmydevice.online</a></p>
        </Section>

        <Section id="privacy-retention" num="٨" title="الاحتفاظ بالبيانات">
          <p>• <strong>بيانات الحساب:</strong> تُحتفظ طوال فترة وجود الحساب + 30 يوماً بعد الحذف.</p>
          <p>• <strong>البلاغات:</strong> تُحتفظ بصورة مجهولة الهوية لأغراض أمنية حتى بعد حذف الحساب.</p>
          <p>• <strong>سجلات البحث:</strong> تُحذف بعد 12 شهراً.</p>
          <p>• <strong>Audit Logs:</strong> تُحتفظ 3 سنوات للامتثال القانوني.</p>
        </Section>

        <Section id="privacy-children" num="٩" title="خصوصية الأطفال">
          <p>
            خدمتنا غير موجهة لمن هم دون 18 سنة. إذا اكتشفنا أن طفلاً قاصراً
            قدّم بياناته، سنحذف الحساب فوراً. للإبلاغ:{' '}
            <a href="mailto:privacy@checkmydevice.online" className="text-primary-700 hover:underline" dir="ltr">privacy@checkmydevice.online</a>
          </p>
        </Section>

        <Section id="privacy-changes" num="١٠" title="التحديثات على هذه السياسة">
          <p>
            قد نحدّث هذه السياسة من وقت لآخر. عند إجراء تغييرات جوهرية،
            سنُخطرك عبر البريد الإلكتروني المسجل أو بإشعار واضح على المنصة قبل 30 يوماً من التطبيق.
          </p>
        </Section>
          </article>
        </div>
      </div>

      {/* Contact box */}
      <div className="mt-8 rounded-2xl bg-[#f0eee7] p-6 text-center">
        <Mail className="w-8 h-8 text-primary-700 mx-auto mb-3" />
        <h3 className="font-bold text-gray-900 mb-2">هل لديك سؤال حول خصوصيتك؟</h3>
        <p className="text-gray-500 text-sm mb-4">فريق الخصوصية لدينا يرد خلال 48 ساعة</p>
        <a href="mailto:privacy@checkmydevice.online"
          className="btn-primary inline-block text-sm py-2 px-6" dir="ltr">
          privacy@checkmydevice.online
        </a>
      </div>

      <div className="mt-6 text-center text-xs text-gray-400">
        <Link to="/terms" className="hover:text-gray-600 transition-colors">شروط الاستخدام</Link>
        <span className="mx-2">·</span>
        <Link to="/about" className="hover:text-gray-600 transition-colors">من نحن</Link>
        <span className="mx-2">·</span>
        <Link to="/contact" className="hover:text-gray-600 transition-colors">تواصل معنا</Link>
      </div>
    </div>
  );
}
