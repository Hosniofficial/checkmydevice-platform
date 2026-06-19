import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Laptop, Tablet, Upload, Phone, ChevronLeft, ChevronRight,
         CheckCircle, X, Loader, Sparkles, AlertCircle, Info,
         ShieldAlert, HelpCircle } from 'lucide-react';
import { Field, Spinner } from '../components/ui/index.jsx';
import api from '../lib/api.js';
import toast from 'react-hot-toast';
import { COUNTRIES, getCountryName } from '../lib/countries.js';

const STEPS = ['بيانات الجهاز', 'إثبات الملكية', 'بيانات التواصل'];

const BRANDS = ['Apple','Samsung','Huawei','Xiaomi','Oppo','Vivo','OnePlus',
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

  // ── Files ──────────────────────────────────────────────────────
  const handleFiles = (e) => {
    const selected = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selected].slice(0, 5));
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
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6"/>
      <h2 className="text-2xl font-bold mb-2">تم استلام بلاغك!</h2>
      <p className="text-gray-500 mb-2">{done.message_ar}</p>
      <div className="bg-gray-100 rounded-xl px-4 py-3 text-lg font-mono my-6 text-primary-700">
        {done.reference}
      </div>
      <div className="flex gap-3 justify-center">
        <button onClick={() => navigate('/reports')} className="btn-primary">بلاغاتي</button>
        <button onClick={() => navigate('/dashboard')} className="btn-outline">الرئيسية</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">رفع بلاغ جديد</h1>

      {/* Step indicator */}
      <div className="flex items-center mb-8">
        {STEPS.map((label, i) => (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                ${i < step ? 'bg-green-500 text-white' : i === step ? 'bg-primary-700 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-xs mt-1 hidden sm:block ${i === step ? 'text-primary-700 font-medium' : 'text-gray-400'}`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-1 mx-2 rounded-full transition-colors ${i < step ? 'bg-green-400' : 'bg-gray-200'}`}/>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="card">

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
                    active: 'border-blue-500 bg-blue-50 text-blue-700 shadow-blue-100',
                    inactive: 'border-gray-200 text-gray-500 hover:border-blue-300 hover:bg-blue-50/50',
                    iconActive: 'text-blue-600 bg-blue-100',
                    iconInactive: 'text-gray-400 bg-gray-100',
                  },
                  {
                    v: 'laptop',
                    label: 'لاب توب',
                    icon: Laptop,
                    active: 'border-violet-500 bg-violet-50 text-violet-700 shadow-violet-100',
                    inactive: 'border-gray-200 text-gray-500 hover:border-violet-300 hover:bg-violet-50/50',
                    iconActive: 'text-violet-600 bg-violet-100',
                    iconInactive: 'text-gray-400 bg-gray-100',
                  },
                  {
                    v: 'tablet',
                    label: 'تابلت',
                    icon: Tablet,
                    active: 'border-teal-500 bg-teal-50 text-teal-700 shadow-teal-100',
                    inactive: 'border-gray-200 text-gray-500 hover:border-teal-300 hover:bg-teal-50/50',
                    iconActive: 'text-teal-600 bg-teal-100',
                    iconInactive: 'text-gray-400 bg-gray-100',
                  },
                ].map(({ v, label, icon: Icon, active, inactive, iconActive, iconInactive }) => {
                  const isSelected = form.device_type === v;
                  return (
                    <button key={v} type="button" onClick={() => sv('device_type', v)}
                      className={`relative flex flex-col items-center gap-2 py-3 px-2 rounded-xl border-2 font-medium transition-all duration-200 shadow-sm
                        ${isSelected ? `${active} shadow-md` : inactive}`}>
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors
                        ${isSelected ? iconActive : iconInactive}`}>
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
              <div className="grid grid-cols-2 gap-3">
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
            <div className="grid grid-cols-2 gap-3">
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

            <div className="grid grid-cols-2 gap-3">
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

            <div className="grid grid-cols-2 gap-3">
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
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800 font-medium mb-2">الصور المقبولة:</p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>📦 صورة علبة الجهاز (تظهر IMEI والموديل)</li>
                <li>🧾 فاتورة الشراء</li>
                <li>📸 صورة للجهاز مع بطاقة الهوية</li>
              </ul>
            </div>

            <div onClick={() => fileRef.current.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors">
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3"/>
              <p className="text-sm text-gray-600 font-medium">اضغط لاختيار الصور</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — حتى 5MB لكل صورة — حتى 5 صور</p>
            </div>
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
              ستُستخدم هذه البيانات لتمكين من يعثر على جهازك من التواصل معك مباشرة.
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
            <div className="bg-gray-50 rounded-xl p-4">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input type="checkbox" checked={form.reward_offered} onChange={f('reward_offered')} className="w-4 h-4 rounded"/>
                <div>
                  <span className="text-sm font-medium">أرغب بتقديم مكافأة مالية</span>
                  <p className="text-xs text-gray-400">تزيد من احتمالية الإبلاغ عن الجهاز</p>
                </div>
              </label>
              {form.reward_offered && (
                <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-200">
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
        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className="btn-outline flex items-center gap-2">
              <ChevronRight className="w-4 h-4"/> السابق
            </button>
          )}
          <div className="flex-1"/>
          {step < STEPS.length - 1 ? (
            <button onClick={next} className="btn-primary flex items-center gap-2">
              التالي <ChevronLeft className="w-4 h-4"/>
            </button>
          ) : (
            <button onClick={submit} disabled={loading} className="btn-primary flex items-center gap-2 min-w-[140px] justify-center">
              {loading ? <Spinner size={20}/> : null}
              {loading ? 'جاري الإرسال...' : '📤 إرسال البلاغ'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
