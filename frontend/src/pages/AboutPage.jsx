import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Users, Globe, CheckCircle, Heart, Zap, Lock, Shield } from 'lucide-react';
import SEOHead from '../components/SEOHead.jsx';

const STATS = [
  { value: '50,000+', label: 'جهاز مسجل' },
  { value: '15',      label: 'دولة عربية' },
  { value: '100%',    label: 'مراجعة يدوية' },
  { value: '24/7',    label: 'خدمة متواصلة' },
];

const VALUES = [
  { icon: Shield,       title: 'الأمان أولاً',     desc: 'نضع أمان المستخدمين وخصوصية بياناتهم فوق كل اعتبار. كل بلاغ يمر بمراجعة يدوية صارمة قبل النشر.' },
  { icon: CheckCircle,  title: 'الموثوقية',          desc: 'نلتزم بدقة البيانات والتحقق من كل بلاغ. لا نتساهل في نشر معلومات غير موثقة.' },
  { icon: Heart,        title: 'خدمة المجتمع',      desc: 'نؤمن أن قوتنا تأتي من مجتمعنا. كل مستخدم يساهم في بناء قاعدة بيانات أكثر أماناً للجميع.' },
  { icon: Globe,        title: 'التغطية العربية',    desc: 'نستهدف خدمة الوطن العربي بأكمله بمحتوى عربي حقيقي وتجربة مصممة خصيصاً للمستخدم العربي.' },
];

const TEAM = [
  { name: 'فريق التطوير',  role: 'Backend & Frontend',  emoji: '💻' },
  { name: 'فريق المراجعة', role: 'مراجعة البلاغات يدوياً', emoji: '🔍' },
  { name: 'فريق الدعم',    role: 'دعم المستخدمين',        emoji: '🎧' },
  { name: 'فريق الأمان',   role: 'حماية البيانات',         emoji: '🔒' },
];

export default function AboutPage() {
  return (
    <div className="bg-white">
      <SEOHead page="about" />

      {/* Hero */}
      <section className="bg-gradient-to-bl from-primary-700 to-blue-900 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <img src="/Logo.png" alt="CheckMyDevice" className="w-14 h-14 object-contain rounded-2xl mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">من نحن</h1>
          <p className="text-blue-200 text-lg leading-relaxed max-w-xl mx-auto">
            CheckMyDevice هي منصة عربية رائدة لفحص الأجهزة المحمولة والتحقق من حالتها قبل الشراء،
            نحمي المشترين ونساعد أصحاب الأجهزة المسروقة على استردادها.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-gray-100 py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <div className="text-3xl font-bold text-primary-700 mb-1">{value}</div>
              <div className="text-sm text-gray-500">{label}</div>
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
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">قيمنا</h2>
            <p className="text-gray-500 text-sm">المبادئ التي نعمل بموجبها كل يوم</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
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
      <section className="py-16 px-4 max-w-3xl mx-auto text-center">
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
          اليوم، CheckMyDevice تخدم مستخدمين في 15 دولة عربية وتنمو كل يوم
          بفضل مجتمعنا الرائع.
        </p>
      </section>

      {/* Team */}
      <section className="bg-primary-700 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <Users className="w-8 h-8 mx-auto mb-3 text-blue-300" />
            <h2 className="text-2xl font-bold mb-2">فريقنا</h2>
            <p className="text-blue-200 text-sm">مجموعة متحمسة تعمل من أجل أمان المجتمع العربي</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {TEAM.map(({ name, role, emoji }) => (
              <div key={name} className="bg-white/10 rounded-2xl p-5">
                <div className="text-4xl mb-3">{emoji}</div>
                <div className="font-semibold">{name}</div>
                <div className="text-blue-300 text-xs mt-1">{role}</div>
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
