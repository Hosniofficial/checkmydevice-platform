import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Search, HelpCircle, X } from 'lucide-react';
import SEOHead from '../components/SEOHead.jsx';

const FAQS = [
  {
    category: 'البحث والفحص',
    items: [
      {
        q: 'كيف أعرف رقم IMEI الخاص بهاتفي؟',
        a: 'اتصل بـ *#06# من أي هاتف وسيظهر رقم IMEI فوراً. يمكنك أيضاً إيجاده في إعدادات الهاتف ← عن الهاتف ← معلومات الجهاز، أو مكتوباً على العلبة وخلف الجهاز.',
      },
      {
        q: 'هل نتيجة "نظيف" تعني أن الجهاز آمن 100%؟',
        a: 'لا. غياب الجهاز من قاعدتنا يعني فقط أنه لم يُبلَّغ عنه لدينا. قاعدتنا مجتمعية وليست شاملة لجميع الأجهزة المسروقة في العالم. استخدمها كمرجع إضافي فقط وليس كمصدر وحيد للتحقق.',
      },
      {
        q: 'كم عدد عمليات البحث المجانية؟',
        a: 'الزوار غير المسجلين: 5 عمليات يومياً لكل IP. المستخدمون المسجلون مجاناً: 20 عملية يومياً. التجار والمشتركون في الخطط المدفوعة: حسب الخطة.',
      },
      {
        q: 'هل يمكنني البحث بالرقم التسلسلي (Serial Number) بدلاً من IMEI؟',
        a: 'نعم. يمكنك البحث بالرقم التسلسلي باختيار "الرقم التسلسلي" في قسم البحث. هذا مفيد للاب توب والتابلت التي لا تحتوي على IMEI دائماً.',
      },
    ],
  },
  {
    category: 'الإبلاغ عن جهاز',
    items: [
      {
        q: 'كم يستغرق مراجعة البلاغ؟',
        a: 'نراجع البلاغات يدوياً خلال 24-48 ساعة. في الفترات المزدحمة قد يمتد الوقت حتى 72 ساعة. ستتلقى إشعاراً بالقبول أو الرفض على بريدك الإلكتروني.',
      },
      {
        q: 'ما المستندات المطلوبة للإبلاغ؟',
        a: 'نطلب صورة واحدة على الأقل كإثبات ملكية: صورة علبة الجهاز (تظهر IMEI والموديل)، أو فاتورة الشراء، أو صورتك مع الجهاز وبطاقة هويتك. كلما زادت الأدلة زادت سرعة الموافقة.',
      },
      {
        q: 'لماذا رُفض بلاغي؟',
        a: 'أسباب الرفض الشائعة: الصور غير واضحة أو لا تُثبت الملكية، رقم IMEI غير صحيح، تعارض البيانات المقدمة. يمكنك إعادة رفع البلاغ بمستندات أوضح.',
      },
      {
        q: 'ماذا يحدث عند البحث عن جهازي المسروق؟',
        a: 'عند بحث أي شخص عن IMEI جهازك المُبلَّغ عنه، يتلقى تحذيراً فورياً بأن الجهاز مسروق. في نفس الوقت يصلك إشعار عبر البريد الإلكتروني يُخبرك بوقت البحث والدولة التي تم منها.',
      },
      {
        q: 'كيف أُلغي البلاغ عند استرداد جهازي؟',
        a: 'اذهب إلى "بلاغاتي" في حسابك، اختر البلاغ واضغط "إلغاء البلاغ". يُحذف الجهاز من القائمة النشطة فوراً لكن نحتفظ بالسجل الداخلي لأغراض التدقيق.',
      },
    ],
  },
  {
    category: 'الحساب والاشتراك',
    items: [
      {
        q: 'هل التسجيل إلزامي للبحث؟',
        a: 'لا. يمكن البحث بدون تسجيل (حتى 5 عمليات يومياً). التسجيل مجاني ويتيح لك 20 عملية يومياً وإمكانية الإبلاغ عن جهازك.',
      },
      {
        q: 'لم أتلقَّ رسالة التفعيل، ماذا أفعل؟',
        a: 'أولاً تحقق من مجلد Spam أو Junk. إذا لم تجدها، انتظر 5 دقائق وأعد المحاولة. يمكنك طلب إعادة إرسال الرسالة من صفحة تسجيل الدخول. تأكد أنك كتبت البريد الإلكتروني صحيحاً.',
      },
      {
        q: 'هل يمكنني إلغاء الاشتراك في أي وقت؟',
        a: 'نعم. يمكن إلغاء الاشتراك المدفوع في أي وقت من صفحة الاشتراك في حسابك. ستحتفظ بمميزات الخطة حتى نهاية الفترة المدفوعة.',
      },
      {
        q: 'كيف أحذف حسابي؟',
        a: 'اذهب إلى الملف الشخصي ← إعدادات الحساب ← حذف الحساب. سيُحذف حسابك نهائياً خلال 30 يوماً. ملاحظة: البلاغات المقبولة تبقى في القاعدة بصورة مجهولة الهوية.',
      },
    ],
  },
  {
    category: 'الأمان والخصوصية',
    items: [
      {
        q: 'هل بيانات جهازي آمنة عندكم؟',
        a: 'نعم. رقم IMEI يُعرض مُقنَّعاً للزوار (آخر 4 أرقام فقط). بيانات التواصل مشفرة في قاعدة البيانات. كل اتصال يمر عبر HTTPS. راجع سياسة الخصوصية للتفاصيل الكاملة.',
      },
      {
        q: 'هل تبيعون بيانات المستخدمين؟',
        a: 'لا بتاتاً. لا نبيع ولا نؤجر بيانات المستخدمين لأي طرف ثالث. نستخدم البيانات فقط لتشغيل وتحسين الخدمة.',
      },
    ],
  },
];

export default function FAQPage() {
  const [open, setOpen]     = useState({});
  const [search, setSearch] = useState('');

  const toggle = (key) => setOpen(p => ({ ...p, [key]: !p[key] }));

  const filtered = FAQS.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      !search ||
      item.q.toLowerCase().includes(search.toLowerCase()) ||
      item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(cat => cat.items.length > 0);
  const resultCount = filtered.reduce((count, cat) => count + cat.items.length, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <SEOHead page="faq" />
      <div className="mb-7 rounded-3xl bg-primary-900 px-6 py-7 text-white sm:px-8 sm:py-9">
        <div className="flex items-start gap-4">
          <div className="hidden h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white/10 sm:flex">
            <HelpCircle className="h-6 w-6 text-blue-100" />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-200">مركز المساعدة</p>
            <h1 className="mt-1 text-3xl font-bold">الأسئلة الشائعة</h1>
            <p className="mt-2 text-sm leading-7 text-blue-100">إجابات واضحة حول البحث والإبلاغ والحساب والخصوصية.</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="surface-card mb-8 p-4 sm:p-5">
        <label htmlFor="faq-search" className="mb-2 block text-sm font-semibold text-gray-800">كيف يمكننا مساعدتك؟</label>
        <div className="relative">
          <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            id="faq-search"
            type="text"
            aria-label="ابحث في الأسئلة الشائعة"
            className="input pr-12 text-base"
            placeholder="اكتب كلمة أو سؤالاً..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} aria-label="مسح البحث"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-[#f0eee7] hover:text-gray-700">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-gray-500">{resultCount} إجابة متاحة</p>
      </div>

      {/* FAQs */}
      {filtered.length === 0 ? (
        <div className="surface-card px-5 py-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7f6f2] text-gray-400">
            <HelpCircle className="h-6 w-6" />
          </div>
          <p className="font-semibold text-gray-800">لم نعثر على إجابات مطابقة</p>
          <p className="mt-1 text-sm text-gray-500">جرّب كلمة بحث أخرى أو تواصل مع فريقنا.</p>
          <Link to="/contact" className="btn-outline mt-4 inline-flex px-4 py-2 text-sm">
            تواصل معنا
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {filtered.map((cat, catIndex) => (
            <div key={cat.category}>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-primary-900">
                <span className="inline-block h-5 w-1 rounded-full bg-accent-500" />
                {cat.category}
                <span className="rounded-full bg-[#f0eee7] px-2 py-0.5 text-xs font-medium text-gray-500">{cat.items.length}</span>
              </h2>
              <div className="space-y-2">
                {cat.items.map((item, i) => {
                  const key  = `${cat.category}-${item.q}`;
                  const answerId = `faq-answer-${catIndex}-${i}`;
                  const isOpen = open[key];
                  return (
                    <div key={key}
                      className={`surface-card overflow-hidden transition-colors
                        ${isOpen ? 'border-primary-300' : 'hover:border-gray-300'}`}>
                      <button
                        type="button"
                        onClick={() => toggle(key)}
                        aria-expanded={Boolean(isOpen)}
                        aria-controls={answerId}
                        className="flex min-h-14 w-full items-center justify-between px-5 py-4 text-right transition-colors hover:bg-[#f7f6f2]"
                      >
                        <span className="font-medium text-gray-900 text-sm leading-relaxed pr-3">{item.q}</span>
                        {isOpen
                          ? <ChevronUp className="w-5 h-5 text-primary-700 flex-shrink-0" />
                          : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                      </button>
                      {isOpen && (
                        <div id={answerId} className="border-t border-[#e7e4dc] bg-[#f7f6f2] px-5 pb-4">
                          <p className="text-gray-600 text-sm leading-loose pt-3">{item.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Still have questions */}
      <div className="surface-card mt-12 bg-[#f0eee7] p-6 text-center sm:p-8">
        <HelpCircle className="mx-auto mb-3 h-10 w-10 text-primary-700" />
        <h3 className="font-bold text-gray-800 mb-2">لم تجد إجابة سؤالك؟</h3>
        <p className="text-gray-500 text-sm mb-5">فريقنا يرد خلال 24-48 ساعة</p>
        <Link to="/contact" className="btn-primary inline-block text-sm py-2 px-6">
          تواصل معنا
        </Link>
      </div>
    </div>
  );
}
