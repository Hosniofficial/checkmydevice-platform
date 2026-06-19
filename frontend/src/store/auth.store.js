import { create } from 'zustand';
import api from '../lib/api.js';

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,

  init: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return set({ loading: false });
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data.data, loading: false });
    } catch {
      localStorage.clear();
      set({ user: null, loading: false });
    }
  },

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('access_token',  data.data.access_token);
    localStorage.setItem('refresh_token', data.data.refresh_token);
    set({ user: data.data.user });
    return data.data.user;
  },

  logout: () => {
    localStorage.clear();
    set({ user: null });
  },

  isAdmin: () => ['admin','super_admin'].includes(get().user?.role),
  isSuperAdmin: () => get().user?.role === 'super_admin',
}));
