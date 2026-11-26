import { ENDPOINTS } from './constant';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1').replace(/\/+$/, '');
const A = ENDPOINTS.auth;

/** Never try a token refresh for these (public / cookie-only endpoints). */
const NO_REFRESH = [A.login, A.refresh, A.logout, A.acceptInvite, A.forgotPassword, A.resetPassword];
const ACCOUNT_BLOCKED = ['ACCOUNT_DISABLED', 'TENANT_SUSPENDED'];

/** Normalized error: every failure (network, 4xx, 5xx) looks like { code, message, details, status }. */
export class ApiError extends Error {
  constructor({ code, message, details = [], status = 0, reasonCode = '' }) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
    this.status = status;
    this.reasonCode = reasonCode; // e.g. SEAT_LIMIT_REACHED / INVALID_STATE (code is BUSINESS_RULE_VIOLATION)
  }
}

/**
 * The auth store plugs itself in here (see useAuthStore.js) so this file never imports the store
 * (avoids a circular import).
 */
const bridge = { getToken: () => null, setToken: () => {}, onAuthLost: () => {} };
export const configureHttp = (next) => Object.assign(bridge, next);

const networkError = () =>
  new ApiError({ code: 'NETWORK_ERROR', message: 'Cannot reach the server. Check your connection and try again.', status: 0 });

function toApiError(status, json) {
  const e = json?.error || {};
  const code = e.code || (status === 429 ? 'RATE_LIMITED' : 'UNKNOWN_ERROR');
  const message =
    status === 429 || code === 'RATE_LIMITED'
      ? 'Too many attempts, try again in a few minutes.'
      : e.message || 'Something went wrong. Please try again.';
  return new ApiError({ code, message, details: Array.isArray(e.details) ? e.details : [], status, reasonCode: e.reasonCode || '' });
}

/** One network call, no refresh logic. Resolves with `data`, rejects with ApiError. */
async function rawRequest(path, { method = 'GET', body, token, withMeta = false } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  let res;
  try {
    res = await fetch(BASE_URL + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: 'include', // sends / receives the httpOnly bg_refresh cookie
    });
  } catch {
    throw networkError();
  }
  const json = await res.json().catch(() => null);
  if (res.ok && json?.success) return withMeta ? { data: json.data, meta: json.meta ?? null } : json.data;
  throw toApiError(res.status, json);
}

/** Single shared in-flight refresh: parallel 401s all wait for ONE /auth/refresh call. */
let refreshing = null;
export function refreshAccessToken() {
  if (!refreshing) {
    refreshing = rawRequest(A.refresh, { method: 'POST' })
      .then(({ accessToken }) => {
        bridge.setToken(accessToken);
        return accessToken;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

const shouldRefresh = (path, err) =>
  err.status === 401 &&
  !NO_REFRESH.includes(path) &&
  err.code !== 'INVALID_CREDENTIALS' &&
  (err.code === 'TOKEN_EXPIRED' || (err.code === 'UNAUTHORIZED' && !path.startsWith('/auth/')));

/**
 * The one API client.  data = await http('/auth/me')
 *  - adds the Bearer token when `auth` is true (default) and a token exists
 *  - on an expired token: refreshes once, retries the request once
 *  - on a dead session or a disabled account: tells the auth store to sign out
 */
export async function http(path, { method = 'GET', body, auth = true, meta = false } = {}) {
  // meta: true -> resolves { data, meta } (paginated lists) instead of just `data`
  const send = () => rawRequest(path, { method, body, token: auth ? bridge.getToken() : null, withMeta: meta });
  try {
    return await send();
  } catch (err) {
    if (!(err instanceof ApiError)) throw err;
    let final = err;
    if (shouldRefresh(path, err)) {
      try {
        await refreshAccessToken();
      } catch (refreshErr) {
        if (refreshErr.status === 401) {
          bridge.onAuthLost(); // refresh cookie is gone/expired: session is over
          throw err;
        }
        throw refreshErr; // e.g. network error: keep the session, just fail this call
      }
      try {
        return await send(); // retry exactly once
      } catch (retryErr) {
        final = retryErr;
      }
    }
    if (final.status === 403 && ACCOUNT_BLOCKED.includes(final.code) && path !== A.login) {
      bridge.onAuthLost(final.message);
    }
    throw final;
  }
}
