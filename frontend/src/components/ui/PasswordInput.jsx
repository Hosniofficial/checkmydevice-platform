import React, { useState } from 'react';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { getPasswordStrength } from '../../lib/validation.js';

/**
 * PasswordInput — حقل كلمة المرور مع:
 * - زر إظهار/إخفاء
 * - مقياس قوة كلمة المرور (اختياري)
 * - قائمة شروط القوة
 */
export default function PasswordInput({
  register,       // من React Hook Form
  name = 'password',
  label = 'كلمة المرور',
  placeholder = 'أدخل كلمة المرور',
  error,
  showStrength = false,
  watch,          // من React Hook Form (لو showStrength=true)
  required = false,
}) {
  const [show, setShow] = useState(false);
  const value    = watch ? watch(name) : '';
  const strength = showStrength ? getPasswordStrength(value) : null;

  const checks = showStrength ? [
    { label: '٨ أحرف على الأقل',         pass: value?.length >= 8 },
    { label: 'حرف واحد على الأقل',        pass: /[a-zA-Z\u0600-\u06FF]/.test(value || '') },
    { label: 'رقم واحد على الأقل',        pass: /[0-9]/.test(value || '') },
  ] : [];

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          className={`input pl-10 ${error ? 'border-red-400 focus:ring-red-400' : ''}`}
          {...(register ? register(name) : {})}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {error && (
        <p className="text-red-500 text-xs flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}

      {/* Strength meter */}
      {showStrength && value && (
        <div className="space-y-2 pt-1">
          {/* Bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${strength.color}`}
                style={{ width: `${strength.percent}%` }}
              />
            </div>
            <span className={`text-xs font-medium shrink-0 ${
              strength.score <= 2 ? 'text-red-500' :
              strength.score === 3 ? 'text-yellow-600' :
              strength.score === 4 ? 'text-blue-600' : 'text-green-600'
            }`}>
              {strength.label}
            </span>
          </div>

          {/* Checklist */}
          <div className="grid grid-cols-2 gap-1">
            {checks.map(({ label: cl, pass }) => (
              <div key={cl} className={`flex items-center gap-1.5 text-xs transition-colors ${pass ? 'text-green-600' : 'text-gray-400'}`}>
                <ShieldCheck className={`w-3 h-3 shrink-0 ${pass ? 'text-green-500' : 'text-gray-300'}`} />
                {cl}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
