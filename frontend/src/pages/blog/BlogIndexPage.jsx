import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, ArrowLeft } from 'lucide-react';
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
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <SEOHead page="blog" />

      <div className="text-center mb-12">
        <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-7 h-7 text-primary-700" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">المدونة والأدلة</h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          دليلك الكامل لحماية جهازك، التحقق قبل الشراء، والتصرف الصح عند السرقة أو الضياع.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {ARTICLES.map(article => (
          <Link
            key={article.to}
            to={article.to}
            className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-primary-200 transition-all group"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full">
                {article.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="w-3 h-3" /> {article.time} دقائق
              </span>
            </div>
            <h2 className="font-bold text-gray-900 mb-2 leading-snug group-hover:text-primary-700 transition-colors">
              {article.title}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              {article.desc}
            </p>
            <span className="flex items-center gap-1 text-sm font-medium text-primary-700">
              اقرأ المقال <ArrowLeft className="w-3.5 h-3.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
