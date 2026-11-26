import { create } from 'zustand';
import { registerReset } from '../../resetRegistry';
import { mineParams, mineRequest } from './leadsFns';
import { createListSlice } from './listSlice';

const initialFilters = {
  search: '', state: '', providerType: '', stage: '', minScore: '', specialty: '', from: '', to: '', priority: '',
  sort: 'score', page: 1, limit: 20,
};

/** My Leads: the signed-in user's open leads (the server hides closed ones). */
export const useMyLeadsStore = create((set, get) =>
  createListSlice({ fetcher: mineRequest, toParams: mineParams, initialFilters })(set, get),
);

registerReset(() => useMyLeadsStore.getState().resetList());
