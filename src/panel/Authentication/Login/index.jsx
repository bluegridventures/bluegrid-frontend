import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Field, Spinner } from '../../../components/shared';
import { useAuthStore } from '../../../store/features/auth/useAuthStore';
import { demoAccounts } from '../../../store/features/auth/authFns';
import { homeFor } from '../../../router/config';

export default function Login() {
  const { signIn, loading, error } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });

  const submit = async (e) => {
    e.preventDefault();
    const user = await signIn(form);
    if (user) navigate(homeFor(user.role), { replace: true });
  };

  return (
    <div className="grid min-h-screen place-items-center bg-page p-4">
      <div className="w-full max-w-[420px] rounded-xl border border-line bg-white p-7">
        <span className="mb-5 flex items-center gap-[9px] text-[26px] font-bold tracking-[-1px] text-header">
          <i
            aria-hidden="true"
            className="block h-6 w-6 bg-[#76d4ac]"
            style={{ backgroundImage: 'linear-gradient(90deg,transparent 43%,#142e3c 43% 57%,transparent 57%),linear-gradient(transparent 43%,#142e3c 43% 57%,transparent 57%)' }}
          />
          Bluegrid
        </span>
        <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
        <p className="mt-1 text-muted">Use a demo account to open the Admin console or the BDE workspace.</p>
        <form onSubmit={submit} className="mt-4">
          <label className="my-2.5 grid gap-1 font-semibold">
            Email
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-md border border-field px-2.5 py-2" />
          </label>
          <label className="my-2.5 grid gap-1 font-semibold">
            Password
            <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="rounded-md border border-field px-2.5 py-2" />
          </label>
          <p role="alert" className="text-danger">{error}</p>
          <Button variant="primary" type="submit" className="mt-2 flex w-full items-center justify-center gap-2" disabled={loading}>
            {loading && <Spinner />} Sign in
          </Button>
        </form>
        <div className="mt-5 border-t border-line pt-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Demo accounts</p>
          <div className="flex flex-wrap gap-2">
            {demoAccounts.map((a) => (
              <Button key={a.email} onClick={() => setForm({ email: a.email, password: a.password })}>
                {a.role === 'admin' ? 'Admin console' : 'BDE workspace'}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
