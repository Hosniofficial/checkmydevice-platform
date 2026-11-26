# ⚡ مرجع الأوامر السريعة

قائمة بجميع الأوامر المفيدة للنشر والاختبار.

---

## 🔐 توليد مفاتيح عشوائية

```bash
# توليد JWT_SECRET (استخدم في Railway)
openssl rand -hex 32

# مثال النتيجة:
# a3f5b8c2d9e1f7a4b6c8d2e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5

# كرر الأمر مرتين لـ JWT_SECRET و JWT_REFRESH_SECRET
```

---

## 🧪 اختبار محلياً

### اختبر Backend

```bash
# الدخول إلى backend
cd backend

# تثبيت المتطلبات
npm install

# تشغيل في وضع التطوير
npm run dev

# في terminal آخر، اختبر:
curl http://localhost:5000/api/system/health

# يجب ترى:
# {"success": true, "message": "API is running", ...}
```

### اختبر Frontend

```bash
# الدخول إلى frontend
cd frontend

# تثبيت المتطلبات
npm install

# تشغيل في وضع التطوير
npm run dev

# افتح المتصفح:
# http://localhost:3000
```

### اختبر Docker build محلياً (اختياري)

```bash
# في جذر المشروع
docker build -t checkmydevice .

# تشغيل الحاوية
docker run -p 5000:5000 \
  -e NODE_ENV=production \
  -e DATABASE_URL=postgresql://user:pass@localhost/db \
  -e REDIS_URL=redis://localhost:6379 \
  -e JWT_SECRET=test-secret \
  -e JWT_REFRESH_SECRET=test-refresh \
  checkmydevice

# اختبر في terminal آخر:
curl http://localhost:5000/api/system/health
```

---

## 📤 دفع إلى GitHub

```bash
# 1. إضافة الملفات الجديدة
git add .

# 2. إنشاء commit
git commit -m "chore: add Docker and production deployment config"

# 3. دفع إلى main
git push origin main

# تحقق من GitHub، يجب ترى الملفات الجديدة
```

---

## 🚀 نشر على Railway

### من Railway CLI (اختياري):

```bash
# تثبيت Railway CLI
npm install -g @railway/cli

# تسجيل الدخول
railway login

# ربط المشروع
railway link

# نشر مباشرة
railway deploy

# شوف اللوجات
railway logs

# شوف متغيرات البيئة
railway variables

# تشغيل أوامر
railway run node src/db/migrate.js
railway run node src/db/seed.js
```

### من واجهة Railway Web:

```
1. اذهب إلى railway.app
2. اختر "New Project"
3. اختر "Deploy from GitHub repo"
4. اختر checkmydevice-platform
5. ملأ متغيرات البيئة
6. Deploy!
```

---

## 🌐 نشر على Cloudflare

### من واجهة Cloudflare Web:

```
1. اذهب إلى dash.cloudflare.com
2. اختر "Pages"
3. اختر "Connect to Git"
4. اختر checkmydevice-platform
5. Build command: cd frontend && npm install && npm run build
6. Build output: frontend/dist
7. أضف VITE_API_URL
8. Deploy!
```

---

## 🔧 متغيرات البيئة

### أوامر توليدها:

```bash
# في Railway Shell:
railway variables

# أو عبر CLI:
railway variables --json

# تصديرها لملف:
railway variables --json > .env.railway.json
```

### تعيين متغير واحد:

```bash
# عبر CLI:
railway variables set JWT_SECRET your-secret-value

# أو من الواجهة: Environment → Edit Variables
```

---

## 📊 المراقبة والفحص

### فحص حالة الخادم

```bash
# Backend health check
curl https://your-railway-url/api/system/health

# مثال:
curl https://checkmydevice-api-production.railway.app/api/system/health

# يجب ترى JSON response
```

### اللوجات

```bash
# في Railway Shell:
railway shell

# شوف اللوجات:
tail -f logs

# أو من الواجهة: Deployments → View Logs
```

### قاعدة البيانات

```bash
# الدخول إلى PostgreSQL من Railway Shell:
railway shell

# الاتصال بـ psql:
psql $DATABASE_URL

# أوامر مفيدة:
\dt                    # اعرض الجداول
\d table_name         # اعرض تفاصيل الجدول
SELECT * FROM users;  # استعلام بسيط
```

### Redis

```bash
# في Railway Shell:
railway shell

# الاتصال بـ redis-cli:
redis-cli -u $REDIS_URL

# أوامر مفيدة:
PING              # اختبر الاتصال
KEYS *            # اعرض جميع المفاتيح
GET key-name      # اقرأ قيمة
DEL key-name      # احذف مفتاح
```

---

## 🛠️ استكشاف الأخطاء

### فحص Docker build محلياً

```bash
# بناء مع logging
docker build -t checkmydevice . --progress=plain

# إذا فشل:
docker build -t checkmydevice . --no-cache

# فحص الصورة:
docker image inspect checkmydevice
```

### فحص npm dependencies

```bash
# قائمة المتطلبات المثبتة
npm list

# حذف node_modules وإعادة تثبيت
rm -rf node_modules package-lock.json
npm install

# فحص الأمان
npm audit
npm audit fix
```

### فحص الأخطاء في Railway

```bash
# اقرأ logs الكاملة
railway logs --tail

# اقرأ logs مع timestamps
railway logs --timestamps

# اقرأ log ملف معين
railway logs src/server.js
```

---

## 🔐 الأمان

### تحديث الكلمات المرور

```bash
# في Railway، غيّر ADMIN_PASSWORD:
railway variables set ADMIN_PASSWORD new-secure-password

# تأكد من أنه قوي (8+ characters, uppercase, number, symbol)
```

### تحديث JWT_SECRET

```bash
# توليد secret جديد
openssl rand -hex 32

# تعيينه في Railway
railway variables set JWT_SECRET new-secret-value

# هذا سيلغي جميع الـ tokens القديمة (المستخدمون يحتاجون تسجيل دخول جديد)
```

---

## 📈 الأداء

### اختبر سرعة الموقع

```bash
# اختبر Frontend على Cloudflare
curl -w "\nResponse time: %{time_total}s\n" https://your-domain.pages.dev

# اختبر Backend على Railway
curl -w "\nResponse time: %{time_total}s\n" https://your-api-url/api/system/health
```

### مراقبة استخدام الموارد

```bash
# في Railway Shell:
railway shell

# اعرض استخدام الموارد:
ps aux
df -h
free -h
```

---

## 🔄 التحديثات المستقبلية

### تحديث Backend

```bash
# 1. عدّل الكود محلياً
# 2. اختبر
# 3. ادفع إلى GitHub
git add .
git commit -m "feat: new feature"
git push origin main

# 4. Railway سيبني النسخة الجديدة تلقائياً
# 5. راقب اللوجات:
railway logs

# 6. إذا احتجت تشغيل migrations:
railway run node src/db/migrate.js
```

### تحديث Frontend

```bash
# 1. عدّل الكود محلياً
# 2. اختبر: npm run dev و npm run build
# 3. ادفع إلى GitHub
git add .
git commit -m "feat: UI update"
git push origin main

# 4. Cloudflare سيبني النسخة الجديدة تلقائياً
# 5. راقب deployment في Cloudflare Dashboard
```

---

## 📚 روابط مفيدة

```bash
# Railway
railway.app
railway.app/docs

# Cloudflare
dash.cloudflare.com
developers.cloudflare.com/pages

# توثيق Node.js
nodejs.org/docs

# توثيق Express.js
expressjs.com
```

---

## 💡 نصائح

```bash
# تشغيل أوامر متعددة
npm run build && npm run start

# اختبر مع متغيرات بيئة
NODE_ENV=production node src/server.js

# تشفير كلمات مرور قبل التخزين
bcrypt.hash(password, 10)

# توليد UUIDs
import { v4 as uuidv4 } from 'uuid';
const id = uuidv4();
```

---

✨ **استخدم هذا المرجع دائماً!** 📌
