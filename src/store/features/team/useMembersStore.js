import { useEffect } from 'react';
import { create } from 'zustand';
import { registerReset } from '../../resetRegistry';
import { listMembersRequest } from './teamFns';

const empty = () => ({ items: [], isLoading: false, error: '' });
const initial = () => ({ lists: { all: empty(), others: empty() } });

/** Cache of GET /team/members for the dropdowns. `others` = excludeSelf=true (BDE forms). */
export const useMembersStore = create((set, get) => ({
  ...initial(),
  reset: () => set(initial()),
  load: async (excludeSelf = false) => {
    const key = excludeSelf ? 'others' : 'all';
    const patch = (p) => set((s) => ({ lists: { ...s.lists, [key]: { ...s.lists[key], ...p } } }));
    patch({ isLoading: true, error: '' });
    try {
      patch({ items: await listMembersRequest({ excludeSelf }) });
    } catch (err) {
      patch({ error: err.message });
    } finally {
      patch({ isLoading: false });
    }
  },
}));

registerReset(() => useMembersStore.getState().reset());

/**
 * Dropdown data:  const { members, isLoading, error, reload } = useMembersPicker({ excludeSelf: true });
 * members = [{ id, name, role }]. Refetches every time a form mounts so the list is fresh.
 */
export function useMembersPicker({ excludeSelf = false } = {}) {
  const key = excludeSelf ? 'others' : 'all';
  const list = useMembersStore((s) => s.lists[key]);
  const load = useMembersStore((s) => s.load);
  useEffect(() => { load(excludeSelf); }, [excludeSelf, load]);
  return { members: list.items, isLoading: list.isLoading, error: list.error, reload: () => load(excludeSelf) };
}
