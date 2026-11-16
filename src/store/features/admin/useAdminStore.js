import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { STORAGE_KEYS } from '../../constant';
import { createAdminSeed } from '../../../utils/data';
import * as fns from './adminFns';
import { safeStorage } from '../../../utils/utils';

const DATA_KEYS = ['name', 'zone', 'quota', 'agents', 'leads', 'events', 'imports', 'rules', 'transfers', 'meetings', 'clients', 'tenants', 'plans', 'ledger', 'platformName'];
const pickData = (s) => Object.fromEntries(DATA_KEYS.map((k) => [k, s[k]]));

export const useAdminStore = create(
  persist(
    (set, get) => {
      // Runs a mutation on a cloned draft, then commits it. Throws bubble to the caller (forms).
      const mutate = (fn) => (payload) => {
        const draft = structuredClone(pickData(get()));
        const result = fn(draft, payload);
        set(draft);
        return result;
      };
      return {
        ...createAdminSeed(),
        reassignLeads: mutate(fns.reassignLeads),
        saveAgent: mutate(fns.saveAgent),
        changeAgentStatus: mutate(fns.changeAgentStatus),
        cancelTransfer: mutate(fns.cancelTransfer),
        saveRules: mutate(fns.saveRules),
        prepareBatch: mutate(fns.prepareBatch),
        publishBatch: mutate(fns.publishBatch),
        syncClaims: mutate(fns.syncClaims),
        scheduleMeeting: mutate(fns.scheduleMeeting),
        updateMeeting: mutate(fns.updateMeeting),
        recordFinancialStep: mutate(fns.recordFinancialStep),
        updateSettings: mutate(fns.updateSettings),
        saveTenant: mutate(fns.saveTenant),
        savePlan: mutate(fns.savePlan),
        addLedgerEntry: mutate(fns.addLedgerEntry),
        savePlatformName: mutate(fns.savePlatformName),
        resetDemo: () => set(createAdminSeed()),
      };
    },
    { name: STORAGE_KEYS.admin, partialize: pickData, storage: createJSONStorage(() => safeStorage) },
  ),
);
