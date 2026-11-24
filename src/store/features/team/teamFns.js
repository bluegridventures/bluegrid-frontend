import { http } from '../../http';
import { ENDPOINTS } from '../../constant';

const T = ENDPOINTS.team;
const post = (path, body) => http(path, { method: 'POST', body });

const query = (obj) => {
  const p = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => v !== '' && v != null && p.set(k, String(v)));
  const s = p.toString();
  return s ? `?${s}` : '';
};

/** Thin wrappers over the team API. Each resolves with response `data` or throws ApiError. */
export const listTeamRequest = ({ search = '', status = '' } = {}) => http(T + query({ search: search.trim(), status }));
export const createMemberRequest = (body) => post(T, body);
export const getMemberRequest = (id) => http(`${T}/${id}`);
export const updateMemberRequest = (id, body) => http(`${T}/${id}`, { method: 'PATCH', body });
export const suspendPreviewRequest = (id) => http(`${T}/${id}/suspend/preview`);
export const suspendRequest = (id, reason) => post(`${T}/${id}/suspend`, { reason });
export const reactivateRequest = (id, reason) => post(`${T}/${id}/reactivate`, { reason });
export const revokeInviteRequest = (id, reason) => post(`${T}/${id}/revoke-invite`, { reason });
export const resendInviteRequest = (id) => post(`${T}/${id}/resend-invite`);

/** Dropdown helper (transfer recipient, meeting participants, new owner). Active sales users only. */
export const listMembersRequest = ({ excludeSelf = false } = {}) =>
  http(ENDPOINTS.teamMembers + query({ excludeSelf: excludeSelf ? 'true' : '' }));
