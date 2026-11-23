import { http } from '../../http';
import { ENDPOINTS } from '../../constant';

const A = ENDPOINTS.auth;
const post = (path, body, auth = false) => http(path, { method: 'POST', body, auth });

/** Thin wrappers over the auth API. Each one resolves with the response `data` or throws ApiError. */
export const loginRequest = (email, password) => post(A.login, { email, password });
export const logoutRequest = () => post(A.logout);
export const meRequest = () => http(A.me);
export const acceptInviteRequest = (token, password) => post(A.acceptInvite, { token, password });
export const forgotPasswordRequest = (email) => post(A.forgotPassword, { email });
export const resetPasswordRequest = (token, password) => post(A.resetPassword, { token, password });
export const changePasswordRequest = (currentPassword, newPassword) =>
  post(A.changePassword, { currentPassword, newPassword }, true);
