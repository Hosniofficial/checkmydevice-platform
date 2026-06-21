import { create } from 'zustand';
import api from '../lib/api.js';

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,

  init: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return set({ loading: false });
    try {
      // api interceptor will auto-refresh the token if it's expired
      const { data } = await api.get('/auth/me');
      set({ user: data.data, loading: false });
    } catch (err) {
      // Only clear if refresh also failed (interceptor already tried)
      const status = err?.response?.status;
      if (status === 401) {
        // Token & refresh both failed — log out silently
        localStorage.clear();
        delete api.defaults.headers.common.Authorization;
      }
      set({ user: null, loading: false });
    }
  },

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('access_token',  data.data.access_token);
    localStorage.setItem('refresh_token', data.data.refresh_token);
    api.defaults.headers.common.Authorization = `Bearer ${data.data.access_token}`;
    set({ user: data.data.user });
    return data.data.user;
  },

  logout: () => {
    localStorage.clear();
    delete api.defaults.headers.common.Authorization;
    set({ user: null });
  },

  refreshUser: async () => {
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data.data });
    } catch {}
  },

  isAdmin: () => ['admin','super_admin'].includes(get().user?.role),
  isSuperAdmin: () => get().user?.role === 'super_admin',
}));
