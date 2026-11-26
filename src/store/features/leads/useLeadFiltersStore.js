import { useEffect } from 'react';
import { create } from 'zustand';
import { registerReset } from '../../resetRegistry';
import { leadFiltersRequest } from './leadsFns';

const EMPTY = { providerTypes: ['Individual', 'Organization'], states: [], specialties: [], stages: [] };

/** Dropdown options per scope ('pool' | 'mine') from GET /leads/filters. */
export const useLeadFiltersStore = create((set) => ({
  options: { pool: null, mine: null },
  error: '',
  load: async (scope) => {
    try {
      const data = await leadFiltersRequest(scope);
      set((s) => ({ options: { ...s.options, [scope]: { ...EMPTY, ...data } }, error: '' }));
    } catch (err) {
      set({ error: err.message }); // the page still works, the dropdowns just stay short
    }
  },
}));

registerReset(() => useLeadFiltersStore.setState({ options: { pool: null, mine: null }, error: '' }));

/** const options = useLeadFilterOptions('pool')  -> fetched once each time the page mounts. */
export function useLeadFilterOptions(scope) {
  const options = useLeadFiltersStore((s) => s.options[scope]);
  const load = useLeadFiltersStore((s) => s.load);
  useEffect(() => { load(scope); }, [scope, load]);
  return options || EMPTY;
}
