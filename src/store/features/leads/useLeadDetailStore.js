import { create } from 'zustand';
import { registerReset } from '../../resetRegistry';
import { friendlyError } from './errors';
import { addContactRequest, leadDetailRequest, shareLeadRequest } from './leadsFns';

const initial = { detail: null, isLoading: false, error: '' };

/** The lead detail dialog's data: GET /leads/:id, then updated in place from contact / share responses. */
export const useLeadDetailStore = create((set, get) => {
  let seq = 0;
  const patchLead = (id, patch) =>
    set((s) => (s.detail?.lead.id === id ? { detail: { ...s.detail, lead: { ...s.detail.lead, ...patch } } } : s));

  return {
    ...initial,

    /** silent: keep showing the current data while refreshing (no spinner). */
    openLead: async (id, { silent = false } = {}) => {
      const mine = ++seq;
      const keep = silent && get().detail?.lead.id === id;
      set({ isLoading: !keep, error: '', ...(keep ? {} : { detail: null }) });
      try {
        const data = await leadDetailRequest(id);
        if (mine === seq) set({ detail: data });
      } catch (err) {
        if (mine === seq && !keep) set({ error: friendlyError(err) });
      } finally {
        if (mine === seq) set({ isLoading: false });
      }
    },

    close: () => { seq += 1; set({ ...initial }); },

    /** POST /leads/:id/contacts. 409 DUPLICATE_CONTACT is shown under the value field. */
    addContact: async (id, body) => {
      let res;
      try {
        res = await addContactRequest(id, body);
      } catch (err) {
        if (err.code === 'DUPLICATE_CONTACT') err.fieldErrors = { value: err.message };
        throw err;
      }
      patchLead(id, { phones: res.phones, email: res.email });
      get().openLead(id, { silent: true }); // refresh the history in the background
      return res;
    },

    /** POST /leads/:id/share (read-only). */
    shareLead: async (id, body) => {
      const res = await shareLeadRequest(id, body);
      patchLead(id, { sharedWith: res.sharedWith });
      get().openLead(id, { silent: true });
      return res;
    },
  };
});

registerReset(() => useLeadDetailStore.getState().close());
