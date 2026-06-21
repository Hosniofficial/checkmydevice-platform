import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Helpers ──────────────────────────────────────────────────────

function getTokenExpiry(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null; // ms
  } catch {
    return null;
  }
}

function isTokenExpiredOrExpiringSoon(token, bufferMs = 60_000) {
  const expiry = getTokenExpiry(token);
  if (!expiry) return true;
  return Date.now() >= expiry - bufferMs; // refresh if < 60s left
}

// ─── Initialize ───────────────────────────────────────────────────

const savedToken = localStorage.getItem('access_token');
if (savedToken) {
  api.defaults.headers.common.Authorization = `Bearer ${savedToken}`;
}

// ─── Refresh logic (shared promise to avoid parallel calls) ───────

let refreshPromise = null;

async function doRefresh() {
  if (refreshPromise) return refreshPromise;

  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) throw new Error('no refresh token');

  refreshPromise = axios
    .post(`${BASE}/auth/refresh`, { refresh_token: refresh })
    .then(({ data }) => {
      const newAccess  = data.data.access_token;
      const newRefresh = data.data.refresh_token;
      localStorage.setItem('access_token',  newAccess);
      localStorage.setItem('refresh_token', newRefresh);
      api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
      return newAccess;
    })
    .catch((err) => {
      // Refresh token itself expired or invalid — log out
      localStorage.clear();
      delete api.defaults.headers.common.Authorization;
      const protectedPaths = ['/dashboard', '/reports', '/notifications', '/profile', '/admin'];
      const isProtected = protectedPaths.some(p => window.location.pathname.startsWith(p));
      if (isProtected) window.location.href = '/login';
      throw err;
    })
    .finally(() => { refreshPromise = null; });

  return refreshPromise;
}

// ─── Request interceptor — proactive refresh ──────────────────────
// Refresh the token BEFORE it expires (if < 60s left), not after a 401.
// This eliminates the race condition with parallel requests.

api.interceptors.request.use(async (config) => {
  const isAuthEndpoint = /\/(login|register|forgot-password|reset-password|refresh|resend-verification)/.test(config.url || '');
  if (isAuthEndpoint) return config;

  let token = localStorage.getItem('access_token');
  if (!token) return config;

  // Proactively refresh if token expires within 60 seconds
  if (isTokenExpiredOrExpiringSoon(token)) {
    try {
      token = await doRefresh();
    } catch {
      // doRefresh already handled redirect — just continue with old token
    }
  }

  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response interceptor — reactive fallback for 401 ────────────
// Safety net: if a 401 still slips through (e.g. clock skew), retry once.

api.interceptors.response.use(
  r => r,
  async (error) => {
    const original = error.config;
    const url      = original?.url || '';
    const isAuthEndpoint = /\/(login|register|forgot-password|reset-password|refresh|resend-verification)/.test(url);

    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      original._retry = true;
      try {
        const newToken = await doRefresh();
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        // Already handled in doRefresh
      }
    }
    return Promise.reject(error);
  }
);

export default api;
