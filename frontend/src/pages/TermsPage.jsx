import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Calendar } from 'lucide-react';
import SEOHead from '../components/SEOHead.jsx';

const LAST_UPDATED = '15 يونيو 2026';

const SECTIONS = [
  ['terms-acceptance', 'قبول الشروط'],
  ['terms-service', 'وصف الخدمة'],
  ['terms-disclaimer', 'إخلاء المسؤولية'],
  ['terms-obligations', 'التزامات المستخدم'],
  ['terms-reports', 'البلاغات والمحتوى'],
  ['terms-intellectual-property', 'الملكية الفكرية'],
  ['terms-account', 'الحسابات والأمان'],
  ['terms-pricing', 'الأسعار والاشتراكات'],
  ['terms-law', 'القانون المطبق'],
  ['terms-contact', 'التواصل والشكاوى'],
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

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <SEOHead page="terms" />
      {/* Header */}
      <div className="surface-card mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-accent-500">معلومات قانونية</p>
            <h1 className="mt-1 text-2xl font-bold text-primary-900 sm:text-3xl">شروط الاستخدام</h1>
          </div>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#f0eee7] px-3 py-2 text-xs text-gray-600">
          <Calendar className="h-4 w-4 text-primary-700" />
          <span>آخر تحديث: {LAST_UPDATED}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="أقسام شروط الاستخدام" className="surface-card h-fit p-4 lg:sticky lg:top-24">
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
          <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-900">
            <strong>تنبيه مهم:</strong> باستخدامك لمنصة CheckMyDevice، فأنت توافق على هذه الشروط.
            إذا لم توافق على أي منها، يرجى التوقف عن استخدام المنصة.
          </div>

          <article className="surface-card p-5 sm:p-8">
        <Section id="terms-acceptance" num="١" title="قبول الشروط">
          <p>
            باستخدام منصة CheckMyDevice (الموقع أو التطبيق)، تقر بأنك قرأت هذه الشروط وفهمتها
            وتوافق على الالتزام بها وبسياسة الخصوصية المرتبطة.
          </p>
          <p>
            هذه الشروط تحكم علاقتك مع المنصة. يحق لنا تعديلها في أي وقت مع إشعار مسبق.
          </p>
        </Section>

        <Section id="terms-service" num="٢" title="وصف الخدمة">
          <p>
            CheckMyDevice هي منصة معلوماتية تُتيح للمستخدمين:
          </p>
          <p>• البحث عن حالة الأجهزة المحمولة (هاتف، لاب توب، تابلت) بناءً على رقم IMEI أو الرقم التسلسلي.</p>
          <p>• الإبلاغ عن الأجهزة المسروقة أو المفقودة (بعد مراجعة يدوية من الإدارة).</p>
          <p>• استقبال إشعارات عند البحث عن جهاز مُبلَّغ عنه.</p>
          <p className="font-medium text-gray-800">
            ⚠️ المنصة معلوماتية فقط — لا تُشكّل وثيقة قانونية رسمية ولا تحل محل البلاغ الشرطي.
          </p>
        </Section>

        <Section id="terms-disclaimer" num="٣" title="إخلاء المسؤولية">
          <p className="font-medium text-red-700">يرجى قراءة هذا البند بعناية:</p>
          <p>
            • <strong>قاعدة البيانات غير شاملة:</strong> غياب الجهاز من قاعدتنا لا يعني بالضرورة
            أنه غير مسروق. قاعدتنا مجتمعية وتعتمد على بلاغات المستخدمين.
          </p>
          <p>
            • <strong>لسنا جهة قانونية:</strong> المنصة لا تُصدر شهادات ملكية رسمية ولا تحل محل الشرطة أو الجهات القضائية.
          </p>
          <p>
            • <strong>البيانات غير مضمونة 100%:</strong> نبذل قصارى جهدنا للتحقق من البلاغات
            لكن لا نضمن دقتها المطلقة.
          </p>
          <p>
            • <strong>المسؤولية محدودة:</strong> لا نتحمل مسؤولية أي خسائر ناتجة عن الاعتماد
            على المعلومات المتاحة في المنصة كمصدر وحيد للتحقق.
          </p>
        </Section>

        <Section id="terms-obligations" num="٤" title="التزامات المستخدم">
          <p>بالتسجيل في المنصة، تلتزم بما يلي:</p>
          <p>• تقديم معلومات صحيحة ودقيقة عند التسجيل وعند رفع البلاغات.</p>
          <p>• عدم رفع بلاغات كاذبة أو مزيفة بهدف الإضرار بأشخاص أو تجار.</p>
          <p>• عدم استخدام المنصة لأغراض غير قانونية أو مخالفة للنظام العام.</p>
          <p>• عدم محاولة اختراق المنصة أو التلاعب بقاعدة البيانات.</p>
          <p>• الامتناع عن نشر محتوى مسيء أو تشهيري.</p>
          <p>• عدم استخدام bots أو أدوات آلية لاستنزاف الخدمة.</p>
        </Section>

        <Section id="terms-reports" num="٥" title="البلاغات والمحتوى">
          <p>
            • كل بلاغ يخضع للمراجعة اليدوية من فريق الإدارة قبل نشره.
          </p>
          <p>
            • بإرسالك بلاغاً، تُقر بأنك صاحب الجهاز الفعلي أو مُفوَّض بالإبلاغ عنه.
          </p>
          <p>
            • تقديم بلاغ كاذب يُعرّضك للمساءلة القانونية ولحذف حسابك الفوري.
          </p>
          <p>
            • نحتفظ بحق حذف أي بلاغ يخالف شروط الاستخدام دون إشعار مسبق.
          </p>
        </Section>

        <Section id="terms-intellectual-property" num="٦" title="الملكية الفكرية">
          <p>
            جميع محتويات المنصة (الشعار، التصميم، الكود، قاعدة البيانات) هي ملك حصري
            لـ CheckMyDevice ومحمية بموجب قوانين الملكية الفكرية.
          </p>
          <p>
            لا يحق نسخ أو توزيع أو إعادة استخدام أي محتوى دون إذن كتابي مسبق.
          </p>
        </Section>

        <Section id="terms-account" num="٧" title="الحسابات والأمان">
          <p>• أنت مسؤول عن سرية بيانات حسابك وكلمة مرورك.</p>
          <p>• أبلغنا فوراً عن أي اختراق أو استخدام غير مصرح به لحسابك.</p>
          <p>• نحتفظ بحق تعليق أو حذف أي حساب يخالف هذه الشروط.</p>
        </Section>

        <Section id="terms-pricing" num="٨" title="الأسعار والاشتراكات">
          <p>• الاشتراك المجاني متاح للجميع بحدود استخدام يومية.</p>
          <p>• الخطط المدفوعة يمكن إلغاؤها في أي وقت مع احتفاظك بالمميزات حتى نهاية الفترة المدفوعة.</p>
          <p>• لا نُقدّم استردادًا للمبالغ إلا في حالات استثنائية موثقة.</p>
          <p>• نحتفظ بحق تعديل الأسعار مع إشعار مسبق 30 يوماً.</p>
        </Section>

        <Section id="terms-law" num="٩" title="القانون المطبق والاختصاص القضائي">
          <p>
            تخضع هذه الشروط لقوانين جمهورية مصر العربية. أي نزاع ينشأ عن استخدام
            المنصة يُحسم أمام المحاكم المصرية المختصة.
          </p>
        </Section>

        <Section id="terms-contact" num="١٠" title="التواصل والشكاوى">
          <p>
            للتواصل معنا بشأن التسجيل: <a href="mailto:support@checkmydevice.online" className="text-primary-700 hover:underline" dir="ltr">support@checkmydevice.online</a>
          </p>
          <p>نلتزم بالرد خلال 5 أيام عمل.</p>
        </Section>
          </article>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-gray-400 space-x-4 space-x-reverse">
        <Link to="/privacy" className="hover:text-gray-600 transition-colors">سياسة الخصوصية</Link>
        <span>·</span>
        <Link to="/about" className="hover:text-gray-600 transition-colors">من نحن</Link>
        <span>·</span>
        <Link to="/contact" className="hover:text-gray-600 transition-colors">تواصل معنا</Link>
      </div>
    </div>
  );
}
