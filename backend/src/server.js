import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

// ─── Services ─────────────────────────────────────────────────────
import { connectRedis } from './services/redis.service.js';

// ─── Config ───────────────────────────────────────────────────────
import { initSentry, sentryRequestHandler, sentryTracingHandler, sentryErrorHandler, captureError } from './config/sentry.js';
import { setupSwagger } from './config/swagger.js';

// ─── Routes ───────────────────────────────────────────────────────
import authRoutes          from './modules/auth/auth.routes.js';
import searchRoutes        from './modules/search/search.routes.js';
import reportsRoutes       from './modules/reports/reports.routes.js';
import adminRoutes         from './modules/admin/admin.routes.js';
import notificationsRoutes from './modules/notifications/notifications.routes.js';
import plansRoutes         from './modules/plans/plans.routes.js';
import systemRoutes        from './modules/system/system.routes.js';
import merchantRoutes      from './modules/merchant/merchant.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// ── 1. Sentry (MUST be first) ─────────────────────────────────────
initSentry(app);
app.use(sentryRequestHandler());
app.use(sentryTracingHandler());

// ── 2. Security ───────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // handled by Nginx in prod
}));

// ── Trust proxy (for Render / reverse proxies) ───────────────────
app.set('trust proxy', 1);

app.use(cors({
  origin: (process.env.FRONTEND_URL || 'http://localhost:3000').split(','),
  credentials: true,
}));

// ── 3. Logging ────────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── 4. Body parsing ───────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── 5. Global rate limit (express-rate-limit) ─────────────────────
app.use('/api/', rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             300,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    error: { code: 'TOO_MANY_REQUESTS', message_ar: 'طلبات كثيرة جداً، حاول بعد قليل' },
  },
}));

// ── 6. Static uploads ─────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ── 7. Swagger Docs (before routes) ──────────────────────────────
setupSwagger(app);

// ── 8. Routes ─────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/search',        searchRoutes);
app.use('/api/reports',       reportsRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/plans',         plansRoutes);
app.use('/api/system',        systemRoutes);
app.use('/api/merchant',      merchantRoutes);
app.use('/api/v1',            merchantRoutes); // external API

// ── 9. Health check ───────────────────────────────────────────────
app.get('/health', (req, res) => res.json({
  status: 'ok',
  time:   new Date().toISOString(),
  redis:  process.env.REDIS_URL ? 'configured' : 'local',
  sentry: process.env.SENTRY_DSN ? 'enabled' : 'dry-run',
}));

// ── 10. 404 ───────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({
  success: false,
  error: { code: 'NOT_FOUND', message_ar: 'الرابط غير موجود', path: req.path },
}));

// ── 11. Sentry error handler (BEFORE custom error handler) ────────
app.use(sentryErrorHandler());

// ── 12. Custom error handler ──────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  captureError(err, { path: req.path, method: req.method });
  console.error('[Error]', err.message);
  res.status(err.status || 500).json({
    success: false,
    error: {
      code:       err.code       || 'INTERNAL_ERROR',
      message_ar: err.message_ar || 'حدث خطأ في الخادم، يرجى المحاولة لاحقاً',
    },
  });
});

// ─── Bootstrap ────────────────────────────────────────────────────
async function bootstrap() {
  // Connect Redis (non-blocking — app works without it)
  await connectRedis();

  const PORT = parseInt(process.env.PORT || '5000');
  app.listen(PORT, () => {
    console.log(`✅ CheckMyDevice API  → http://localhost:${PORT}`);
    console.log(`📚 Swagger Docs       → http://localhost:${PORT}/api-docs`);
    console.log(`📊 System Status      → http://localhost:${PORT}/api/system/status`);
  });
}

bootstrap().catch(err => {
  console.error('❌ Failed to start:', err.message);
  process.exit(1);
});

export default app;
