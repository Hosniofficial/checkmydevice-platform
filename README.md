# CheckMyDevice Platform

<div align="center">

![CheckMyDevice](frontend/favicon_io/Logo.png)

**أول منصة عربية لفحص الأجهزة المحمولة والتحقق من حالتها قبل الشراء**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7+-red)](https://redis.io)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://docker.com)

</div>

---

## 📋 نظرة عامة

CheckMyDevice منصة ويب تتيح للمستخدمين:
- **فحص الأجهزة** عبر رقم IMEI قبل الشراء
- **الإبلاغ** عن الأجهزة المسروقة أو المفقودة
- **إدارة البلاغات** من لوحة تحكم إدارية متكاملة
- **نظام اشتراكات** متعدد الخطط (مجاني، أساسي، احترافي، مؤسسي)

---

## 🏗️ التقنيات المستخدمة

### Backend
- **Node.js + Express** — REST API
- **PostgreSQL** — قاعدة البيانات الرئيسية
- **Redis** — Caching & Rate Limiting
- **JWT** — Authentication (Access + Refresh tokens)
- **Multer** — رفع الملفات
- **Nodemailer** — إرسال الإيميلات
- **Sentry** — Error Monitoring

### Frontend
- **React 18 + Vite** — واجهة المستخدم
- **Tailwind CSS** — التصميم
- **React Router v6** — التنقل
- **Zustand** — State Management
- **React Hook Form + Zod** — النماذج والتحقق
- **Axios** — HTTP Client
- **Lucide React** — الأيقونات

---

## 🚀 تشغيل المشروع محلياً

### المتطلبات
- Node.js 18+
- PostgreSQL 15+
- Redis 7+

### 1. Clone المشروع
```bash
git clone https://github.com/Hosniofficial/checkmydevice-platform.git
cd checkmydevice-platform
```

### 2. إعداد Backend
```bash
cd backend
npm install
cp .env.example .env
# عدّل .env بإضافة بياناتك
```

### 3. إعداد قاعدة البيانات
```bash
node src/db/migrate.js
node src/db/seed.js
node src/db/update-plans-egp.js
```

### 4. تشغيل Backend
```bash
npm run dev
# يعمل على http://localhost:5000
```

### 5. إعداد Frontend
```bash
cd ../frontend
npm install
npm run dev
# يعمل على http://localhost:3000
```

### أو باستخدام Docker
```bash
docker-compose up -d
```

---

## 📁 هيكل المشروع

```
checkmydevice/
├── backend/
│   ├── src/
│   │   ├── config/          # Sentry, Swagger
│   │   ├── db/              # Migrations, Seeds
│   │   ├── middleware/       # Auth, Rate Limiting
│   │   ├── modules/         # Routes by feature
│   │   │   ├── admin/
│   │   │   ├── auth/
│   │   │   ├── merchant/
│   │   │   ├── notifications/
│   │   │   ├── plans/
│   │   │   ├── reports/
│   │   │   ├── search/
│   │   │   └── system/
│   │   ├── services/        # Business logic
│   │   └── utils/
│   ├── uploads/             # Uploaded files (gitignored)
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── pages/
│   │   └── store/
│   └── public/
└── docker-compose.yml
```

---

## 🔐 المتغيرات البيئية

انسخ `backend/.env.example` إلى `backend/.env` وعدّل القيم:

| المتغير | الوصف |
|---------|-------|
| `DATABASE_URL` | رابط اتصال PostgreSQL |
| `JWT_SECRET` | مفتاح JWT (يجب أن يكون عشوائياً وطويلاً) |
| `JWT_REFRESH_SECRET` | مفتاح Refresh Token |
| `REDIS_URL` | رابط اتصال Redis |
| `SMTP_*` | إعدادات البريد الإلكتروني |
| `IMEICHECK_API_KEY` | مفتاح API لخدمة فحص IMEI |
| `SENTRY_DSN` | مفتاح Sentry لمراقبة الأخطاء |

---

## 📖 API Documentation

بعد تشغيل الـ backend، افتح:
```
http://localhost:5000/api-docs
```

---

## 👥 أدوار المستخدمين

| الدور | الصلاحيات |
|-------|-----------|
| `user` | بحث، رفع بلاغات، إدارة الحساب |
| `merchant` | كل صلاحيات user + API access |
| `admin` | إدارة البلاغات والمستخدمين |
| `super_admin` | كل الصلاحيات + سجل الأحداث + حذف البلاغات |

---

## 📄 الترخيص

© 2026 Mustafa Hosni — جميع الحقوق محفوظة.

هذا البرنامج ملكية خاصة. لا يُسمح باستخدامه أو نسخه أو توزيعه بأي شكل دون إذن كتابي صريح من المالك.
راجع ملف [LICENSE](LICENSE) للتفاصيل الكاملة.
