/** Build "?a=1&b=2" from an object. Blank / null / undefined values are left out. */
export const buildQuery = (obj = {}) => {
  const p = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v === '' || v == null) return;
    p.set(k, String(v).trim());
  });
  const s = p.toString();
  return s ? `?${s}` : '';
};
