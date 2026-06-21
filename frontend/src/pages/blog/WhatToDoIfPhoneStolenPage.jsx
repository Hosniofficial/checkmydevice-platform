import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Phone, FileText, Lock, Bell, Share2, AlertTriangle, CheckCircle } from 'lucide-react';
import SEOHead from '../../components/SEOHead.jsx';
import BlogLayout from '../../components/blog/BlogLayout.jsx';

const META = {
  title:      'سُرق هاتفي — 8 خطوات يجب فعلها فوراً',
  description:'قفل الجهاز، إبلاغ الشرطة، تسجيل IMEI، وحماية بياناتك — كل خطوة موضحة.',
  breadcrumb: 'سُرق هاتفي ماذا أفعل؟',
  category:   'طوارئ',
  readTime:   5,
  related: [
    { to: '/blog/free-imei-check', title: 'فحص IMEI مجاني — كيف تجد رقم IMEI' },
    { to: '/blog/how-to-report-stolen-phone', title: 'كيف أبلغ عن هاتف مسروق في CheckMyDevice؟' },
    { to: '/blog/what-to-do-if-phone-lost', title: 'ضاع هاتفي — كيف أجده أو أحمي بياناتي؟' },
  ],
};

const STEPS = [
  {
    icon: Lock,
    color: 'bg-red-50 border-red-200 text-red-700',
    iconColor: 'text-red-600',
    title: 'أوقف الجهاز عن بُعد فوراً',
    desc: 'لو كنت تستخدم iPhone: iCloud → Find My → الجهاز → Mark as Lost. لو Android: myaccount.google.com → Find My Device → قفل الجهاز. سيُقفل الجهاز ويعرض رسالة تواصل.',
    urgent: true,
  },
  {
    icon: ShieldAlert,
    color: 'bg-orange-50 border-orange-200 text-orange-700',
    iconColor: 'text-orange-600',
    title: 'بلّغ شركة الاتصالات',
    desc: 'اتصل بخط العميل لشركتك على الفور. سيوقفون الخط وسيمنعون استخدام الجهاز على شبكتهم عبر IMEI.',
    urgent: true,
  },
  {
    icon: FileText,
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    iconColor: 'text-blue-600',
    title: 'قدّم بلاغاً للشرطة',
    desc: 'البلاغ الرسمي ضروري لأسباب قانونية وللتعامل مع شركة التأمين إن وجدت. احتفظ برقم المحضر.',
    urgent: false,
  },
  {
    icon: Bell,
    color: 'bg-primary-50 border-primary-200 text-primary-700',
    iconColor: 'text-primary-700',
    title: 'سجّل بلاغاً في CheckMyDevice',
    desc: 'هذه الخطوة تحمي الآخرين من شراء جهازك وقد تساعدك في استرداده. ستتلقى إشعاراً فور بحث أي شخص عن جهازك.',
    urgent: false,
    link: { to: '/reports/new', label: 'رفع بلاغ الآن' },
  },
  {
    icon: Lock,
    color: 'bg-purple-50 border-purple-200 text-purple-700',
    iconColor: 'text-purple-600',
    title: 'غيّر كلمات المرور',
    desc: 'غيّر كلمة مرور البريد الإلكتروني، الحسابات البنكية، واتساب، وأي تطبيق مالي فوراً من جهاز آخر.',
    urgent: false,
  },
  {
    icon: Phone,
    color: 'bg-green-50 border-green-200 text-green-700',
    iconColor: 'text-green-600',
    title: 'أبلّغ من في دفتر اتصالاتك',
    desc: 'اللص قد يرسل رسائل احتيالية من رقمك لجهات اتصالك. أبلغهم بما حدث لتجنب وقوع غيرك ضحية.',
    urgent: false,
  },
  {
    icon: FileText,
    color: 'bg-gray-50 border-gray-200 text-gray-700',
    iconColor: 'text-gray-600',
    title: 'سجّل الـ IMEI مع الشرطة',
    desc: 'تأكد من تضمين رقم الـ IMEI في البلاغ الرسمي. الشرطة تستطيع تتبع الجهاز عبره إذا ظهر في الشبكة.',
    urgent: false,
  },
  {
    icon: Share2,
    color: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    iconColor: 'text-yellow-600',
    title: 'شارك بلاغك',
    desc: 'بعد قبول بلاغك في CheckMyDevice، شارك رابط البحث عن جهازك على مجموعات السوشيال في منطقتك — كلما انتشر زادت فرصة العثور عليه.',
    urgent: false,
  },
];

export default function WhatToDoIfPhoneStolenPage() {
  return (
    <>
      <SEOHead page="blog/what-to-do-if-phone-stolen" />
      <BlogLayout meta={META}>

        {/* Urgent banner */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 mb-8">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800 text-sm leading-relaxed font-medium">
            الدقائق الأولى بعد السرقة هي الأهم. الخطوتان الأولى والثانية يجب تنفيذهما فوراً لحماية بياناتك ومنع استخدام الجهاز.
          </p>
        </div>

        {/* Steps */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-5">الخطوات الـ 8 بالترتيب</h2>
          <div className="space-y-4">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className={`border rounded-2xl p-5 ${step.color}`}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 flex items-center gap-2">
                      <span className="w-7 h-7 bg-white border border-current rounded-full text-xs font-bold flex items-center justify-center opacity-70">
                        {i + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Icon className={`w-4 h-4 ${step.iconColor}`} />
                        <p className="font-bold text-sm">{step.title}</p>
                        {step.urgent && (
                          <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">عاجل</span>
                        )}
                      </div>
                      <p className="text-sm leading-relaxed opacity-90">{step.desc}</p>
                      {step.link && (
                        <Link
                          to={step.link.to}
                          className="inline-block mt-2 text-xs font-semibold bg-primary-700 text-white px-3 py-1.5 rounded-lg hover:bg-primary-900 transition-colors"
                        >
                          {step.link.label}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Checklist */}
        <section className="mb-2">
          <h2 className="text-xl font-bold text-gray-900 mb-3">ملاحظات مهمة</h2>
          <div className="space-y-2">
            {[
              'إذا كنت لا تعرف رقم IMEI، قد تجده في فاتورة الشراء أو علبة الجهاز القديمة.',
              'شركات الاتصالات تحتفظ بسجلات IMEI — يمكنها مساعدتك في استرجاعه.',
              'لا تحاول استرداد الجهاز بنفسك — أخبر الشرطة إذا عثرت على الجهاز.',
              'التأمين على الهاتف (إن وجد) يتطلب بلاغاً رسمياً من الشرطة.',
            ].map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-600 text-sm leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </section>

      </BlogLayout>
    </>
  );
}
