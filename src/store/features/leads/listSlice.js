import { friendlyError } from './errors';

/**
 * Shared server-list state for pool / mine / admin leads.
 *   fetcher(params) -> { data, meta }     toParams(filters) -> query params
 * Rules: changing a filter resets to page 1 (setFilters); paging keeps everything else (setPage);
 * out-of-order responses are ignored; an emptied last page jumps back to the new last page.
 */
export function createListSlice({ fetcher, toParams, initialFilters, onFiltersChange = () => ({}) }) {
  return (set, get) => {
    let seq = 0;
    const fresh = () => ({ items: [], meta: null, filters: { ...initialFilters }, isLoading: false, hasLoaded: false, error: '' });
    return {
      ...fresh(),
      resetList: () => { seq += 1; set(fresh()); },
      setFilters: (patch) => set((s) => ({ filters: { ...s.filters, ...patch, page: 1 }, ...onFiltersChange(s) })),
      setPage: (page) => set((s) => ({ filters: { ...s.filters, page } })),
      fetch: async () => {
        const id = ++seq;
        set({ isLoading: true, error: '' });
        try {
          const { data, meta } = await fetcher(toParams(get().filters));
          if (id !== seq) return;
          set({ items: data, meta, hasLoaded: true });
          if (meta?.totalPages >= 1 && meta.page > meta.totalPages) {
            set((s) => ({ filters: { ...s.filters, page: meta.totalPages } }));
            await get().fetch();
          }
        } catch (err) {
          if (id === seq) set({ error: friendlyError(err) });
        } finally {
          if (id === seq) set({ isLoading: false });
        }
      },
    };
  };
}
