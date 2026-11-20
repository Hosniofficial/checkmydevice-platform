import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Users, Globe, CheckCircle, Heart, Zap, Lock, Shield } from 'lucide-react';
import SEOHead from '../components/SEOHead.jsx';

const SERVICE_DETAILS = [
  { title: 'معلومات الجهاز', description: 'تظهر تفاصيل الطراز عند توفرها.' },
  { title: 'البلاغات المتاحة', description: 'راجع البلاغات المسجلة على المنصة.' },
  { title: 'النتيجة', description: 'مؤشر إضافي لا يغني عن فحص الجهاز.' },
];

const VALUES = [
  { icon: Shield,       title: 'الأمان أولاً',     desc: 'نضع أمان المستخدمين وخصوصية بياناتهم فوق كل اعتبار. كل بلاغ يمر بمراجعة يدوية صارمة قبل النشر.' },
  { icon: CheckCircle,  title: 'الموثوقية',          desc: 'نلتزم بدقة البيانات والتحقق من كل بلاغ. لا نتساهل في نشر معلومات غير موثقة.' },
  { icon: Heart,        title: 'خدمة المجتمع',      desc: 'نؤمن أن قوتنا تأتي من مجتمعنا. كل مستخدم يساهم في بناء قاعدة بيانات أكثر أماناً للجميع.' },
  { icon: Globe,        title: 'التغطية العربية',    desc: 'نستهدف خدمة الوطن العربي بأكمله بمحتوى عربي حقيقي وتجربة مصممة خصيصاً للمستخدم العربي.' },
];

const TEAM = [
  { name: 'فريق التطوير',  role: 'تطوير المنصة',       icon: Zap },
  { name: 'فريق المراجعة', role: 'مراجعة البلاغات',     icon: CheckCircle },
  { name: 'فريق الدعم',    role: 'مساندة المستخدمين',   icon: Users },
  { name: 'فريق الأمان',   role: 'حماية البيانات',       icon: Lock },
];

export default function AboutPage() {
  return (
    <div>
      <SEOHead page="about" />

      <section className="border-b border-[#e7e4dc] bg-[#f5f3ee] px-4 py-14 sm:py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-accent-500">عن المنصة</p>
            <h1 className="mt-2 text-4xl font-bold text-primary-900">من نحن</h1>
            <p className="mt-4 max-w-xl text-base leading-8 text-gray-600">
              CheckMyDevice منصة عربية تساعد على مراجعة معلومات الأجهزة والبلاغات المتاحة قبل الشراء.
            </p>
          </div>
          <div className="flex items-center gap-4 border-s-2 border-accent-500 ps-5">
            <img src="/Logo.png" alt="" className="h-12 w-12 object-contain" />
            <p className="max-w-md text-sm leading-7 text-gray-600">
              نهدف إلى تسهيل الوصول إلى المعلومات المتاحة، مع التذكير بأن غياب البلاغ لا يثبت سلامة الجهاز.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-200 bg-white px-4 py-6">
        <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-gray-200 sm:grid-cols-3 sm:divide-y-0 sm:divide-x sm:divide-x-reverse">
          {SERVICE_DETAILS.map(({ title, description }, index) => (
            <div key={title} className="py-4 sm:px-6 sm:first:ps-0 sm:last:pe-0">
              <p className="text-xs font-semibold tracking-widest text-accent-500" dir="ltr">
                0{index + 1}
              </p>
              <h2 className="mt-2 text-sm font-bold text-gray-800">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-2 text-primary-700 mb-4">
              <Target className="w-5 h-5" />
              <span className="font-semibold text-sm uppercase tracking-wide">رسالتنا</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              نجعل سوق الأجهزة المستعملة أكثر أماناً
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              مع انتشار البيع عبر الإنترنت، أصبح من السهل شراء جهاز مسروق دون علم المشتري.
              CheckMyDevice توفر أداة بسيطة وموثوقة للتحقق من حالة أي جهاز قبل الشراء.
            </p>
            <p className="text-gray-600 leading-relaxed">
              نبني قاعدة بيانات عربية تشاركية تعتمد على مجتمعنا — كل مستخدم يُبلّغ عن
              جهازه المسروق يحمي مئات المشترين المستقبليين.
            </p>
          </div>
          <div className="space-y-4">
            {[
              'نراجع كل بلاغ يدوياً قبل نشره',
              'نحمي بيانات المستخدمين بأعلى معايير الأمان',
              'نُبلّغ أصحاب الأجهزة فور البحث عنها',
              'نتوسع باستمرار لتغطية جميع الدول العربية',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-[#f5f3ee] px-4 py-14 sm:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">قيمنا</h2>
            <p className="text-gray-500 text-sm">المبادئ التي نعمل بموجبها كل يوم</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="surface-card p-6">
                <div className="w-11 h-11 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary-700" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it started */}
      <section className="mx-auto max-w-3xl px-4 py-14 text-center sm:py-16">
        <Zap className="w-10 h-10 text-primary-700 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">كيف بدأت الفكرة؟</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          بدأت الفكرة من مشكلة حقيقية — شراء هاتف مستعمل عبر الإنترنت واكتشاف لاحقاً أنه مسروق.
          لم يكن هناك في العالم العربي منصة موثوقة للتحقق من حالة الجهاز قبل الشراء.
        </p>
        <p className="text-gray-600 leading-relaxed mb-4">
          قررنا بناء هذه المنصة بأنفسنا — مع مراجعة يدوية لكل بلاغ لضمان الدقة،
          وإشعارات فورية لأصحاب الأجهزة المسروقة عند البحث عنها.
        </p>
        <p className="text-gray-600 leading-relaxed">
          نواصل تطوير المنصة استناداً إلى احتياجات المستخدمين وملاحظاتهم.
        </p>
      </section>

      <section className="bg-[#f5f3ee] px-4 py-14 sm:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-accent-500">من وراء الخدمة</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">الأدوار التي تبني المنصة</h2>
            <p className="mt-2 text-sm text-gray-500">مسؤوليات مختلفة تعمل معاً لتحسين تجربة الاستخدام.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {TEAM.map(({ name, role, icon: Icon }) => (
              <div key={name} className="surface-card p-5">
                <Icon className="mx-auto mb-3 h-6 w-6 text-primary-700" aria-hidden="true" />
                <div className="font-semibold text-gray-900">{name}</div>
                <div className="mt-1 text-xs text-gray-500">{role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">انضم إلى مجتمعنا</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          سجّل حساباً مجانياً وساهم في بناء سوق أجهزة أكثر أماناً في الوطن العربي
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/register" className="btn-primary">سجّل مجاناً</Link>
          <Link to="/search" className="btn-outline">فحص جهاز الآن</Link>
        </div>
      </section>
    </div>
  );
}
