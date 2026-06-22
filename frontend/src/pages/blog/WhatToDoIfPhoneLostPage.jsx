import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Lock, Bell, Smartphone, CheckCircle, AlertTriangle } from 'lucide-react';
import SEOHead from '../../components/SEOHead.jsx';
import BlogLayout from '../../components/blog/BlogLayout.jsx';

const META = {
  title:      'ضاع هاتفي — كيف أجده أو أحمي بياناتي؟',
  description:'تتبع الجهاز عن بُعد، قفل البيانات، والإبلاغ عنه في قاعدة البيانات.',
  breadcrumb: 'ضاع هاتفي ماذا أفعل؟',
  category:   'طوارئ',
  readTime:   4,
  related: [
    { to: '/blog/what-to-do-if-phone-stolen', title: 'سُرق هاتفي — 8 خطوات يجب فعلها فوراً' },
    { to: '/blog/free-imei-check', title: 'فحص IMEI مجاني — تحقق من جهازك' },
    { to: '/blog/how-to-report-stolen-phone', title: 'كيف أبلغ عن هاتف مسروق أو مفقود؟' },
  ],
};

export default function WhatToDoIfPhoneLostPage() {
  return (
    <>
      <SEOHead page="blog/what-to-do-if-phone-lost" />
      <BlogLayout meta={META}>

        {/* Intro */}
        <section className="mb-8">
          <p className="text-gray-600 leading-relaxed">
            الهاتف الضائع لا يعني بالضرورة خسارته إلى الأبد. مع الخطوات الصحيحة يمكنك إما العثور عليه أو على الأقل حماية بياناتك الشخصية والمالية.
          </p>
        </section>

        {/* Track steps */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">أولاً — حاول تتبع الهاتف</h2>
          <div className="space-y-3">
            {[
              {
                icon: MapPin,
                title: 'iPhone — Find My',
                steps: ['اذهب إلى icloud.com/find من أي جهاز', 'سجّل دخولك بـ Apple ID', 'اختر الجهاز من القائمة', 'ستظهر آخر موقع معروف للجهاز'],
              },
              {
                icon: Smartphone,
                title: 'Android — Find My Device',
                steps: ['اذهب إلى google.com/android/find', 'سجّل دخولك بحساب Google المرتبط', 'اختر الجهاز وستظهر خيارات التتبع والقفل'],
              },
            ].map(({ icon: Icon, title, steps }) => (
              <div key={title} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-4 h-4 text-primary-700" />
                  <p className="font-semibold text-gray-900 text-sm">{title}</p>
                </div>
                <ol className="space-y-1">
                  {steps.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-600">
                      <span className="text-primary-700 font-bold flex-shrink-0">{i + 1}.</span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

        {/* Protect data */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">ثانياً — احمِ بياناتك</h2>
          <div className="space-y-3">
            {[
              { icon: Lock, title: 'أوقف الجهاز عن بُعد', desc: 'من Find My أو Find My Device — اقفل الجهاز بكلمة مرور جديدة وأضف رسالة "تواصل معي".' },
              { icon: Bell, title: 'غيّر كلمات المرور الحساسة', desc: 'البريد الإلكتروني، التطبيقات البنكية، واتساب — غيّرها الآن من جهاز آخر.' },
              { icon: AlertTriangle, title: 'أبلّغ البنك إذا لزم', desc: 'إذا كنت تستخدم بطاقة بنكية مرتبطة بالهاتف، أخبر البنك باحتمال الفقدان.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 bg-white border border-gray-200 rounded-xl p-4">
                <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary-700" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm mb-0.5">{title}</p>
                  <p className="text-gray-500 text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Report */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">ثالثاً — سجّل بلاغ "مفقود" في CheckMyDevice</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            حتى لو لم يُسرق هاتفك، تسجيله كـ "مفقود" في CheckMyDevice مفيد جداً:
          </p>
          <div className="space-y-2 mb-4">
            {[
              'لو وجده شخص ما وحاول بيعه — سيظهر له تحذير عند الفحص',
              'ستتلقى إشعاراً فور بحث أي شخص عن الجهاز',
              'من وجده قد يتواصل معك عبر بيانات التواصل في البلاغ',
            ].map((item, i) => (
              <div key={i} className="flex gap-2 items-start">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-600 text-sm">{item}</p>
              </div>
            ))}
          </div>
          <Link
            to="/reports/new"
            className="inline-block bg-white text-primary-700 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-50 transition-colors border border-primary-200"
          >
            سجّل بلاغ مفقود الآن
          </Link>
        </section>

        {/* If found */}
        <section className="mb-2">
          <h2 className="text-xl font-bold text-gray-900 mb-3">إذا عثرت على هاتفك</h2>
          <div className="space-y-2">
            {[
              'ألغِ البلاغ من صفحة "بلاغاتي" — زر "إلغاء البلاغ (تم الاسترداد)"',
              'تحقق من أنه لم يُستخدم لتحميل تطبيقات أو الوصول لحساباتك',
              'راجع سجل المكالمات والرسائل لأي نشاط مشبوه',
              'غيّر كلمة مرور الشاشة لأمان أكثر',
            ].map((item, i) => (
              <div key={i} className="flex gap-2 items-start">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-600 text-sm">{item}</p>
              </div>
            ))}
          </div>
        </section>

      </BlogLayout>
    </>
  );
}
