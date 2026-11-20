import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, ArrowLeft, Search } from 'lucide-react';
import SEOHead from '../../components/SEOHead.jsx';

const ARTICLES = [
  {
    to:       '/blog/free-imei-check',
    title:    'فحص IMEI مجاني — تحقق من جهازك في ثوانٍ',
    desc:     'ما هو رقم IMEI؟ كيف تجده؟ ولماذا هو مفتاح التحقق من أي جهاز قبل الشراء.',
    category: 'دليل عملي',
    time:     4,
  },
  {
    to:       '/blog/how-to-check-stolen-phone',
    title:    'كيف أعرف أن الهاتف مسروق؟ — 7 طرق للتحقق',
    desc:     'علامات تدل على أن الهاتف المستعمل مسروق، وكيف تحمي نفسك قبل الشراء.',
    category: 'نصائح الشراء',
    time:     5,
  },
  {
    to:       '/blog/what-to-do-if-phone-stolen',
    title:    'سُرق هاتفي — 8 خطوات يجب فعلها فوراً',
    desc:     'قفل الجهاز، إبلاغ الشرطة، تسجيل IMEI، وحماية بياناتك — كل خطوة موضحة.',
    category: 'طوارئ',
    time:     5,
  },
  {
    to:       '/blog/what-to-do-if-phone-lost',
    title:    'ضاع هاتفي — كيف أجده أو أحمي بياناتي؟',
    desc:     'تتبع الجهاز عن بُعد، قفل البيانات، والإبلاغ عنه في قاعدة البيانات.',
    category: 'طوارئ',
    time:     4,
  },
  {
    to:       '/blog/how-to-report-stolen-phone',
    title:    'كيف أبلغ عن هاتف مسروق؟ — دليل خطوة بخطوة',
    desc:     'سجّل بلاغاً رسمياً في CheckMyDevice وابدأ في حماية الآخرين من شراء جهازك.',
    category: 'دليل عملي',
    time:     3,
  },
];

export default function BlogIndexPage() {
  const [featured, ...articles] = ARTICLES;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <SEOHead page="blog" />

      <div className="mb-8 rounded-3xl bg-primary-900 px-6 py-7 text-white sm:px-8 sm:py-9">
        <p className="text-sm font-semibold text-blue-200">معرفة عملية لحماية جهازك</p>
        <div className="mt-2 flex items-start justify-between gap-5">
          <div>
            <h1 className="text-3xl font-bold">المدونة والأدلة</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-blue-100">
              دليلك للتحقق قبل الشراء والتصرف الصحيح عند فقدان الجهاز أو سرقته.
            </p>
          </div>
          <BookOpen className="hidden h-10 w-10 flex-shrink-0 text-blue-200 sm:block" />
        </div>
      </div>

      <Link to={featured.to}
        className="surface-card group mb-6 flex flex-col items-start justify-between gap-6 overflow-hidden border-primary-200 p-5 transition-colors hover:border-primary-400 sm:flex-row sm:items-center sm:p-7">
        <div className="max-w-2xl">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-800">ابدأ من هنا</span>
            <span className="text-xs text-gray-500">{featured.category}</span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3.5 w-3.5" /> {featured.time} دقائق
            </span>
          </div>
          <h2 className="text-xl font-bold leading-snug text-gray-900 transition-colors group-hover:text-primary-800 sm:text-2xl">
            {featured.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">{featured.desc}</p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary-800">
            اقرأ الدليل <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          </span>
        </div>
        <div className="hidden h-32 w-40 flex-shrink-0 items-center justify-center rounded-2xl bg-[#f7f6f2] text-primary-700 sm:flex">
          <BookOpen className="h-12 w-12" strokeWidth={1.5} />
        </div>
      </Link>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-bold text-gray-900">أدلة ومقالات أخرى</h2>
        <Link to="/search" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-800 hover:underline">
          <Search className="h-4 w-4" /> افحص جهازاً
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {articles.map(article => (
          <Link
            key={article.to}
            to={article.to}
            className="surface-card group flex h-full flex-col p-5 transition-colors hover:border-primary-300 sm:p-6"
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-full bg-[#f0eee7] px-2.5 py-1 text-xs font-semibold text-gray-700">
                {article.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3.5 w-3.5" /> {article.time} دقائق
              </span>
            </div>
            <h3 className="mb-2 font-bold leading-snug text-gray-900 transition-colors group-hover:text-primary-800">
              {article.title}
            </h3>
            <p className="mb-5 flex-1 text-sm leading-relaxed text-gray-600">
              {article.desc}
            </p>
            <span className="flex items-center gap-1 text-sm font-semibold text-primary-800">
              اقرأ المقال <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
