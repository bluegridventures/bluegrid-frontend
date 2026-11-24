import { create } from 'zustand';
import { registerReset } from '../../resetRegistry';
import { getSettingsRequest, updateSettingsRequest } from './settingsFns';
import { useAuthStore } from '../auth/useAuthStore';
import { useAdminStore } from '../admin/useAdminStore';

const initial = { settings: null, isLoading: false, isSaving: false, error: '' };

export const useSettingsStore = create((set) => ({
  ...initial,
  reset: () => set({ ...initial }),

  fetchSettings: async () => {
    set({ isLoading: true, error: '' });
    try {
      set({ settings: await getSettingsRequest() });
    } catch (err) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  /** `patch` = any of { name, timezone, defaultClaimLimit }. Throws ApiError (422 details -> field errors). */
  saveSettings: async (patch) => {
    set({ isSaving: true });
    try {
      const settings = await updateSettingsRequest(patch);
      set({ settings });
      useAuthStore.getState().patchTenant({ name: settings.name, timezone: settings.timezone }); // header updates now
      // Demo coupling: dummy dashboards still read name / zone / quota from the demo store, keep them in sync.
      useAdminStore.getState().updateSettings({ name: settings.name, zone: settings.timezone, quota: settings.defaultClaimLimit });
      return settings;
    } finally {
      set({ isSaving: false });
    }
  },
}));

registerReset(() => useSettingsStore.getState().reset());
