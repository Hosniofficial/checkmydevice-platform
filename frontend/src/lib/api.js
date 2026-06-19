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

// Attach token
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
    const url = original?.url || '';
    const isAuthEndpoint = /\/auth\/(login|register|forgot-password|reset-password|refresh)/.test(url);

    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem('refresh_token');
        if (!refresh) throw new Error('no refresh');
        const { data } = await axios.post(`${BASE}/auth/refresh`, { refresh_token: refresh });
        localStorage.setItem('access_token',  data.data.access_token);
        localStorage.setItem('refresh_token', data.data.refresh_token);
        original.headers.Authorization = `Bearer ${data.data.access_token}`;
        return api(original);
      } catch {
        localStorage.clear();
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
