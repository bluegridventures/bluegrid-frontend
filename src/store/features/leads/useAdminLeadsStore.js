import { create } from 'zustand';
import { registerReset } from '../../resetRegistry';
import { adminLeadsRequest, adminParams } from './leadsFns';
import { createListSlice } from './listSlice';

const initialFilters = { search: '', stage: '', ownerId: '', page: 1, limit: 20 };

/** Company admin Lead Management list (GET /admin/leads). */
export const useAdminLeadsStore = create((set, get) =>
  createListSlice({ fetcher: adminLeadsRequest, toParams: adminParams, initialFilters })(set, get),
);

registerReset(() => useAdminLeadsStore.getState().resetList());
