import { create } from 'zustand';
import api, { type User } from '@/lib/api';
import axios from 'axios';

let isLoadingUser = false;

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    const { data } = await api.post<{ access_token: string; refresh_token: string; user: User }>('/auth/login', { email, password });
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    set({ user: data.user, isAuthenticated: true });
  },

  register: async (email: string, password: string, name: string) => {
    const { data } = await api.post<{ access_token: string; refresh_token: string; user: User }>('/auth/register', { email, password, name });
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    set({ user: data.user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    if (isLoadingUser) return;
    isLoadingUser = true;
    const token = localStorage.getItem('access_token');
    if (!token) {
      isLoadingUser = false;
      set({ isLoading: false, isAuthenticated: false });
      return;
    }
    try {
      const res = await api.get<User>('/auth/me');
      set({ user: res.data, isAuthenticated: true, isLoading: false });
    } catch {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${api.defaults.baseURL}/auth/refresh`,
            { refresh_token: refreshToken },
          );
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
          const res = await api.get<User>('/auth/me');
          set({ user: res.data, isAuthenticated: true, isLoading: false });
          isLoadingUser = false;
          return;
        } catch {
          // refresh failed
        }
      }
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    } finally {
      isLoadingUser = false;
    }
  },
}));
