import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Smartphone, AlertTriangle, CheckCircle } from 'lucide-react';
import SEOHead from '../../components/SEOHead.jsx';
import BlogLayout from '../../components/blog/BlogLayout.jsx';

const META = {
  title:      'فحص IMEI مجاني — تحقق من جهازك في ثوانٍ',
  description:'ما هو رقم IMEI؟ كيف تجده؟ ولماذا هو مفتاح التحقق من أي جهاز قبل الشراء.',
  breadcrumb: 'فحص IMEI مجاني',
  category:   'دليل عملي',
  readTime:   4,
  related: [
    { to: '/blog/how-to-check-stolen-phone', title: 'كيف أعرف أن الهاتف مسروق؟ — 7 طرق للتحقق' },
    { to: '/blog/what-to-do-if-phone-stolen', title: 'سُرق هاتفي — 8 خطوات يجب فعلها فوراً' },
    { to: '/blog/how-to-report-stolen-phone', title: 'كيف أبلغ عن هاتف مسروق؟' },
  ],
};

export default function FreeImeiCheckPage() {
  return (
    <>
      <SEOHead page="blog/free-imei-check" />
      <BlogLayout meta={META}>

        {/* Section 1 */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">ما هو رقم IMEI؟</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            IMEI اختصار لـ <strong>International Mobile Equipment Identity</strong> — رقم مكوّن من <strong>15 رقماً</strong> يُعرّف كل جهاز محمول بشكل فريد في العالم. يشبه رقم الشاسيه في السيارة تماماً، لا يتكرر أبداً.
          </p>
          <div className="bg-primary-50 border border-primary-100 rounded-xl p-4">
            <p className="text-primary-800 text-sm font-medium mb-1">مثال على رقم IMEI:</p>
            <p className="font-mono text-lg text-primary-700 tracking-widest">358240051111110</p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">كيف أجد رقم IMEI الخاص بي؟</h2>
          <div className="space-y-3">
            {[
              { icon: Smartphone, title: 'الطريقة الأسرع', desc: 'اتصل بـ *#06# من هاتفك — سيظهر رقم IMEI فوراً على الشاشة.' },
              { icon: Shield, title: 'من إعدادات الهاتف', desc: 'الإعدادات ← عن الهاتف ← معلومات الجهاز ← IMEI.' },
              { icon: CheckCircle, title: 'من علبة الجهاز', desc: 'مطبوع على ملصق في داخل العلبة أو على غلاف الجهاز الخلفي.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 bg-gray-50 rounded-xl p-4">
                <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary-700" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm mb-0.5">{title}</p>
                  <p className="text-gray-500 text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3 */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">لماذا يجب فحص IMEI قبل الشراء؟</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            عند شراء هاتف مستعمل، لا يكفي أن يبدو الجهاز جيداً من الخارج. الأجهزة المسروقة تُباع يومياً في الأسواق الإلكترونية وتبدو طبيعية تماماً. فحص الـ IMEI هو الطريقة الوحيدة للتحقق الموضوعي.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-amber-800 text-sm leading-relaxed">
              <strong>تنبيه:</strong> نتيجة "نظيف" لا تعني 100% أن الجهاز غير مسروق — بل تعني أنه غير مُبلَّغ عنه في قاعدة بياناتنا. استخدمها كمرجع إضافي.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">كيف تفحص IMEI في CheckMyDevice؟</h2>
          <ol className="space-y-3">
            {[
              'اذهب إلى صفحة الفحص عبر الزر أدناه',
              'اتصل بـ *#06# على الهاتف الذي تريد شراءه للحصول على رقم IMEI',
              'أدخل الرقم في خانة البحث واضغط "فحص"',
              'ستظهر النتيجة فوراً — نظيف أو مسروق أو مفقود',
            ].map((step, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="w-6 h-6 bg-primary-700 text-white rounded-full text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                  {i + 1}
                </span>
                <p className="text-gray-700 text-sm leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Section 5 */}
        <section className="mb-2">
          <h2 className="text-xl font-bold text-gray-900 mb-3">كم عدد عمليات الفحص المجانية؟</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { label: 'زائر بدون حساب', value: '5 عمليات/يوم', color: 'bg-gray-50 border-gray-200' },
              { label: 'حساب مجاني', value: '20 عملية/يوم', color: 'bg-green-50 border-green-200' },
              { label: 'خطة مدفوعة', value: 'حسب الخطة', color: 'bg-primary-50 border-primary-200' },
            ].map(({ label, value, color }) => (
              <div key={label} className={`border rounded-xl p-4 text-center ${color}`}>
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="font-bold text-gray-900">{value}</p>
              </div>
            ))}
          </div>
          <p className="text-center mt-3">
            <Link to="/register" className="text-primary-700 text-sm hover:underline font-medium">
              سجّل مجاناً للحصول على 20 عملية يومياً ←
            </Link>
          </p>
        </section>

      </BlogLayout>
    </>
  );
}
