import { create } from 'zustand';
import { registerReset } from '../../resetRegistry';
import { useToastStore } from '../ui/useToastStore';
import { claimRequest, describeClaim, poolParams, poolRequest } from './leadsFns';
import { createListSlice } from './listSlice';

const initialFilters = {
  search: '', state: '', providerType: '', minScore: '', specialty: '', from: '', to: '',
  sort: 'score', page: 1, limit: 20,
};

/** Lead Pool: server filtering + pagination, selection that survives paging, and bulk / single claim. */
export const useLeadPoolStore = create((set, get) => ({
  ...createListSlice({
    fetcher: poolRequest,
    toParams: poolParams,
    initialFilters,
    onFiltersChange: () => ({ selectedIds: new Set() }), // a new filter clears the selection (paging does not)
  })(set, get),

  selectedIds: new Set(),
  lastClaim: null, // { requested, claimed, failed[], reasons[] } for the banner under the toolbar

  toggleSelect: (id) =>
    set((s) => {
      const next = new Set(s.selectedIds);
      next.has(id) ? next.delete(id) : next.add(id);
      return { selectedIds: next };
    }),
  clearSelection: () => set({ selectedIds: new Set() }),
  dismissClaimNotice: () => set({ lastClaim: null }),

  /** POST /leads/pool/claim. Partial success is a normal 200: failures are reported, then the pool is refetched. */
  claim: async (ids) => {
    const data = await claimRequest(ids);
    const { title, reasons } = describeClaim(ids.length, data);
    set((s) => ({
      meta: s.meta ? { ...s.meta, claimQuota: data.claimQuota } : s.meta,
      selectedIds: new Set(),
      lastClaim: data.failed.length ? { requested: ids.length, claimed: data.claimed.length, failed: data.failed, reasons } : null,
    }));
    useToastStore.getState().show([title, ...reasons].join(' · '));
    await get().fetch();
    return data;
  },
}));

registerReset(() => {
  useLeadPoolStore.getState().resetList();
  useLeadPoolStore.setState({ selectedIds: new Set(), lastClaim: null });
});
