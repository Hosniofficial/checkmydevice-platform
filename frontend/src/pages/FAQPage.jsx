import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Search, HelpCircle } from 'lucide-react';
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SEOHead page="faq" />
      <div className="text-center mb-10">
        <div className="w-14 h-14 bg-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">الأسئلة الشائعة</h1>
        <p className="text-gray-500">إجابات لأكثر الأسئلة شيوعاً</p>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          className="input pr-12 text-base"
          placeholder="ابحث في الأسئلة..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* FAQs */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>لا توجد نتائج لـ "{search}"</p>
          <Link to="/contact" className="text-primary-700 hover:underline text-sm mt-2 inline-block">
            هل لديك سؤال آخر؟ تواصل معنا
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {filtered.map((cat) => (
            <div key={cat.category}>
              <h2 className="font-bold text-primary-700 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                <span className="w-4 h-4 bg-primary-700 rounded-full inline-block" />
                {cat.category}
              </h2>
              <div className="space-y-2">
                {cat.items.map((item, i) => {
                  const key  = `${cat.category}-${i}`;
                  const isOpen = open[key];
                  return (
                    <div key={key}
                      className={`border rounded-2xl overflow-hidden transition-all duration-200 
                        ${isOpen ? 'border-primary-300 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                      <button
                        onClick={() => toggle(key)}
                        className="w-full flex items-center justify-between px-5 py-4 text-right bg-white hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900 text-sm leading-relaxed pr-3">{item.q}</span>
                        {isOpen
                          ? <ChevronUp className="w-5 h-5 text-primary-700 flex-shrink-0" />
                          : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4 bg-primary-50 border-t border-primary-100">
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
      <div className="mt-12 text-center bg-gray-50 rounded-2xl p-8">
        <HelpCircle className="w-10 h-10 text-gray-400 mx-auto mb-3" />
        <h3 className="font-bold text-gray-800 mb-2">لم تجد إجابة سؤالك؟</h3>
        <p className="text-gray-500 text-sm mb-5">فريقنا يرد خلال 24-48 ساعة</p>
        <Link to="/contact" className="btn-primary inline-block text-sm py-2 px-6">
          تواصل معنا
        </Link>
      </div>
    </div>
  );
}
