// Demo accounts. Replace login() with http(ENDPOINTS.login, { method: 'POST', body }) later.
const DEMO_USERS = [
  { email: 'admin@example.test', password: 'password123', name: 'Taylor M.', initials: 'TM', role: 'admin' },
  { email: 'zack@example.test', password: 'password123', name: 'Zack', initials: 'Z', role: 'bde' },
];

export const demoAccounts = DEMO_USERS.map(({ email, password, role }) => ({ email, password, role }));

export async function login({ email, password }) {
  await new Promise((r) => setTimeout(r, 250));
  const u = DEMO_USERS.find((x) => x.email === email.trim().toLowerCase() && x.password === password);
  if (!u) throw new Error('Invalid email or password.');
  const { password: _omit, ...user } = u;
  return user;
}
