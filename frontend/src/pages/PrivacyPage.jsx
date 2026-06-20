import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Calendar } from 'lucide-react';

const LAST_UPDATED = '15 يونيو 2026';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
      <span className="w-1.5 h-6 bg-primary-700 rounded-full inline-block flex-shrink-0" />
      {title}
    </h2>
    <div className="text-gray-600 leading-loose text-sm space-y-3 mr-4">
      {children}
    </div>
  </div>
);

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <img src="/Logo.png" alt="CheckMyDevice" className="w-14 h-14 object-contain rounded-2xl mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">سياسة الخصوصية</h1>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>آخر تحديث: {LAST_UPDATED}</span>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-8 text-sm text-blue-800 leading-relaxed">
        <strong>ملخص سريع:</strong> نحن لا نبيع بياناتك لأحد. نجمع فقط ما نحتاجه لتقديم الخدمة.
        بياناتك مشفرة ومحمية. يمكنك حذف حسابك في أي وقت.
      </div>

      <div className="card">
        <Section title="١. من نحن">
          <p>
            CheckMyDevice هي منصة إلكترونية لفحص حالة الأجهزة المحمولة في الوطن العربي.
            نعمل كوسيط بين أصحاب الأجهزة المسروقة والمشترين المحتملين لمنع تداول الأجهزة المسروقة.
          </p>
          <p>
            للتواصل معنا بشأن الخصوصية: <a href="mailto:privacy@checkmydevice.com" className="text-primary-700 hover:underline" dir="ltr">privacy@checkmydevice.com</a>
          </p>
        </Section>

        <Section title="٢. البيانات التي نجمعها">
          <p><strong>بيانات الحساب:</strong> الاسم، البريد الإلكتروني، رقم الهاتف (اختياري)، كلمة المرور (مشفرة ببروتوكول bcrypt — لا نعرفها نحن).</p>
          <p><strong>بيانات البلاغات:</strong> رقم IMEI، معلومات الجهاز، صور الإثبات، بيانات التواصل التي تختار مشاركتها.</p>
          <p><strong>بيانات الاستخدام:</strong> عمليات البحث (IMEI فقط، مُقنَّعة)، عنوان IP، نوع المتصفح، وقت الاستخدام.</p>
          <p><strong>ما لا نجمعه:</strong> معلومات بطاقة الائتمان (تُعالَج عبر بوابات دفع آمنة)، بيانات جهات الاتصال، الموقع الجغرافي الدقيق.</p>
        </Section>

        <Section title="٣. كيف نستخدم بياناتك">
          <p>• تشغيل وتحسين الخدمة وتقديم نتائج البحث.</p>
          <p>• إرسال إشعارات مهمة (تغيير حالة البلاغ، البحث عن جهازك).</p>
          <p>• مراجعة طلبات البلاغات يدوياً للتحقق من صحتها.</p>
          <p>• الامتثال للمتطلبات القانونية عند الضرورة.</p>
          <p>• تحسين الأمان ومنع الاحتيال.</p>
          <p className="font-medium text-gray-800">⛔ لا نستخدم بياناتك في الإعلانات المستهدفة. لا نبيع بياناتك لأي طرف ثالث.</p>
        </Section>

        <Section title="٤. مشاركة البيانات">
          <p>لا نشارك بياناتك الشخصية مع أطراف ثالثة إلا في الحالات التالية:</p>
          <p>• <strong>مزودو الخدمة:</strong> شركاء تقنيون يساعدوننا في تشغيل المنصة (استضافة، بريد إلكتروني) ملتزمون بسرية البيانات.</p>
          <p>• <strong>الجهات القانونية:</strong> عند صدور أمر قضائي رسمي من جهة مختصة فقط.</p>
          <p>• <strong>بيانات البلاغات المقبولة:</strong> الجزء العام من البلاغ (ماركة الجهاز، الموديل، الدولة) يظهر لجميع المستخدمين — لكن بيانات التواصل تظهر فقط لمن يرغب التواصل معك صراحةً.</p>
        </Section>

        <Section title="٥. حماية البيانات">
          <p>• <strong>التشفير:</strong> جميع البيانات تُنقل عبر HTTPS/TLS. كلمات المرور مشفرة بـ bcrypt (لا يمكن لأحد معرفتها).</p>
          <p>• <strong>أرقام التواصل:</strong> مشفرة في قاعدة البيانات.</p>
          <p>• <strong>IMEI:</strong> يُعرض مُقنَّعاً للزوار (آخر 4 أرقام فقط).</p>
          <p>• <strong>النسخ الاحتياطي:</strong> يومي تلقائي مع تشفير.</p>
          <p>• <strong>Audit Logs:</strong> كل وصول للبيانات الحساسة مُسجَّل.</p>
        </Section>

        <Section title="٦. ملفات الكوكيز (Cookies)">
          <p>نستخدم كوكيز ضرورية فقط للحفاظ على جلسة تسجيل الدخول. لا نستخدم كوكيز تتبع أو تسويقية.</p>
          <p>يمكنك إيقاف الكوكيز من إعدادات متصفحك، لكن ذلك قد يؤثر على تجربة الاستخدام.</p>
        </Section>

        <Section title="٧. حقوقك">
          <p>لديك الحق في أي وقت في:</p>
          <p>• <strong>الاطلاع:</strong> طلب نسخة من بياناتك الشخصية.</p>
          <p>• <strong>التصحيح:</strong> تصحيح بيانات غير دقيقة من إعدادات الحساب.</p>
          <p>• <strong>الحذف:</strong> حذف حسابك من صفحة الملف الشخصي (نحتفظ بالبلاغات لأغراض قانونية وأمنية).</p>
          <p>• <strong>الاعتراض:</strong> الاعتراض على أي معالجة لبياناتك.</p>
          <p>• <strong>النقل:</strong> طلب نسخة من بياناتك بصيغة قابلة للقراءة.</p>
          <p>لممارسة أي من هذه الحقوق: <a href="mailto:privacy@checkmydevice.com" className="text-primary-700 hover:underline" dir="ltr">privacy@checkmydevice.com</a></p>
        </Section>

        <Section title="٨. الاحتفاظ بالبيانات">
          <p>• <strong>بيانات الحساب:</strong> تُحتفظ طوال فترة وجود الحساب + 30 يوماً بعد الحذف.</p>
          <p>• <strong>البلاغات:</strong> تُحتفظ بصورة مجهولة الهوية لأغراض أمنية حتى بعد حذف الحساب.</p>
          <p>• <strong>سجلات البحث:</strong> تُحذف بعد 12 شهراً.</p>
          <p>• <strong>Audit Logs:</strong> تُحتفظ 3 سنوات للامتثال القانوني.</p>
        </Section>

        <Section title="٩. خصوصية الأطفال">
          <p>
            خدمتنا غير موجهة لمن هم دون 18 سنة. إذا اكتشفنا أن طفلاً قاصراً
            قدّم بياناته، سنحذف الحساب فوراً. للإبلاغ:{' '}
            <a href="mailto:privacy@checkmydevice.com" className="text-primary-700 hover:underline" dir="ltr">privacy@checkmydevice.com</a>
          </p>
        </Section>

        <Section title="١٠. التحديثات على هذه السياسة">
          <p>
            قد نحدّث هذه السياسة من وقت لآخر. عند إجراء تغييرات جوهرية،
            سنُخطرك عبر البريد الإلكتروني المسجل أو بإشعار واضح على المنصة قبل 30 يوماً من التطبيق.
          </p>
        </Section>
      </div>

      {/* Contact box */}
      <div className="mt-8 bg-primary-50 border border-primary-200 rounded-2xl p-6 text-center">
        <Mail className="w-8 h-8 text-primary-700 mx-auto mb-3" />
        <h3 className="font-bold text-gray-900 mb-2">هل لديك سؤال حول خصوصيتك؟</h3>
        <p className="text-gray-500 text-sm mb-4">فريق الخصوصية لدينا يرد خلال 48 ساعة</p>
        <a href="mailto:privacy@checkmydevice.com"
          className="btn-primary inline-block text-sm py-2 px-6" dir="ltr">
          privacy@checkmydevice.com
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
