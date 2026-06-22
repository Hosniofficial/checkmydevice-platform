import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Upload, CheckCircle, Clock, Bell, Share2, AlertTriangle } from 'lucide-react';
import SEOHead from '../../components/SEOHead.jsx';
import BlogLayout from '../../components/blog/BlogLayout.jsx';

const META = {
  title:      'كيف أبلغ عن هاتف مسروق أو مفقود؟ — دليل خطوة بخطوة',
  description:'تعلم كيف تسجل بلاغاً رسمياً في CheckMyDevice. ما البيانات المطلوبة، كيف تثبت الملكية، وما يحدث بعد القبول.',
  breadcrumb: 'كيف أبلغ عن هاتف مسروق؟',
  category:   'دليل عملي',
  readTime:   3,
  related: [
    { to: '/blog/what-to-do-if-phone-stolen', title: 'سُرق هاتفي — 8 خطوات يجب فعلها فوراً' },
    { to: '/blog/free-imei-check', title: 'فحص IMEI مجاني — كيف تجد رقم IMEI' },
    { to: '/blog/what-to-do-if-phone-lost', title: 'ضاع هاتفي — كيف أجده أو أحمي بياناتي؟' },
  ],
};

const DOCS = [
  { ok: true,  label: 'صورة علبة الجهاز (تظهر IMEI والموديل)', priority: 'ممتاز' },
  { ok: true,  label: 'فاتورة الشراء', priority: 'ممتاز' },
  { ok: true,  label: 'صورة الجهاز مع بطاقة هويتك', priority: 'جيد' },
  { ok: false, label: 'صورة الجهاز وحده بدون إثبات ملكية', priority: 'ضعيف' },
];

export default function HowToReportStolenPhonePage() {
  return (
    <>
      <SEOHead page="blog/how-to-report-stolen-phone" />
      <BlogLayout meta={META}>

        {/* Intro */}
        <section className="mb-8">
          <p className="text-gray-600 leading-relaxed mb-4">
            تسجيل بلاغ في CheckMyDevice هو الخطوة الأهم لحماية الآخرين من شراء جهازك المسروق — وللحصول على إشعار فوري عند بحث أي شخص عنه. العملية بسيطة وتستغرق أقل من 5 دقائق.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-800 text-sm leading-relaxed">
              الإبلاغ <strong>مجاني تماماً</strong> — كل ما تحتاجه هو حساب مجاني في CheckMyDevice وصورة واحدة كإثبات ملكية.
            </p>
          </div>
        </section>

        {/* Requirements */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">ما تحتاجه قبل البدء</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { title: 'رقم IMEI', desc: 'من فاتورة الشراء أو علبة الجهاز أو *#06#', required: true },
              { title: 'ماركة وموديل الجهاز', desc: 'مثلاً: Apple iPhone 14 Pro', required: true },
              { title: 'صورة إثبات ملكية', desc: 'علبة الجهاز أو فاتورة الشراء', required: true },
              { title: 'تاريخ الحادثة', desc: 'تاريخ السرقة أو الضياع تقريباً', required: false },
            ].map(({ title, desc, required }) => (
              <div key={title} className={`border rounded-xl p-3.5 ${required ? 'bg-primary-50 border-primary-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-sm text-gray-900">{title}</p>
                  {required && <span className="text-xs text-red-600 font-medium">مطلوب</span>}
                </div>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Steps */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">خطوات تسجيل البلاغ</h2>
          <ol className="space-y-4">
            {[
              { icon: FileText, title: 'أنشئ حساباً مجانياً أو سجّل دخولك', desc: 'من صفحة التسجيل — يستغرق أقل من دقيقة.', link: { to: '/register', label: 'إنشاء حساب مجاني' } },
              { icon: FileText, title: 'اضغط "رفع بلاغ جديد"', desc: 'من لوحة التحكم أو من قائمة "بلاغاتي" اضغط الزر الأزرق.', link: { to: '/reports/new', label: 'رفع بلاغ الآن' } },
              { icon: FileText, title: 'أدخل بيانات الجهاز', desc: 'الماركة، الموديل، رقم IMEI، اللون، السعة، نوع البلاغ (مسروق/مفقود).' },
              { icon: Upload, title: 'ارفع صورة إثبات الملكية', desc: 'صورة العلبة أو فاتورة الشراء — مطلوبة لقبول البلاغ.' },
              { icon: Bell, title: 'أضف بيانات التواصل (اختياري)', desc: 'واتساب أو إيميل — حتى يتمكن من وجد الجهاز من التواصل معك مباشرةً.' },
              { icon: CheckCircle, title: 'أرسل البلاغ وانتظر المراجعة', desc: 'يراجع فريقنا البلاغ يدوياً خلال 24-48 ساعة. ستتلقى إشعاراً بالقبول أو الرفض.' },
            ].map(({ icon: Icon, title, desc, link }, i) => (
              <li key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="w-8 h-8 bg-primary-700 text-white rounded-full text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  {i < 5 && <div className="w-px flex-1 bg-gray-200 my-1" />}
                </div>
                <div className="pb-4">
                  <p className="font-semibold text-gray-900 text-sm mb-1">{title}</p>
                  <p className="text-gray-500 text-sm leading-relaxed mb-2">{desc}</p>
                  {link && (
                    <Link to={link.to} className="inline-block text-xs bg-white text-primary-700 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-colors font-medium border border-primary-200">
                      {link.label}
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Docs quality */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">جودة المستندات — ما المقبول؟</h2>
          <div className="space-y-2">
            {DOCS.map(({ ok, label, priority }) => (
              <div key={label} className={`flex items-center gap-3 border rounded-xl p-3 ${ok ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <CheckCircle className={`w-4 h-4 flex-shrink-0 ${ok ? 'text-green-600' : 'text-gray-400'}`} />
                <p className="text-sm text-gray-700 flex-1">{label}</p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ok ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                  {priority}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* After approval */}
        <section className="mb-2">
          <h2 className="text-xl font-bold text-gray-900 mb-3">ماذا يحدث بعد قبول البلاغ؟</h2>
          <div className="space-y-2">
            {[
              { icon: CheckCircle, text: 'يُضاف جهازك لقاعدة بياناتنا ويظهر في نتائج البحث', color: 'text-green-600' },
              { icon: Bell, text: 'تتلقى إشعاراً بالبريد الإلكتروني فور بحث أي شخص عن جهازك', color: 'text-primary-700' },
              { icon: Share2, text: 'يمكنك مشاركة رابط بلاغك — كلما انتشر زادت فرصة العثور على جهازك', color: 'text-blue-600' },
              { icon: Clock, text: 'إذا استردت الجهاز، ألغِ البلاغ من "بلاغاتي" لحماية من يرغب في شرائه لاحقاً', color: 'text-orange-600' },
            ].map(({ icon: Icon, text, color }, i) => (
              <div key={i} className="flex gap-3 items-start">
                <Icon className={`w-4 h-4 ${color} flex-shrink-0 mt-0.5`} />
                <p className="text-gray-600 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </section>

      </BlogLayout>
    </>
  );
}
