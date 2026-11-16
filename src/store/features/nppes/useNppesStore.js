import { create } from 'zustand';
import { clearWeekly, importWeeklyZip, loadDemoFile, readSavedWeekly, saveWeekly } from './nppesFns';

/**
 * The weekly NPPES file (thousands of providers). Kept in memory and saved in IndexedDB so it survives
 * a page reload — too big for localStorage. status: idle | loading | importing | ready | empty | error
 */
export const useNppesStore = create((set, get) => ({
  status: 'idle',
  meta: null,
  providers: [],
  progress: 0,
  error: '',

  load: async () => {
    if (['loading', 'importing', 'ready'].includes(get().status)) return;
    set({ status: 'loading', error: '' });
    const data = (await readSavedWeekly()) || (await loadDemoFile());
    if (data?.providers) set({ status: 'ready', meta: data.meta, providers: data.providers });
    else set({ status: 'empty' });
  },

  importZip: async (file) => {
    set({ status: 'importing', progress: 0, error: '' });
    try {
      const data = await importWeeklyZip(file, (progress) => set({ progress }));
      await saveWeekly(data);
      set({ status: 'ready', meta: data.meta, providers: data.providers, progress: 100 });
      return data;
    } catch (err) {
      set({ status: get().providers.length ? 'ready' : 'error', error: err.message });
      throw err;
    }
  },

  clear: async () => {
    await clearWeekly();
    set({ status: 'empty', meta: null, providers: [], error: '' });
  },
}));
