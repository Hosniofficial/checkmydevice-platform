import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, Search } from 'lucide-react';

/**
 * Shared layout for all blog/SEO article pages.
 * Provides a consistent editorial header, reading surface, CTA, and related links.
 */
export default function BlogLayout({ meta, children }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <nav aria-label="مسار التنقل" className="mb-6">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500">
          <li><Link to="/" className="transition-colors hover:text-primary-700">الرئيسية</Link></li>
          <li aria-hidden="true" className="text-gray-300">/</li>
          <li><Link to="/blog" className="transition-colors hover:text-primary-700">المدونة</Link></li>
          <li aria-hidden="true" className="text-gray-300">/</li>
          <li aria-current="page" className="max-w-full truncate text-gray-700">{meta.breadcrumb}</li>
        </ol>
      </nav>

      <header className="mb-6 rounded-3xl border border-[#e7e4dc] bg-[#fffefa] px-5 py-7 shadow-sm sm:px-8 sm:py-9">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-800">
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            {meta.category}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f7f6f2] px-3 py-1.5 text-xs text-gray-600">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {meta.readTime} دقائق للقراءة
          </span>
        </div>
        <h1 id="article-title" className="mb-4 max-w-3xl text-3xl font-bold leading-tight text-primary-900 sm:text-4xl sm:leading-tight">
          {meta.title}
        </h1>
        <p className="max-w-3xl border-r-2 border-accent-500 pr-4 text-base leading-8 text-gray-600 sm:text-lg">
          {meta.description}
        </p>
      </header>

      <article aria-labelledby="article-title" className="surface-card prose-article p-5 sm:p-8 lg:p-10">
        {children}
      </article>

      <section aria-labelledby="article-search-cta-title" className="mt-8 rounded-3xl border border-[#e7e4dc] bg-[#f0eee7] px-5 py-7 text-center sm:px-8 sm:py-9">
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-primary-700">
          <Search className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 id="article-search-cta-title" className="mb-2 text-xl font-bold text-primary-900">
          راجع البلاغات المتاحة لجهازك
        </h2>
        <p className="mx-auto mb-5 max-w-xl text-sm leading-7 text-gray-600">
          استخدم رقم IMEI للاطلاع على المعلومات المتاحة قبل إتمام الشراء.
        </p>
        <Link to="/search" className="btn-primary inline-flex items-center gap-2">
          انتقل إلى البحث
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>

      {meta.related?.length > 0 && (
        <section aria-labelledby="related-articles-title" className="mt-8">
          <h2 id="related-articles-title" className="mb-4 text-lg font-bold text-gray-900">مقالات ذات صلة</h2>
          <div className="grid gap-3 sm:grid-cols-2">
          {meta.related?.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="surface-card group flex min-h-20 items-center justify-between gap-3 p-4 transition-colors hover:border-primary-300 hover:bg-primary-50"
            >
              <span className="text-sm font-medium leading-6 text-gray-800 transition-colors group-hover:text-primary-800">
                {link.title}
              </span>
              <ArrowLeft className="h-4 w-4 flex-shrink-0 text-gray-400 transition-transform group-hover:-translate-x-1 group-hover:text-primary-700" aria-hidden="true" />
            </Link>
          ))}
          </div>
        </section>
      )}
    </div>
  );
}
