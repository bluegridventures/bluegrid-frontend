import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Spinner } from '../../../components/shared';
import AuthCard, { FormAlert } from '../../../components/Auth/AuthCard';
import AuthField from '../../../components/Auth/AuthField';
import useAuthForm from '../../../components/Auth/useAuthForm';
import { useAuthStore } from '../../../store/features/auth/useAuthStore';
import { validateEmail, validateRequired } from '../../../utils/validators';
import { canAccess, homeFor } from '../../../router/config';

export default function Login() {
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const notice = useAuthStore((s) => s.notice); // "session expired", "account disabled"...
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message; // e.g. "Password reset. Sign in with your new password."

  const form = useAuthForm({ email: '', password: '' }, (v) => ({
    email: validateEmail(v.email),
    password: validateRequired('Password')(v.password),
  }));

  const onSubmit = form.submit(async (v) => {
    const user = await login(v.email.trim(), v.password);
    const from = location.state?.from?.pathname;
    // go back to the page the user wanted, but only if their role may open it
    navigate(from && canAccess(user.role, from) ? from : homeFor(user.role), { replace: true });
  });

  return (
    <AuthCard title="Sign in" subtitle="Use your Bluegrid account.">
      <form noValidate onSubmit={onSubmit}>
        <FormAlert type="success">{message}</FormAlert>
        <FormAlert type="warn">{notice}</FormAlert>
        <AuthField label="Email" type="email" autoComplete="username" value={form.values.email} onChange={form.set('email')} error={form.errors.email} />
        <AuthField label="Password" type="password" autoComplete="current-password" value={form.values.password} onChange={form.set('password')} error={form.errors.password} />
        <FormAlert>{form.formError}</FormAlert>
        <Button variant="primary" type="submit" disabled={isLoading} className="mt-2 flex w-full items-center justify-center gap-2">
          {isLoading && <Spinner />} Sign in
        </Button>
        <p className="mt-3 text-center text-sm">
          <Link to="/forgot-password" className="font-semibold text-brand">Forgot password?</Link>
        </p>
      </form>
    </AuthCard>
  );
}
