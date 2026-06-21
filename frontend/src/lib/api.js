import axios from 'axios';

// In production (Vercel): VITE_API_URL = https://your-backend.onrender.com
// In development (Vite proxy): baseURL = /api  →  proxied to localhost:5000
const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Initialize token from localStorage on app load
const savedToken = localStorage.getItem('access_token');
if (savedToken) {
  api.defaults.headers.common.Authorization = `Bearer ${savedToken}`;
}

// Attach token on every request (picks up fresh token after refresh)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Track if a refresh is already in-progress to avoid parallel refresh calls
let refreshPromise = null;

// Auto refresh on 401
api.interceptors.response.use(
  r => r,
  async (error) => {
    const original = error.config;
    const url      = original?.url || '';

    // Skip auth endpoints to avoid infinite loops
    const isAuthEndpoint = /\/(login|register|forgot-password|reset-password|refresh|resend-verification)/.test(url);

    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem('refresh_token');
        if (!refresh) throw new Error('no refresh token');

        // Deduplicate: if refresh is already in flight, wait for it
        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${BASE}/auth/refresh`, { refresh_token: refresh })
            .finally(() => { refreshPromise = null; });
        }

        const { data } = await refreshPromise;
        const newAccess  = data.data.access_token;
        const newRefresh = data.data.refresh_token;

        localStorage.setItem('access_token',  newAccess);
        localStorage.setItem('refresh_token', newRefresh);

        api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newAccess}`;

        return api(original);
      } catch {
        // Refresh failed — clear session silently
        localStorage.clear();
        delete api.defaults.headers.common.Authorization;

        // Only redirect to login if on a protected route
        const protectedPaths = ['/dashboard', '/reports', '/notifications', '/profile', '/admin'];
        const isProtected = protectedPaths.some(p => window.location.pathname.startsWith(p));
        if (isProtected) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
