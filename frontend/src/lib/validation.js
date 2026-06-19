/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║             SHARED VALIDATION SCHEMAS (Zod)                 ║
 * ║                                                              ║
 * ║  Used with: React Hook Form + @hookform/resolvers/zod        ║
 * ║                                                              ║
 * ║  Why Zod?                                                    ║
 * ║  ✓ Type-safe schemas in JavaScript                          ║
 * ║  ✓ Works perfectly with React Hook Form                     ║
 * ║  ✓ Same schema can be reused on backend (Node.js)           ║
 * ║  ✓ Arabic error messages built-in                           ║
 * ║  ✓ Password strength, email format, phone validation        ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { z } from 'zod';

// ─── Email ────────────────────────────────────────────────────────
const emailField = z
  .string()
  .min(1, 'البريد الإلكتروني مطلوب')
  .email('صيغة البريد الإلكتروني غير صحيحة');

// ─── Password strength ────────────────────────────────────────────
const passwordField = z
  .string()
  .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
  .regex(/[a-zA-Z\u0600-\u06FF]/, 'يجب أن تحتوي على حرف واحد على الأقل')
  .regex(/[0-9]/, 'يجب أن تحتوي على رقم واحد على الأقل');

// ─── Phone (E.164 optional) ───────────────────────────────────────
const phoneFieldOptional = z
  .string()
  .regex(/^\+?[0-9\s\-]{7,20}$/, 'رقم الهاتف غير صحيح')
  .optional()
  .or(z.literal(''));

// ─── Register ─────────────────────────────────────────────────────
export const registerSchema = z
  .object({
    full_name: z
      .string()
      .min(2, 'الاسم يجب أن يكون حرفين على الأقل')
      .max(100, 'الاسم طويل جداً')
      .optional()
      .or(z.literal('')),
    email:            emailField,
    password:         passwordField,
    confirm_password: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
    phone:            phoneFieldOptional,
    country_code:     z.string().length(2).optional(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: 'كلمتا المرور غير متطابقتين',
    path:    ['confirm_password'],
  });

// ─── Login ────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email:    emailField,
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

// ─── Forgot Password ──────────────────────────────────────────────
export const forgotPasswordSchema = z.object({
  email: emailField,
});

// ─── Reset Password ───────────────────────────────────────────────
export const resetPasswordSchema = z
  .object({
    password:         passwordField,
    confirm_password: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: 'كلمتا المرور غير متطابقتين',
    path:    ['confirm_password'],
  });

// ─── Change Password (profile) ────────────────────────────────────
export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
    new_password:     passwordField,
    confirm_password: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: 'كلمتا المرور غير متطابقتين',
    path:    ['confirm_password'],
  })
  .refine((d) => d.current_password !== d.new_password, {
    message: 'كلمة المرور الجديدة يجب أن تختلف عن الحالية',
    path:    ['new_password'],
  });

// ─── Password strength meter helper ──────────────────────────────
export function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };

  let score = 0;
  const checks = {
    length:    password.length >= 8,
    letter:    /[a-zA-Z\u0600-\u06FF]/.test(password),
    number:    /[0-9]/.test(password),
    long:      password.length >= 12,
  };

  Object.values(checks).forEach(v => v && score++);

  if (score <= 1) return { score, label: 'ضعيفة جداً', color: 'bg-red-500',    percent: 20  };
  if (score === 2) return { score, label: 'ضعيفة',      color: 'bg-orange-500', percent: 40  };
  if (score === 3) return { score, label: 'متوسطة',     color: 'bg-yellow-500', percent: 60  };
  if (score === 4) return { score, label: 'جيدة',       color: 'bg-blue-500',   percent: 80  };
  return              { score, label: 'قوية جداً',   color: 'bg-green-500',  percent: 100 };
}

// ─── Contact form ─────────────────────────────────────────────────
export const contactSchema = z.object({
  name:    z.string().min(2, 'الاسم مطلوب'),
  email:   emailField,
  subject: z.string().min(5, 'الموضوع مطلوب').max(200),
  message: z.string().min(20, 'الرسالة يجب أن تكون 20 حرفاً على الأقل').max(2000),
});
