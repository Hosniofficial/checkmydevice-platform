/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║                  SENTRY ERROR MONITORING                    ║
 * ║                                                              ║
 * ║  Tracks:                                                     ║
 * ║  - Unhandled exceptions & promise rejections                ║
 * ║  - HTTP errors (4xx/5xx)                                    ║
 * ║  - Performance (slow requests)                              ║
 * ║  - Custom events (fraud detection, rate limit hits)         ║
 * ║                                                              ║
 * ║  Set SENTRY_DSN in .env to enable.                          ║
 * ║  Without DSN it runs in dry-run (logs to console only).     ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import * as Sentry from '@sentry/node';

let initialized = false;

// ─── Init ─────────────────────────────────────────────────────────
export function initSentry(app) {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    console.warn('[Sentry] No SENTRY_DSN — running in dry-run mode (errors logged to console only)');
    return;
  }

  Sentry.init({
    dsn,
    environment:      process.env.NODE_ENV || 'development',
    release:          process.env.npm_package_version || '1.0.0',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,

    integrations: [
      // HTTP request tracking
      new Sentry.Integrations.Http({ tracing: true }),
      // Express middleware tracking
      new Sentry.Integrations.Express({ app }),
    ],

    // Filter out noise
    ignoreErrors: [
      'ECONNRESET',
      'ECONNREFUSED',
      'ResizeObserver loop limit exceeded',
    ],

    // Enrich events
    beforeSend(event, hint) {
      const err = hint?.originalException;

      // Don't send 4xx errors (user mistakes, not our bugs)
      if (err?.status >= 400 && err?.status < 500) return null;

      // Scrub sensitive fields
      if (event.request?.data) {
        const data = event.request.data;
        if (data.password)         data.password         = '[REDACTED]';
        if (data.current_password) data.current_password = '[REDACTED]';
        if (data.new_password)     data.new_password     = '[REDACTED]';
      }

      return event;
    },
  });

  initialized = true;
  console.log('✅ Sentry initialized — environment:', process.env.NODE_ENV);
}

// ─── Request handler (must be FIRST middleware) ───────────────────
export function sentryRequestHandler() {
  if (!initialized) return (req, res, next) => next();
  return Sentry.Handlers.requestHandler();
}

// ─── Tracing handler ──────────────────────────────────────────────
export function sentryTracingHandler() {
  if (!initialized) return (req, res, next) => next();
  return Sentry.Handlers.tracingHandler();
}

// ─── Error handler (must be LAST middleware before custom error handler) ─
export function sentryErrorHandler() {
  if (!initialized) return (err, req, res, next) => next(err);
  return Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Only capture 5xx errors
      return !error.status || error.status >= 500;
    },
  });
}

// ─── Manual event capture helpers ────────────────────────────────
export function captureError(err, context = {}) {
  if (!initialized) {
    console.error('[Sentry dry-run] Error:', err.message, context);
    return;
  }
  Sentry.withScope((scope) => {
    Object.entries(context).forEach(([k, v]) => scope.setExtra(k, v));
    Sentry.captureException(err);
  });
}

export function captureMessage(message, level = 'info', context = {}) {
  if (!initialized) {
    console.log(`[Sentry dry-run] ${level.toUpperCase()}:`, message, context);
    return;
  }
  Sentry.withScope((scope) => {
    scope.setLevel(level);
    Object.entries(context).forEach(([k, v]) => scope.setExtra(k, v));
    Sentry.captureMessage(message);
  });
}

export function setUserContext(userId, email, role) {
  if (!initialized) return;
  Sentry.setUser({ id: userId, email, role });
}

export function clearUserContext() {
  if (!initialized) return;
  Sentry.setUser(null);
}

// ─── Specific business event trackers ────────────────────────────
export function trackRateLimitHit(ip, userId, limit) {
  captureMessage('Rate limit exceeded', 'warning', { ip, userId, limit });
}

export function trackSuspiciousReport(imei, userId, reason) {
  captureMessage('Suspicious report detected', 'warning', { imei, userId, reason });
}

export function trackProviderError(provider, imei, error) {
  captureMessage(`IMEI provider error: ${provider}`, 'error', { provider, imei, error: error.message });
}

export default {
  initSentry,
  sentryRequestHandler,
  sentryTracingHandler,
  sentryErrorHandler,
  captureError,
  captureMessage,
  setUserContext,
  trackRateLimitHit,
  trackSuspiciousReport,
  trackProviderError,
};
