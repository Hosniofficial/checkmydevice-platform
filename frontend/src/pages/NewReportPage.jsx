import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Laptop, Tablet, Upload, Phone, ChevronLeft, ChevronRight,
         CheckCircle, X, Loader, Sparkles, AlertCircle, Info,
         ShieldAlert, HelpCircle, FileText, Send, ShieldCheck, Clock3, LockKeyhole } from 'lucide-react';
import { Field, Spinner } from '../components/ui/index.jsx';
import api from '../lib/api.js';
import toast from 'react-hot-toast';
import { COUNTRIES, getCountryName } from '../lib/countries.js';

const STEPS = ['بيانات الجهاز', 'إثبات الملكية', 'بيانات التواصل'];

const BRANDS = ['Apple','Samsung','Huawei','Honor','Xiaomi','Oppo','Vivo','OnePlus',
                'Motorola','Nokia','LG','Sony','Realme','Tecno','Infinix','أخرى'];

// ── Debounce hook ────────────────────────────────────────────────
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export default function NewReportPage() {
  const navigate = useNavigate();
  const fileRef  = useRef();

  const [step, setStep]         = useState(0);
  const [loading, setLoading]   = useState(false);
  const [files, setFiles]       = useState([]);
  const [done, setDone]         = useState(null);

  // IMEI auto-fill state
  const [imeiLookup, setImeiLookup] = useState({
    loading: false,
    found:   null,  // null | true | false
    source:  null,
    message: null,
  });

  const [form, setForm] = useState({
    imei: '', serial_number: '', device_type: 'phone', brand: '', model: '',
    model_code: '', color: '', storage: '', report_type: 'stolen',
    country_code: 'EG', city: '', incident_date: '', description: '',
    contact_whatsapp: '', contact_email: '', contact_phone: '',
    reward_offered: false, reward_amount: '', reward_currency: 'EGP',
  });

  const f  = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const sv = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // ── IMEI auto-fill ────────────────────────────────────────────
  const debouncedImei = useDebounce(form.imei, 700);

  useEffect(() => {
    const imei = debouncedImei.trim();
    if (imei.length < 14) {
      setImeiLookup({ loading: false, found: null, source: null, message: null });
      return;
    }
    if (!/^\d{14,16}$/.test(imei)) return;

    setImeiLookup(p => ({ ...p, loading: true }));

    api.get(`/reports/device-info/${imei}`)
      .then(({ data }) => {
        if (data.data.found) {
          const d = data.data.data;
          setForm(p => ({
            ...p,
            brand:       d.brand       || p.brand,
            model:       d.model       || p.model,
            model_code:  d.model_code  || p.model_code,
            device_type: d.device_type || p.device_type,
            storage:     d.storage     || p.storage,
            color:       d.color       || p.color,
          }));
          setImeiLookup({
            loading: false, found: true,
            source:  data.data.source,
            message: data.data.message_ar,
          });
        } else {
          setImeiLookup({
            loading: false, found: false,
            source: data.data.source,
            message: 'لم يتم التعرف على الجهاز — يمكنك ملء البيانات يدوياً',
          });
        }
      })
      .catch(() => {
        setImeiLookup({ loading: false, found: null, source: null, message: null });
      });
  }, [debouncedImei]);

  // ── Files — with client-side compression ─────────────────────
  const compressImage = (file) => new Promise((resolve) => {
    // Skip if already small (< 800KB)
    if (file.size < 800 * 1024) { resolve(file); return; }

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      // Max dimension 1200px
      const MAX = 1200;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
        else                { width  = Math.round(width  * MAX / height); height = MAX; }
      }
      canvas.width  = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => resolve(new File([blob], file.name, { type: 'image/jpeg' })),
        'image/jpeg', 0.82  // 82% quality — good balance
      );
    };
    img.src = url;
  });

  const handleFiles = async (e) => {
    const selected = Array.from(e.target.files || []);
    const compressed = await Promise.all(selected.map(compressImage));
    setFiles(prev => [...prev, ...compressed].slice(0, 5));
  };
  const removeFile = (i) => setFiles(prev => prev.filter((_, idx) => idx !== i));

  // ── Validation ─────────────────────────────────────────────────
  const validateStep = () => {
    if (step === 0) {
      if (!form.imei && !form.serial_number) return 'أدخل رقم IMEI أو الرقم التسلسلي';
      if (form.imei && !/^\d{14,16}$/.test(form.imei)) return 'رقم IMEI غير صحيح';
      if (!form.brand || !form.model) return 'أدخل الماركة والموديل';
    }
    if (step === 1 && files.length === 0) return 'ارفع صورة واحدة على الأقل كإثبات ملكية';
    return null;
  };

  const next = () => {
    const e = validateStep();
    if (e) return toast.error(e);
    setStep(s => s + 1);
  };

  const submit = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== '' && v !== false) fd.append(k, v); });
      files.forEach(f => fd.append('documents', f));
      const { data } = await api.post('/reports', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setDone(data.data);
    } catch (err) {
      toast.error(err.response?.data?.error?.message_ar || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  // ── Done screen ────────────────────────────────────────────────
  if (done) return (
    <div className="mx-auto flex min-h-[65vh] max-w-5xl items-center justify-center px-4 py-10">
      <div className="surface-card w-full max-w-xl px-5 py-10 text-center sm:px-8 sm:py-12">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-green-50">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <p className="text-sm font-semibold text-green-700">تم الإرسال بنجاح</p>
        <h2 className="mt-2 text-2xl font-bold text-gray-900">تم استلام بلاغك</h2>
        <p className="mt-2 text-sm leading-7 text-gray-500">{done.message_ar}</p>
        <div className="my-6 inline-block rounded-2xl border border-primary-100 bg-primary-50 px-6 py-4">
          <p className="mb-1 text-xs text-primary-600">رقم البلاغ</p>
          <p className="font-mono text-xl font-bold tracking-widest text-primary-800">{done.reference}</p>
        </div>
        <p className="mb-6 text-xs leading-6 text-gray-500">احتفظ بهذا الرقم للمتابعة — سيتم مراجعة بلاغك خلال 24-48 ساعة.</p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <button onClick={() => navigate('/reports')} className="btn-primary flex items-center justify-center gap-2">
            <FileText className="w-4 h-4" /> بلاغاتي
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn-outline">لوحة التحكم</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <div className="mb-7 flex flex-col gap-5 rounded-3xl border border-[#e7e4dc] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
            <ShieldAlert className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-accent-500">مساعدة المجتمع</p>
            <h1 className="mt-1 text-2xl font-bold text-primary-900">الإبلاغ عن جهاز</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">أكمل الخطوات لإبلاغ المجتمع عن جهاز مفقود أو مسروق، وتابع حالة البلاغ من حسابك.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start rounded-xl bg-[#f7f6f2] px-3 py-2 text-xs font-medium text-gray-600 sm:self-center">
          <Clock3 className="h-4 w-4 text-primary-700" aria-hidden="true" />
          مراجعة البلاغ خلال 24–48 ساعة
        </div>
      </div>

      {/* Step indicator */}
      <p className="mb-3 text-xs font-medium text-gray-500 sm:hidden" role="status">
        الخطوة {step + 1} من {STEPS.length} · {STEPS[step]}
      </p>
      <div
        className="mb-6 flex items-center rounded-2xl border border-[#e7e4dc] bg-white px-4 py-4 shadow-sm sm:mb-7 sm:px-6"
        role="progressbar"
        aria-label="تقدم تسجيل البلاغ"
        aria-valuemin={1}
        aria-valuemax={STEPS.length}
        aria-valuenow={step + 1}
      >
        {STEPS.map((label, i) => (
          <React.Fragment key={i}>
            <div className="flex min-w-0 flex-col items-center" aria-current={i === step ? 'step' : undefined}>
              <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all
                ${i < step  ? 'bg-green-500 text-white shadow-sm shadow-green-200'
                : i === step ? 'bg-primary-700 text-white shadow-sm shadow-primary-200 ring-4 ring-primary-100'
                :              'bg-gray-100 text-gray-400'}`}>
                {i < step ? <CheckCircle className="w-5 h-5" /> : i + 1}
              </div>
              <span className={`mt-1.5 hidden text-xs font-medium transition-colors sm:block
                ${i === step ? 'text-primary-700' : i < step ? 'text-green-600' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-500
                ${i < step ? 'bg-green-400' : 'bg-gray-200'}`}/>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(250px,0.8fr)] lg:gap-6">
      <section className="surface-card min-w-0 p-5 sm:p-7" aria-label={STEPS[step]}>

        {/* ══ STEP 0: Device Info ══════════════════════════════════ */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary-700"/> بيانات الجهاز
            </h2>

            {/* Device type */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">نوع الجهاز *</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    v: 'phone',
                    label: 'هاتف',
                    icon: Smartphone,
                  },
                  {
                    v: 'laptop',
                    label: 'لاب توب',
                    icon: Laptop,
                  },
                  {
                    v: 'tablet',
                    label: 'تابلت',
                    icon: Tablet,
                  },
                ].map(({ v, label, icon: Icon }) => {
                  const isSelected = form.device_type === v;
                  return (
                    <button key={v} type="button" onClick={() => sv('device_type', v)}
                      aria-pressed={isSelected}
                      className={`relative flex flex-col items-center gap-2 rounded-xl border px-2 py-3 font-medium transition-all
                        ${isSelected ? 'border-primary-300 bg-primary-50 text-primary-800' : 'border-[#e7e4dc] text-gray-600 hover:border-primary-200 hover:bg-primary-50/50'}`}>
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors
                        ${isSelected ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-400'}`}>
                        <Icon className="w-5 h-5" strokeWidth={1.8}/>
                      </div>
                      <span className="text-xs">{label}</span>
                      {isSelected && (
                        <div className="absolute top-1.5 left-1.5">
                          <CheckCircle className="w-3.5 h-3.5" fill="currentColor"/>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Report type */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">نوع البلاغ *</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  {
                    v: 'stolen',
                    label: 'مسروق',
                    desc: 'تم سرقة الجهاز',
                    icon: ShieldAlert,
                    active: 'border-red-500 bg-red-50 text-red-700 shadow-red-100',
                    inactive: 'border-gray-200 text-gray-500 hover:border-red-300 hover:bg-red-50/50',
                    iconActive: 'text-red-600 bg-red-100',
                    iconInactive: 'text-gray-400 bg-gray-100',
                    dot: 'bg-red-500',
                  },
                  {
                    v: 'lost',
                    label: 'مفقود',
                    desc: 'ضاع الجهاز',
                    icon: HelpCircle,
                    active: 'border-amber-500 bg-amber-50 text-amber-700 shadow-amber-100',
                    inactive: 'border-gray-200 text-gray-500 hover:border-amber-300 hover:bg-amber-50/50',
                    iconActive: 'text-amber-600 bg-amber-100',
                    iconInactive: 'text-gray-400 bg-gray-100',
                    dot: 'bg-amber-400',
                  },
                ].map(({ v, label, desc, icon: Icon, active, inactive, iconActive, iconInactive, dot }) => {
                  const isSelected = form.report_type === v;
                  return (
                    <button key={v} type="button" onClick={() => sv('report_type', v)}
                      className={`relative flex items-center gap-3 p-3 rounded-xl border-2 font-medium transition-all duration-200 shadow-sm text-right
                        ${isSelected ? `${active} shadow-md` : inactive}`}>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors
                        ${isSelected ? iconActive : iconInactive}`}>
                        <Icon className="w-5 h-5" strokeWidth={1.8}/>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${dot}`}/>
                          <span className="text-sm font-bold">{label}</span>
                        </div>
                        <p className={`text-xs mt-0.5 ${isSelected ? 'opacity-80' : 'text-gray-400'}`}>{desc}</p>
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-4 h-4 flex-shrink-0" strokeWidth={2.5}/>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── IMEI with Auto-fill ───────────────────────────── */}
            <Field label="رقم IMEI">
              <div className="relative">
                <input
                  className="imei-input input pl-10"
                  placeholder="أدخل رقم IMEI (14-16 رقم)"
                  maxLength={16}
                  value={form.imei}
                  onChange={f('imei')}
                />
                {/* Status icon */}
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  {imeiLookup.loading && <Loader className="w-4 h-4 text-gray-400 animate-spin"/>}
                  {!imeiLookup.loading && imeiLookup.found === true  && <CheckCircle className="w-4 h-4 text-green-500"/>}
                  {!imeiLookup.loading && imeiLookup.found === false && <AlertCircle className="w-4 h-4 text-amber-500"/>}
                </div>
              </div>

              {/* Auto-fill result banner */}
              {imeiLookup.found === true && (
                <div className="mt-2 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                  <Sparkles className="w-4 h-4 text-green-600 flex-shrink-0"/>
                  <p className="text-xs font-semibold text-green-800">{imeiLookup.message}</p>
                </div>
              )}
              {imeiLookup.found === false && (
                <div className="mt-2 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                  <Info className="w-4 h-4 text-amber-600 flex-shrink-0"/>
                  <p className="text-xs text-amber-700">{imeiLookup.message}</p>
                </div>
              )}

              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <span>💡</span> اتصل بـ <span className="font-mono">*#06#</span> للحصول على رقم IMEI
              </p>
            </Field>

            <Field label="الرقم التسلسلي (Serial)">
              <input className="input" dir="ltr" placeholder="C39XXXXXXXXXX"
                value={form.serial_number} onChange={f('serial_number')}/>
            </Field>

            {/* Brand & Model — pre-filled if IMEI found */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="الماركة *">
                <select className="input" value={form.brand} onChange={f('brand')}>
                  <option value="">اختر...</option>
                  {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </Field>
              <Field label="الموديل *">
                <input className="input" placeholder="iPhone Air"
                  value={form.model} onChange={f('model')}/>
              </Field>
            </div>

            {/* Model code (technical) — shown when filled */}
            {form.model_code && (
              <div className="bg-gray-50 rounded-xl px-4 py-2 flex items-center gap-2 text-sm text-gray-600">
                <span className="text-xs text-gray-400">الكود التقني:</span>
                <span className="font-mono text-xs">{form.model_code}</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="اللون">
                <input className="input" placeholder="أسود / أبيض"
                  value={form.color} onChange={f('color')}/>
              </Field>
              <Field label="السعة">
                <select className="input" value={form.storage} onChange={f('storage')}>
                  <option value="">اختر...</option>
                  {['32GB','64GB','128GB','256GB','512GB','1TB','أخرى'].map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="الدولة *">
                <select className="input" value={form.country_code} onChange={f('country_code')}>
                  {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="المدينة">
                <input className="input" placeholder="القاهرة" value={form.city} onChange={f('city')}/>
              </Field>
            </div>

            <Field label="تاريخ الحادثة">
              <input type="date" className="input" value={form.incident_date} onChange={f('incident_date')}
                max={new Date().toISOString().split('T')[0]}/>
            </Field>

            <Field label="وصف مختصر">
              <textarea className="input" rows={3}
                placeholder="أين وكيف حدثت السرقة أو الضياع؟"
                value={form.description} onChange={f('description')}/>
            </Field>
          </div>
        )}

        {/* ══ STEP 1: Documents ═══════════════════════════════════ */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary-700"/> إثبات الملكية
            </h2>
            <div className="rounded-xl border border-primary-100 bg-primary-50 p-4">
              <p className="mb-2 text-sm font-medium text-primary-800">الصور المقبولة:</p>
              <ul className="space-y-1 text-xs text-primary-700">
                <li>📦 صورة علبة الجهاز (تظهر IMEI والموديل)</li>
                <li>🧾 فاتورة الشراء</li>
                <li>📸 صورة للجهاز مع بطاقة الهوية</li>
              </ul>
            </div>

            <button type="button" onClick={() => fileRef.current.click()}
              className="group w-full rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center transition-all hover:border-primary-400 hover:bg-primary-50/50 sm:p-10">
              <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 transition-colors group-hover:bg-primary-100">
                <Upload className="h-7 w-7 text-gray-400 transition-colors group-hover:text-primary-600" aria-hidden="true" />
              </span>
              <span className="block text-sm font-semibold text-gray-700 transition-colors group-hover:text-primary-700">اضغط لاختيار الصور</span>
              <span className="mt-1 block text-xs text-gray-500">JPG, PNG, WEBP — حتى 5MB لكل صورة — حتى 5 صور</span>
            </button>
            <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFiles}/>

            {files.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {files.map((file, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden bg-gray-100 aspect-square">
                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover"/>
                    <button onClick={() => removeFile(i)}
                      className="absolute top-1 left-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors">
                      <X className="w-3 h-3"/>
                    </button>
                  </div>
                ))}
                {files.length < 5 && (
                  <button onClick={() => fileRef.current.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-primary-400 transition-colors">
                    <Upload className="w-5 h-5"/>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══ STEP 2: Contact ══════════════════════════════════════ */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary-700"/> بيانات التواصل
            </h2>
            <p className="text-sm text-gray-500">
              وسائل التواصل التي تضيفها هنا قد تظهر لمن يبحث عن الجهاز، لمساعدته على التواصل معك.
            </p>

            <Field label="رقم واتساب (مُفضَّل)">
              <input className="input" dir="ltr" placeholder="+201001234567"
                value={form.contact_whatsapp} onChange={f('contact_whatsapp')}/>
            </Field>
            <Field label="رقم هاتف">
              <input className="input" dir="ltr" placeholder="+201001234567"
                value={form.contact_phone} onChange={f('contact_phone')}/>
            </Field>
            <Field label="البريد الإلكتروني">
              <input type="email" className="input" dir="ltr" placeholder="email@example.com"
                value={form.contact_email} onChange={f('contact_email')}/>
            </Field>

            {/* Reward */}
            <div className="rounded-xl border border-[#e7e4dc] bg-[#f7f6f2] p-4">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input type="checkbox" checked={form.reward_offered} onChange={f('reward_offered')} className="w-4 h-4 rounded"/>
                <div>
                  <span className="text-sm font-medium">أرغب بتقديم مكافأة مالية</span>
                  <p className="text-xs text-gray-400">تزيد من احتمالية الإبلاغ عن الجهاز</p>
                </div>
              </label>
              {form.reward_offered && (
                <div className="mt-3 grid grid-cols-1 gap-3 border-t border-gray-200 pt-3 sm:grid-cols-2">
                  <Field label="المبلغ">
                    <input type="number" className="input" placeholder="500" min="1"
                      value={form.reward_amount} onChange={f('reward_amount')}/>
                  </Field>
                  <Field label="العملة">
                    <select className="input" value={form.reward_currency} onChange={f('reward_currency')}>
                      {['EGP','SAR','AED','KWD','USD','EUR'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </Field>
                </div>
              )}
            </div>

            {/* Summary before submit */}
            <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 text-sm">
              <p className="font-semibold text-primary-800 mb-2">ملخص البلاغ:</p>
              <div className="grid grid-cols-2 gap-1 text-primary-700 text-xs">
                <span>الجهاز:</span>     <span className="font-medium">{form.brand} {form.model}</span>
                <span>IMEI:</span>       <span className="font-mono">{form.imei || '—'}</span>
                <span>نوع البلاغ:</span> <span className="font-medium">{form.report_type === 'stolen' ? '🔴 مسروق' : '🟡 مفقود'}</span>
                <span>الدولة:</span>     <span className="font-medium">{getCountryName(form.country_code)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex flex-col gap-3 border-t border-[#e7e4dc] pt-5 sm:flex-row sm:items-center">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className="btn-outline flex w-full items-center justify-center gap-2 sm:w-auto">
              <ChevronRight className="w-4 h-4"/> السابق
            </button>
          )}
          <div className="hidden flex-1 sm:block"/>
          {step < STEPS.length - 1 ? (
            <button onClick={next} className="btn-primary flex w-full items-center justify-center gap-2 sm:w-auto">
              التالي <ChevronLeft className="w-4 h-4"/>
            </button>
          ) : (
            <button onClick={submit} disabled={loading} className="btn-primary flex min-w-[140px] w-full items-center justify-center gap-2 sm:w-auto">
              {loading ? <Spinner size={20}/> : <Send className="w-4 h-4" />}
              {loading ? 'جاري الإرسال...' : 'إرسال البلاغ'}
            </button>
          )}
        </div>
      </section>

      <aside className="space-y-4 lg:sticky lg:top-24" aria-label="إرشادات البلاغ">
        <div className="surface-card p-5 sm:p-6">
          <p className="text-sm font-bold text-gray-900">كيف تتم مراجعة البلاغ؟</p>
          <p className="mt-2 text-xs leading-6 text-gray-500">
            أرسل بيانات دقيقة وصورة إثبات واضحة. يراجع فريقنا المعلومات قبل نشرها في نتائج البحث.
          </p>
          <div className="mt-5 space-y-4 border-t border-[#e7e4dc] pt-4">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                <FileText className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-semibold text-gray-800">أدخل بيانات الجهاز</p>
                <p className="mt-1 text-xs leading-5 text-gray-500">IMEI أو الرقم التسلسلي مع الماركة والموديل.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-semibold text-gray-800">أرفق إثبات الملكية</p>
                <p className="mt-1 text-xs leading-5 text-gray-500">صورة العلبة أو فاتورة الشراء تساعد على التحقق.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <LockKeyhole className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-semibold text-gray-800">اختر بيانات التواصل</p>
                <p className="mt-1 text-xs leading-5 text-gray-500">قد تظهر معلومات التواصل التي تضيفها في نتيجة البحث.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-primary-100 bg-primary-50/70 p-4">
          <div className="flex items-start gap-2.5">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-700" aria-hidden="true" />
            <p className="text-xs leading-6 text-primary-900">
              أضف وسيلة تواصل ترغب بمشاركتها لتسهيل الوصول إليك عند العثور على الجهاز.
            </p>
          </div>
        </div>
      </aside>
      </div>
    </div>
  );
}
