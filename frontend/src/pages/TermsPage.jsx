import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Calendar } from 'lucide-react';

const LAST_UPDATED = '15 يونيو 2026';

const Section = ({ num, title, children }) => (
  <div className="mb-8">
    <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
      <span className="w-8 h-8 bg-primary-700 text-white rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">
        {num}
      </span>
      {title}
    </h2>
    <div className="text-gray-600 leading-loose text-sm space-y-3 mr-10">
      {children}
    </div>
  </div>
);

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-14 h-14 bg-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileText className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">شروط الاستخدام</h1>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>آخر تحديث: {LAST_UPDATED}</span>
        </div>
      </div>

      {/* Alert */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 text-sm text-amber-800 leading-relaxed">
        <strong>تنبيه مهم:</strong> باستخدامك لمنصة CheckMyDevice، فأنت توافق على هذه الشروط.
        إذا لم توافق على أي منها، يرجى التوقف عن استخدام المنصة.
      </div>

      <div className="card">
        <Section num="١" title="قبول الشروط">
          <p>
            باستخدام منصة CheckMyDevice (الموقع أو التطبيق)، تقر بأنك قرأت هذه الشروط وفهمتها
            وتوافق على الالتزام بها وبسياسة الخصوصية المرتبطة.
          </p>
          <p>
            هذه الشروط تحكم علاقتك مع المنصة. يحق لنا تعديلها في أي وقت مع إشعار مسبق.
          </p>
        </Section>

        <Section num="٢" title="وصف الخدمة">
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

        <Section num="٣" title="إخلاء المسؤولية">
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

        <Section num="٤" title="التزامات المستخدم">
          <p>بالتسجيل في المنصة، تلتزم بما يلي:</p>
          <p>• تقديم معلومات صحيحة ودقيقة عند التسجيل وعند رفع البلاغات.</p>
          <p>• عدم رفع بلاغات كاذبة أو مزيفة بهدف الإضرار بأشخاص أو تجار.</p>
          <p>• عدم استخدام المنصة لأغراض غير قانونية أو مخالفة للنظام العام.</p>
          <p>• عدم محاولة اختراق المنصة أو التلاعب بقاعدة البيانات.</p>
          <p>• الامتناع عن نشر محتوى مسيء أو تشهيري.</p>
          <p>• عدم استخدام bots أو أدوات آلية لاستنزاف الخدمة.</p>
        </Section>

        <Section num="٥" title="البلاغات والمحتوى">
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

        <Section num="٦" title="الملكية الفكرية">
          <p>
            جميع محتويات المنصة (الشعار، التصميم، الكود، قاعدة البيانات) هي ملك حصري
            لـ CheckMyDevice ومحمية بموجب قوانين الملكية الفكرية.
          </p>
          <p>
            لا يحق نسخ أو توزيع أو إعادة استخدام أي محتوى دون إذن كتابي مسبق.
          </p>
        </Section>

        <Section num="٧" title="الحسابات والأمان">
          <p>• أنت مسؤول عن سرية بيانات حسابك وكلمة مرورك.</p>
          <p>• أبلغنا فوراً عن أي اختراق أو استخدام غير مصرح به لحسابك.</p>
          <p>• نحتفظ بحق تعليق أو حذف أي حساب يخالف هذه الشروط.</p>
        </Section>

        <Section num="٨" title="الأسعار والاشتراكات">
          <p>• الاشتراك المجاني متاح للجميع بحدود استخدام يومية.</p>
          <p>• الخطط المدفوعة يمكن إلغاؤها في أي وقت مع احتفاظك بالمميزات حتى نهاية الفترة المدفوعة.</p>
          <p>• لا نُقدّم استردادًا للمبالغ إلا في حالات استثنائية موثقة.</p>
          <p>• نحتفظ بحق تعديل الأسعار مع إشعار مسبق 30 يوماً.</p>
        </Section>

        <Section num="٩" title="القانون المطبق والاختصاص القضائي">
          <p>
            تخضع هذه الشروط لقوانين جمهورية مصر العربية. أي نزاع ينشأ عن استخدام
            المنصة يُحسم أمام المحاكم المصرية المختصة.
          </p>
        </Section>

        <Section num="١٠" title="التواصل والشكاوى">
          <p>
            للتواصل أو تقديم شكوى:{' '}
            <a href="mailto:support@checkmydevice.com" className="text-primary-700 hover:underline" dir="ltr">
              support@checkmydevice.com
            </a>
          </p>
          <p>نلتزم بالرد خلال 5 أيام عمل.</p>
        </Section>
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
