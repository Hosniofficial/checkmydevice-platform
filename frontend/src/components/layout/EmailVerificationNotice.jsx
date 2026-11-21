import React, { useState } from 'react';
import { Mail, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api.js';
import { useAuthStore } from '../../store/auth.store.js';

export default function EmailVerificationNotice() {
  const user = useAuthStore(state => state.user);
  const [sending, setSending] = useState(false);

  if (!user || user.email_verified !== false) return null;

  const resendVerification = async () => {
    setSending(true);
    try {
      const { data } = await api.post('/auth/resend-verification');
      toast.success(data.data?.message_ar || 'تم إرسال رابط التفعيل إلى بريدك الإلكتروني.');
    } catch (error) {
      toast.error(error.response?.data?.error?.message_ar || 'تعذر إرسال رابط التفعيل. حاول مرة أخرى.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pt-4">
      <section
        role="status"
        aria-live="polite"
        className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-start gap-3">
          <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-700" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold">حسابك يعمل، لكن بريدك الإلكتروني لم يُفعّل بعد.</p>
            <p className="mt-1 text-xs leading-5 text-amber-800">
              فعّل بريدك للمساعدة في حماية حسابك واستعادة الوصول إليه عند الحاجة.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={resendVerification}
          disabled={sending}
          className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-900 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          {sending ? 'جارٍ الإرسال...' : 'إعادة إرسال رابط التفعيل'}
        </button>
      </section>
    </div>
  );
}
