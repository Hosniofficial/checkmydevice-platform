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

// Auto refresh on 401 (skip auth endpoints — e.g. failed login must not reload the page)
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

        const { data } = await axios.post(`${BASE}/auth/refresh`, { refresh_token: refresh });
        const newToken = data.data.access_token;

        localStorage.setItem('access_token',  newToken);
        localStorage.setItem('refresh_token', data.data.refresh_token);

        // Update the failed request's auth header and retry
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newToken}`;
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;

        return api(original);
      } catch {
        localStorage.clear();
        delete api.defaults.headers.common.Authorization;
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
