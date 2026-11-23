import { create } from 'zustand';
import { STORAGE_KEYS } from '../../constant';
import { configureHttp, refreshAccessToken } from '../../http';
import {
  acceptInviteRequest, changePasswordRequest, forgotPasswordRequest, loginRequest,
  logoutRequest, meRequest, resetPasswordRequest,
} from './authFns';

const SESSION_ENDED = 'Your session has expired. Please sign in again.';
const KEEP_NOTICE = ['ACCOUNT_DISABLED', 'TENANT_SUSPENDED', 'NETWORK_ERROR'];

/** NOT persisted on purpose: the access token lives in memory only. The refresh cookie keeps the session. */
let initPromise = null;

export const useAuthStore = create((set, get) => {
  const signedIn = ({ accessToken, user }) => set({ accessToken, user, isAuthenticated: true, isLoading: false, error: '', notice: '' });

  /** Runs an async auth call with isLoading / error bookkeeping; rethrows so screens can map field errors. */
  const run = async (fn) => {
    set({ isLoading: true, error: '' });
    try {
      return await fn();
    } catch (err) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  };

  return {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isInitializing: true,
    isLoading: false,
    error: '',
    notice: '', // message to show on the login page (session ended, account disabled…)

    setAccessToken: (accessToken) => set({ accessToken }),
    clear: (notice = '') => set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false, error: '', notice }),

    /** App startup: refresh cookie → new access token → /auth/me. Safe to call twice (StrictMode); runs once. */
    initialize: () => {
      if (!initPromise) {
        initPromise = (async () => {
          try { localStorage.removeItem(STORAGE_KEYS.auth); } catch { /* ignore */ }
          try {
            await refreshAccessToken();
            const { user } = await meRequest();
            set({ user, isAuthenticated: true });
          } catch (err) {
            const notice = get().notice || (KEEP_NOTICE.includes(err.code) ? err.message : '');
            get().clear(notice);
          } finally {
            set({ isInitializing: false });
          }
        })();
      }
      return initPromise;
    },

    login: (email, password) =>
      run(async () => {
        const data = await loginRequest(email, password);
        signedIn(data);
        return data.user;
      }),

    acceptInvite: (token, password) =>
      run(async () => {
        const data = await acceptInviteRequest(token, password);
        signedIn(data);
        return data.user;
      }),

    logout: async () => {
      try { await logoutRequest(); } catch { /* the cookie may already be gone; sign out locally anyway */ }
      get().clear();
    },

    forgotPassword: (email) => run(() => forgotPasswordRequest(email)),

    resetPassword: (token, password) =>
      run(async () => {
        const data = await resetPasswordRequest(token, password);
        get().clear(); // the server signs the user out everywhere
        return data;
      }),

    changePassword: (currentPassword, newPassword) => run(() => changePasswordRequest(currentPassword, newPassword)),
  };
});

// Let the API client read / write the token and sign the user out without importing this store.
configureHttp({
  getToken: () => useAuthStore.getState().accessToken,
  setToken: (t) => useAuthStore.getState().setAccessToken(t),
  onAuthLost: (message) => useAuthStore.getState().clear(message || SESSION_ENDED),
});
