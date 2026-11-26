# 🚀 نشر CheckMyDevice على Railway + Cloudflare

هذا الدليل يشرح كيفية نشر Backend على Railway و Frontend على Cloudflare Pages.

---

## 📋 المتطلبات

- حساب GitHub (يجب أن يكون المشروع public أو private)
- حساب [Railway](https://railway.app)
- حساب [Cloudflare](https://cloudflare.com)
- PostgreSQL و Redis متاح (Railway سيوفرهما)

---

## 🎯 الهيكل النهائي

```
Backend (Railway)        ← Node.js API + PostgreSQL + Redis
      ↓
Frontend (Cloudflare)    ← Static React App + CDN
```

---

# الجزء 1️⃣: نشر Backend على Railway

## الخطوة 1: إعداد قاعدة البيانات على Railway

1. اذهب إلى [railway.app](https://railway.app)
2. سجل دخول أو أنشئ حساب جديد
3. اختر **New Project**
4. اختر **Provision PostgreSQL**
5. اختر **Provision Redis**

## الخطوة 2: ربط مشروع GitHub

1. في Railway، اختر **New Project**
2. اختر **Deploy from GitHub repo**
3. اختر مستودع `checkmydevice-platform`
4. Railway سيكتشف `Dockerfile` تلقائياً

## الخطوة 3: تعيين المتغيرات البيئية

في لوحة تحكم Railway، أضف هذه المتغيرات:

| المتغير | القيمة | ملاحظات |
|---------|--------|---------|
| `NODE_ENV` | `production` | |
| `PORT` | `5000` | Railway قد تختاره تلقائياً |
| `DATABASE_URL` | (سيتم إنشاؤه تلقائياً) | ربط PostgreSQL |
| `REDIS_URL` | (سيتم إنشاؤه تلقائياً) | ربط Redis |
| `JWT_SECRET` | (أنشئ مفتاح عشوائي طويل) | استخدم `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | (أنشئ مفتاح عشوائي طويل) | استخدم `openssl rand -hex 32` |
| `JWT_EXPIRES_IN` | `15m` | مدة صلاحية Access Token |
| `JWT_REFRESH_EXPIRES_IN` | `30d` | مدة صلاحية Refresh Token |
| `FRONTEND_URL` | `https://your-domain.pages.dev` | رابط Frontend على Cloudflare |
| `IMEI_PROVIDER` | `imeicheck` أو `mock` | اختر حسب احتياجك |
| `IMEICHECK_API_KEY` | (من IMEI Check) | إذا كنت تستخدم `imeicheck` |
| `RESEND_API_KEY` | (من Resend) | لإرسال الإيميلات |
| `EMAIL_FROM` | `noreply@yourdomain.com` | البريد المرسل |
| `ADMIN_EMAIL` | `admin@yourdomain.com` | البريد الإداري |
| `ADMIN_PASSWORD` | (أنشئ كلمة مرور قوية) | ⚠️ غيّرها بعد الدخول الأول |
| `CLOUDINARY_CLOUD_NAME` | (من Cloudinary) | رفع الصور |
| `CLOUDINARY_API_KEY` | (من Cloudinary) | |
| `CLOUDINARY_API_SECRET` | (من Cloudinary) | |
| `SENTRY_DSN` | (من Sentry) | مراقبة الأخطاء (اختياري) |

## الخطوة 4: تشغيل المهاجر

بعد نشر Backend، شغّل الترحيلات من Railway Shell:

```bash
# الدخول إلى Railway Shell
railway shell

# تشغيل الترحيلات
node src/db/migrate.js

# إضافة البيانات الأولية
node src/db/seed.js

# تحديث الخطط (إذا لزم الأمر)
node src/db/update-plans-egp.js

# الخروج
exit
```

أو من خلال **Deployments → View Logs**:

```bash
railway run node src/db/migrate.js
railway run node src/db/seed.js
```

## الخطوة 5: التحقق من الخادم

```bash
# الحصول على رابط Backend
# سيكون: https://[project-name]-production.railway.app

# اختبر صحة الخادم
curl https://[your-railway-url]/api/system/health

# يجب أن ترى استجابة JSON
```

---

# الجزء 2️⃣: نشر Frontend على Cloudflare Pages

## الخطوة 1: إعداد Cloudflare

1. اذهب إلى [dash.cloudflare.com](https://dash.cloudflare.com)
2. اختر **Pages**
3. اختر **Connect to Git**
4. اختر مستودع `checkmydevice-platform`

## الخطوة 2: تكوين Build

في Cloudflare Pages:

- **Project name:** `checkmydevice` (أو أي اسم تريده)
- **Production branch:** `main`
- **Framework preset:** `Vite`
- **Build command:** `cd frontend && npm install && npm run build`
- **Build output directory:** `frontend/dist`
- **Root directory:** (اترك فارغ)

## الخطوة 3: متغيرات البيئة

في **Settings → Environment variables**، أضف:

```
VITE_API_URL=https://[your-railway-url]
```

على سبيل المثال:
```
VITE_API_URL=https://checkmydevice-api-production.railway.app
```

## الخطوة 4: Deploy

Cloudflare سينشر Frontend تلقائياً عند كل Push على `main`.

الرابط النهائي سيكون: `https://checkmydevice.[random-id].pages.dev`

---

# الجزء 3️⃣: ربط Domain مخصص (اختياري)

## ربط Domain مع Cloudflare

1. في Cloudflare، اذهب إلى **Websites**
2. أضف domain جديد
3. غيّر nameservers على موفر Domain الخاص بك
4. في **Pages Settings**، أضف Domain مخصص

مثال:
- Frontend: `app.yourdomain.com`
- Backend API: `api.yourdomain.com`

---

# 🛠️ استكشاف الأخطاء

## خطأ: `npm: not found`

✅ **تم الحل:** استخدمنا Dockerfile مخصص يحتوي على Node.js

## خطأ: `DATABASE_URL is not set`

```bash
# تأكد من:
# 1. Railway PostgreSQL مشغل
# 2. DATABASE_URL موجود في Environment variables
railway variables
```

## خطأ: Redis connection failed

```bash
# تأكد من:
railway redis:info
```

## خطأ: Build timeout على Cloudflare

في Cloudflare Pages settings:
- زد **Build timeout** إلى 20 دقيقة
- تأكد من `npm install` ليس ثقيل الأداء

---

# 📊 الفحص والمراقبة

## فحص الخادم

```bash
# من Railway Shell
railway shell

# اختبر API
curl http://localhost:5000/api/system/health

# شوف اللوجات
tail -f /path/to/logs
```

## مراقبة الأخطاء

استخدم **Sentry** لمراقبة أخطاء الإنتاج:

1. أنشئ حساب [Sentry](https://sentry.io)
2. أنشئ مشروع Node.js جديد
3. انسخ DSN
4. أضفه في Railway كـ `SENTRY_DSN`

---

# 🔄 التحديثات المستقبلية

عند تحديث الكود:

1. **Backend:** Push على GitHub → Railway ينشر تلقائياً
2. **Frontend:** Push على GitHub → Cloudflare ينشر تلقائياً
3. **Database:** شغّل الترحيلات يدويًا عند الحاجة

---

# ⚙️ أوامر مفيدة

```bash
# إنشاء مفاتيح JWT عشوائية
openssl rand -hex 32

# اختبر الاتصال بـ API من Terminal
curl -X GET https://[your-railway-url]/api/system/health -H "Content-Type: application/json"

# شوف سجل البناء على Railway
railway logs

# شوف متغيرات البيئة
railway variables

# تحديث ملف env محلي من Railway
railway variables --json > .env.railway
```

---

# ✨ تم! 🎉

بعد إكمال هذه الخطوات، يجب أن يكون:
- ✅ Backend يعمل على Railway
- ✅ Frontend يعمل على Cloudflare
- ✅ Database و Cache متصلان
- ✅ Ready للإنتاج!

في حالة أي مشاكل، اطلب دعم من:
- Railway: [railway.app/support](https://railway.app/support)
- Cloudflare: [support.cloudflare.com](https://support.cloudflare.com)
