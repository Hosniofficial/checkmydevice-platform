import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Search } from 'lucide-react';

/**
 * Shared layout for all blog/SEO article pages.
 * Provides consistent typography, CTA, and internal linking.
 */
export default function BlogLayout({ meta, children }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link to="/" className="hover:text-primary-700 transition-colors">الرئيسية</Link>
        <span>/</span>
        <Link to="/blog" className="hover:text-primary-700 transition-colors">المدونة</Link>
        <span>/</span>
        <span className="text-gray-600 truncate">{meta.breadcrumb}</span>
      </nav>

      {/* Article header */}
      <header className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-semibold bg-primary-50 text-primary-700 px-3 py-1 rounded-full">
            {meta.category}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" /> {meta.readTime} دقائق للقراءة
          </span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-4">
          {meta.title}
        </h1>
        <p className="text-lg text-gray-500 leading-relaxed">
          {meta.description}
        </p>
      </header>

      {/* Article body */}
      <article className="prose-article">
        {children}
      </article>

      {/* CTA — check device */}
      <div className="mt-12 bg-gradient-to-l from-primary-700 to-blue-900 rounded-2xl p-7 text-white text-center">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Search className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl font-bold mb-2">فحص جهازك الآن — مجاناً</h2>
        <p className="text-blue-200 text-sm mb-5">
          أدخل رقم IMEI واعرف فوراً إذا كان الجهاز مسروقاً أو مفقوداً
        </p>
        <Link
          to="/search"
          className="inline-flex items-center gap-2 bg-yellow-400 text-gray-900 font-bold px-7 py-3 rounded-xl hover:bg-yellow-300 transition-colors"
        >
          ابدأ الفحص المجاني
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>

      {/* Related articles */}
      <div className="mt-10">
        <h3 className="font-bold text-gray-900 mb-4">مقالات ذات صلة</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {meta.related?.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="bg-gray-50 hover:bg-primary-50 border border-gray-200 hover:border-primary-200 rounded-xl p-4 transition-all group"
            >
              <p className="text-sm font-medium text-gray-900 group-hover:text-primary-700 transition-colors leading-snug">
                {link.title}
              </p>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
