import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '../../constant';
import { login } from './authFns';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      loading: false,
      error: '',
      signIn: async (credentials) => {
        set({ loading: true, error: '' });
        try {
          const user = await login(credentials);
          set({ user, loading: false });
          return user;
        } catch (err) {
          set({ loading: false, error: err.message });
          return null;
        }
      },
      signOut: () => set({ user: null, error: '' }),
    }),
    { name: STORAGE_KEYS.auth, partialize: (s) => ({ user: s.user }) },
  ),
);
