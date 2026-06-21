import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, CheckCircle, XCircle, AlertTriangle, Search } from 'lucide-react';
import SEOHead from '../../components/SEOHead.jsx';
import BlogLayout from '../../components/blog/BlogLayout.jsx';

const META = {
  title:      'كيف أعرف أن الهاتف مسروق؟ — 7 طرق للتحقق قبل الشراء',
  description:'علامات تدل على أن الهاتف المستعمل مسروق، وكيف تحمي نفسك قبل الشراء.',
  breadcrumb: 'كيف أعرف أن الهاتف مسروق؟',
  category:   'نصائح الشراء',
  readTime:   5,
  related: [
    { to: '/blog/free-imei-check', title: 'فحص IMEI مجاني — تحقق من جهازك في ثوانٍ' },
    { to: '/blog/what-to-do-if-phone-stolen', title: 'سُرق هاتفي — 8 خطوات يجب فعلها فوراً' },
    { to: '/blog/how-to-report-stolen-phone', title: 'كيف أبلغ عن هاتف مسروق؟' },
  ],
};

const SIGNS = [
  { ok: false, text: 'البائع يرفض الاتصال بـ *#06# أمامك لعرض رقم IMEI' },
  { ok: false, text: 'السعر أقل بكثير من سعر السوق بدون سبب منطقي' },
  { ok: false, text: 'لا توجد علبة أصلية أو فاتورة شراء' },
  { ok: false, text: 'الجهاز مقفل بحساب iCloud أو Google Account لا يمكن إزالته' },
  { ok: false, text: 'IMEI مكشوط أو غير واضح على الجهاز' },
  { ok: false, text: 'البائع يُلحّ على البيع السريع ولا يريد وقتاً للتحقق' },
  { ok: false, text: 'النتيجة تظهر "مسروق" أو "مفقود" عند فحص الـ IMEI' },
];

export default function HowToCheckStolenPhonePage() {
  return (
    <>
      <SEOHead page="blog/how-to-check-stolen-phone" />
      <BlogLayout meta={META}>

        {/* Intro */}
        <section className="mb-8">
          <p className="text-gray-600 leading-relaxed mb-4">
            مع انتشار البيع الإلكتروني، أصبح من السهل جداً أن تشتري هاتفاً مسروقاً دون أن تعلم. البائعون الاحتياليون يُقدّمون الأجهزة المسروقة بأسعار مغرية، لكن الثمن الحقيقي قد يكون فقدان مالك ومشاكل قانونية.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-amber-800 text-sm leading-relaxed">
              في بعض الدول، حيازة جهاز مسروق حتى بحسن نية قد تعرضك لمشاكل قانونية. التحقق قبل الشراء يحميك قانونياً ومالياً.
            </p>
          </div>
        </section>

        {/* 7 signs */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">7 علامات تدل على أن الهاتف مسروق</h2>
          <div className="space-y-2">
            {SIGNS.map(({ ok, text }, i) => (
              <div key={i} className="flex gap-3 items-start bg-red-50 border border-red-100 rounded-xl p-3.5">
                <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* IMEI check */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">الطريقة الأكيدة — فحص IMEI</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            رغم أهمية العلامات السابقة، إلا أنها قد تخدعك. الطريقة الوحيدة الموثوقة للتحقق هي فحص رقم الـ IMEI في قاعدة بيانات الأجهزة المسروقة.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            {[
              { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 border-green-200', title: 'نتيجة "نظيف"', desc: 'لم يُبلَّغ عن الجهاز — علامة جيدة لكن غير كافية وحدها.' },
              { icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50 border-red-200', title: 'نتيجة "مسروق/مفقود"', desc: 'تجنب الشراء فوراً. أبلغ عن البائع إذا أمكن.' },
            ].map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className={`border rounded-xl p-4 ${bg}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-5 h-5 ${color}`} />
                  <p className="font-semibold text-gray-900 text-sm">{title}</p>
                </div>
                <p className="text-gray-600 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Checklist before buying */}
        <section className="mb-2">
          <h2 className="text-xl font-bold text-gray-900 mb-3">قائمة التحقق قبل شراء أي هاتف مستعمل</h2>
          <div className="space-y-2">
            {[
              'اطلب من البائع الاتصال بـ *#06# أمامك لعرض الـ IMEI',
              'افحص الـ IMEI في CheckMyDevice قبل دفع أي مبلغ',
              'تحقق من أن الجهاز غير مقفل بحساب iCloud/Google',
              'اطلب فاتورة الشراء أو العلبة الأصلية',
              'لا تشتري من بائعين يرفضون الانتظار للتحقق',
              'اتفق على استرداد المبلغ كاملاً إذا اتضح لاحقاً أن الجهاز مسروق',
            ].map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700 text-sm">{item}</p>
              </div>
            ))}
          </div>
        </section>

      </BlogLayout>
    </>
  );
}
