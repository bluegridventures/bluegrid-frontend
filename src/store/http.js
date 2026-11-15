const BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Thin fetch wrapper. Not used yet (stores run on dummy data) — the *Fns.js files
 * in src/store/features are where calls to this will replace the local logic.
 */
export async function http(path, { method = 'GET', body, headers = {} } = {}) {
  const res = await fetch(BASE_URL + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}
