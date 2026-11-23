// Client-side rules mirror the server (zod): email format, password 8-72 characters.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmail = (v) => {
  const s = String(v || '').trim();
  if (!s) return 'Email is required.';
  return EMAIL_RE.test(s) ? '' : 'Enter a valid email address.';
};

export const validateRequired = (label) => (v) => (v ? '' : `${label} is required.`);

export const validateNewPassword = (v) => {
  if (!v) return 'Password is required.';
  if (v.length < 8) return 'Password must be at least 8 characters.';
  if (v.length > 72) return 'Password must be at most 72 characters.';
  return '';
};

export const validateConfirm = (password, confirm) => {
  if (!confirm) return 'Please confirm the password.';
  return password === confirm ? '' : 'Passwords do not match.';
};
