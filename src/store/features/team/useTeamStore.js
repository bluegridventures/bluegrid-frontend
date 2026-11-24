import { create } from 'zustand';
import { registerReset } from '../../resetRegistry';
import {
  createMemberRequest, listTeamRequest, reactivateRequest, resendInviteRequest,
  revokeInviteRequest, suspendRequest, updateMemberRequest,
} from './teamFns';

const initial = { members: [], filters: { search: '', status: '' }, isLoading: false, hasLoaded: false, error: '' };

/** 409 DUPLICATE_EMAIL belongs under the email field: FormModal reads `err.fieldErrors`. */
async function withFieldErrors(fn) {
  try {
    return await fn();
  } catch (err) {
    if (err.code === 'DUPLICATE_EMAIL') {
      err.fieldErrors = { email: err.message || 'That work email already belongs to a team member.' };
    }
    throw err;
  }
}

export const useTeamStore = create((set, get) => {
  let seq = 0; // ignore out-of-order responses (fast typing in the search box)

  /** Run a mutation, then refresh the list with the current filters. Errors propagate to the modal. */
  const mutate = async (fn) => {
    const data = await withFieldErrors(fn);
    await get().fetchTeam();
    return data;
  };

  return {
    ...initial,

    setFilters: (patch) => set((s) => ({ filters: { ...s.filters, ...patch } })),
    reset: () => set({ ...initial, filters: { ...initial.filters } }),

    fetchTeam: async () => {
      const id = ++seq;
      set({ isLoading: true, error: '' });
      try {
        const members = await listTeamRequest(get().filters);
        if (id === seq) set({ members, hasLoaded: true });
      } catch (err) {
        if (id === seq) set({ error: err.message });
      } finally {
        if (id === seq) set({ isLoading: false });
      }
    },

    createMember: (body) => mutate(() => createMemberRequest(body)),
    updateMember: (id, body) => mutate(() => updateMemberRequest(id, body)),
    suspend: (id, reason) => mutate(() => suspendRequest(id, reason)),
    reactivate: (id, reason) => mutate(() => reactivateRequest(id, reason)),
    revokeInvite: (id, reason) => mutate(() => revokeInviteRequest(id, reason)),
    resendInvite: (id) => mutate(() => resendInviteRequest(id)),
  };
});

registerReset(() => useTeamStore.getState().reset());
