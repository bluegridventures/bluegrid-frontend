import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Spinner } from '../../../components/shared';
import AuthCard, { FormAlert } from '../../../components/Auth/AuthCard';
import AuthField from '../../../components/Auth/AuthField';
import useAuthForm from '../../../components/Auth/useAuthForm';
import { useAuthStore } from '../../../store/features/auth/useAuthStore';
import { validateConfirm, validateNewPassword } from '../../../utils/validators';
import { homeFor } from '../../../router/config';

export default function AcceptInvite() {
  const token = useSearchParams()[0].get('token') || '';
  const acceptInvite = useAuthStore((s) => s.acceptInvite);
  const isLoading = useAuthStore((s) => s.isLoading);
  const navigate = useNavigate();
  const form = useAuthForm({ password: '', confirm: '' }, (v) => ({
    password: validateNewPassword(v.password),
    confirm: validateConfirm(v.password, v.confirm),
  }));

  const onSubmit = form.submit(async (v) => {
    const user = await acceptInvite(token, v.password); // logs the user in immediately
    navigate(homeFor(user.role), { replace: true });
  });

  if (!token) {
    return (
      <AuthCard title="Accept invite" footer={<Link to="/login" className="font-semibold text-brand">Go to sign in</Link>}>
        <FormAlert>This invite link is invalid. Ask your admin to send a new invite.</FormAlert>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Welcome to Bluegrid" subtitle="Set a password to activate your account.">
      <form noValidate onSubmit={onSubmit}>
        <AuthField label="Password" type="password" autoComplete="new-password" hint="8 to 72 characters." value={form.values.password} onChange={form.set('password')} error={form.errors.password} />
        <AuthField label="Confirm password" type="password" autoComplete="new-password" value={form.values.confirm} onChange={form.set('confirm')} error={form.errors.confirm} />
        <FormAlert>{form.formError}</FormAlert>
        <Button variant="primary" type="submit" disabled={isLoading} className="mt-2 flex w-full items-center justify-center gap-2">
          {isLoading && <Spinner />} Activate account
        </Button>
      </form>
    </AuthCard>
  );
}
