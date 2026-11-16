import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { STORAGE_KEYS } from '../../constant';
import { createBdeSeed } from '../../../utils/data';
import * as fns from './bdeFns';
import { safeStorage } from '../../../utils/utils';

const pickData = (s) => ({ leads: s.leads, calls: s.calls, claims: s.claims });

export const useBdeStore = create(
  persist(
    (set, get) => {
      const mutate = (fn) => (payload) => {
        const draft = structuredClone(pickData(get()));
        const result = fn(draft, payload);
        set(draft);
        return result;
      };
      return {
        ...createBdeSeed(),
        claimLeads: mutate(fns.claimLeads),
        addPoolLeads: mutate(fns.addPoolLeads),
        recordDisposition: mutate(fns.recordDisposition),
        requestHandoff: mutate(fns.requestHandoff),
        addContact: mutate(fns.addContact),
        acceptTransfer: mutate(fns.acceptTransfer),
        rejectTransfer: mutate(fns.rejectTransfer),
        cancelTransfer: mutate(fns.cancelTransfer),
        rescheduleFollowUp: mutate(fns.rescheduleFollowUp),
        completeFollowUp: mutate(fns.completeFollowUp),
        updateMeeting: mutate(fns.updateMeeting),
        resetDemo: () => set(createBdeSeed()),
      };
    },
    { name: STORAGE_KEYS.bde, partialize: pickData, storage: createJSONStorage(() => safeStorage) },
  ),
);
