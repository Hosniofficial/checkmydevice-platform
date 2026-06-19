import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Phone, MessageCircle, Clock, CheckCircle, Send } from 'lucide-react';
import { contactSchema } from '../lib/validation.js';
import { Field, Spinner } from '../components/ui/index.jsx';
import api from '../lib/api.js';
import toast from 'react-hot-toast';

const CONTACT_ITEMS = [
  { icon: Mail,          label: 'البريد الإلكتروني',  value: 'support@checkmydevice.com',   href: 'mailto:support@checkmydevice.com', dir: 'ltr' },
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
      // In production: POST /api/contact
      // For now: simulate API call
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
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">تواصل معنا</h1>
        <p className="text-gray-500">فريقنا جاهز للمساعدة — نرد خلال 24-48 ساعة</p>
      </div>

      <div className="grid md:grid-cols-5 gap-8">
        {/* Contact info */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="font-bold text-gray-900 mb-4">معلومات التواصل</h2>

          {CONTACT_ITEMS.map(({ icon: Icon, label, value, href, dir }) => (
            <div key={label} className="card flex items-start gap-4 p-4">
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-primary-700" />
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-0.5">{label}</div>
                {href ? (
                  <a href={href} dir={dir}
                    className="text-sm font-medium text-primary-700 hover:underline break-all">
                    {value}
                  </a>
                ) : (
                  <span className="text-sm font-medium text-gray-700" dir={dir}>{value}</span>
                )}
              </div>
            </div>
          ))}

          {/* Response time */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-sm">
            <div className="flex items-center gap-2 text-green-800 font-medium mb-1">
              <Clock className="w-4 h-4" />
              وقت الاستجابة المعتاد
            </div>
            <p className="text-green-700 text-xs leading-relaxed">
              الاستفسارات العامة: خلال 48 ساعة<br/>
              البلاغات الطارئة: خلال 24 ساعة<br/>
              الشراكات التجارية: خلال 5 أيام عمل
            </p>
          </div>
        </div>

        {/* Contact form */}
        <div className="md:col-span-3">
          {sent ? (
            <div className="card text-center py-12">
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
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-5">أرسل لنا رسالة</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="grid grid-cols-2 gap-4">
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
      <div className="mt-10 text-center text-sm text-gray-500">
        قد تجد إجابة سؤالك في{' '}
        <a href="/faq" className="text-primary-700 hover:underline">صفحة الأسئلة الشائعة</a>
      </div>
    </div>
  );
}
