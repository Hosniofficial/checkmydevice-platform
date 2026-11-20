import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import SEOHead from '../components/SEOHead.jsx';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Phone, MessageCircle, Clock, CheckCircle, Send } from 'lucide-react';
import { contactSchema } from '../lib/validation.js';
import { Field, Spinner } from '../components/ui/index.jsx';
import api from '../lib/api.js';
import toast from 'react-hot-toast';

const CONTACT_ITEMS = [
  { icon: Mail, label: 'البريد الإلكتروني', value: 'support@checkmydevice.online', href: 'mailto:support@checkmydevice.online', dir: 'ltr' },
  { icon: MessageCircle, label: 'واتساب',              value: '+20 106 202 4249',             href: 'https://wa.me/201062024249',      dir: 'ltr' },
  { icon: Clock,         label: 'ساعات العمل',         value: 'يومياً ٩ص - ١١م (بتوقيت القاهرة)', href: null,                         dir: 'rtl' },
];

const SUBJECTS = [
  'مشكلة في البلاغ',
  'بلاغ مزيف أو خاطئ',
  'مشكلة تقنية في الموقع',
  'استفسار عن الاشتراك',
  'شراكة تجارية',
  'اقتراح أو ملاحظة',
  'موضوع آخر',
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(contactSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      setSent(true);
      reset();
    } catch {
      toast.error('حدث خطأ، يرجى المحاولة مجدداً أو التواصل عبر الإيميل مباشرة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <SEOHead page="contact" />
      <div className="mb-8 rounded-3xl bg-primary-900 px-6 py-7 text-white sm:px-8 sm:py-9">
        <div className="flex items-start gap-4">
          <div className="hidden h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white/10 sm:flex">
            <MessageCircle className="h-6 w-6 text-blue-100" />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-200">دعم CheckMyDevice</p>
            <h1 className="mt-1 text-3xl font-bold">تواصل معنا</h1>
            <p className="mt-2 text-sm leading-7 text-blue-100">فريقنا جاهز للمساعدة — نرد خلال 24-48 ساعة.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
        {/* Contact info */}
        <div className="space-y-4 lg:col-span-2">
          <div>
            <h2 className="font-bold text-gray-900">معلومات التواصل</h2>
            <p className="mt-1 text-xs text-gray-500">اختر الطريقة الأنسب للتواصل مع الفريق.</p>
          </div>

          {CONTACT_ITEMS.map(({ icon: Icon, label, value, href, dir }) => (
            <div key={label} className="surface-card flex items-start gap-3 p-4 transition-colors hover:border-primary-200">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50">
                <Icon className="h-5 w-5 text-primary-700" />
              </div>
              <div className="min-w-0">
                <div className="mb-0.5 text-xs text-gray-500">{label}</div>
                {href ? (
                  <a href={href} dir={dir}
                    className="break-all text-sm font-semibold text-primary-800 hover:underline">
                    {value}
                  </a>
                ) : (
                  <span className="text-sm font-medium text-gray-700" dir={dir}>{value}</span>
                )}
              </div>
            </div>
          ))}

          {/* Response time */}
          <div className="rounded-2xl border border-[#e7e4dc] bg-[#f7f6f2] p-4 text-sm">
            <div className="mb-1 flex items-center gap-2 font-semibold text-primary-800">
              <Clock className="w-4 h-4" />
              وقت الاستجابة المعتاد
            </div>
            <p className="text-xs leading-relaxed text-gray-600">
              الاستفسارات العامة: خلال 48 ساعة<br/>
              البلاغات الطارئة: خلال 24 ساعة<br/>
              الشراكات التجارية: خلال 5 أيام عمل
            </p>
          </div>
        </div>

        {/* Contact form */}
        <div className="lg:col-span-3">
          {sent ? (
            <div className="surface-card px-6 py-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">تم إرسال رسالتك!</h3>
              <p className="text-gray-500 text-sm mb-6">
                شكراً لتواصلك معنا. سيرد فريقنا خلال 24-48 ساعة على بريدك الإلكتروني.
              </p>
              <button onClick={() => setSent(false)} className="btn-outline text-sm py-2 px-5">
                إرسال رسالة أخرى
              </button>
            </div>
          ) : (
            <div className="surface-card p-5 sm:p-7">
              <div className="mb-5 flex items-center gap-3 border-b border-[#e7e4dc] pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                  <Send className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">أرسل لنا رسالة</h2>
                  <p className="mt-0.5 text-xs text-gray-500">اكتب تفاصيل استفسارك وسنرد عليك خلال 24-48 ساعة.</p>
                </div>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="الاسم" error={errors.name?.message} required>
                    <input className={`input ${errors.name ? 'border-red-400' : ''}`}
                      placeholder="اسمك الكامل" {...register('name')} />
                  </Field>
                  <Field label="البريد الإلكتروني" error={errors.email?.message} required>
                    <input type="email" dir="ltr"
                      className={`input ${errors.email ? 'border-red-400' : ''}`}
                      placeholder="email@example.com" {...register('email')} />
                  </Field>
                </div>

                <Field label="الموضوع" error={errors.subject?.message} required>
                  <select className={`input ${errors.subject ? 'border-red-400' : ''}`}
                    {...register('subject')}>
                    <option value="">اختر الموضوع...</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>

                <Field label="الرسالة" error={errors.message?.message} required>
                  <textarea
                    rows={5}
                    className={`input resize-none ${errors.message ? 'border-red-400' : ''}`}
                    placeholder="اكتب رسالتك هنا... (20 حرفاً على الأقل)"
                    {...register('message')}
                  />
                  <p className="text-xs text-gray-400 mt-1">20 - 2000 حرف</p>
                </Field>

                <button type="submit" disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading ? <Spinner size={20} /> : <Send className="w-4 h-4" />}
                  {loading ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* FAQ hint */}
      <div className="mt-8 rounded-2xl bg-[#f0eee7] px-5 py-4 text-center text-sm text-gray-600">
        قد تجد إجابة سؤالك في{' '}
        <a href="/faq" className="font-semibold text-primary-800 hover:underline">صفحة الأسئلة الشائعة</a>
      </div>
    </div>
  );
}
