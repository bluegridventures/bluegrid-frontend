import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Spinner } from '../../../components/shared';
import AuthCard, { FormAlert } from '../../../components/Auth/AuthCard';
import AuthField from '../../../components/Auth/AuthField';
import useAuthForm from '../../../components/Auth/useAuthForm';
import { useAuthStore } from '../../../store/features/auth/useAuthStore';
import { validateConfirm, validateNewPassword } from '../../../utils/validators';

export default function ResetPassword() {
  const token = useSearchParams()[0].get('token') || '';
  const resetPassword = useAuthStore((s) => s.resetPassword);
  const isLoading = useAuthStore((s) => s.isLoading);
  const navigate = useNavigate();
  const form = useAuthForm({ password: '', confirm: '' }, (v) => ({
    password: validateNewPassword(v.password),
    confirm: validateConfirm(v.password, v.confirm),
  }));

  const onSubmit = form.submit(async (v) => {
    await resetPassword(token, v.password);
    navigate('/login', { replace: true, state: { message: 'Password updated. Sign in with your new password.' } });
  });

  const back = <Link to="/login" className="font-semibold text-brand">Back to sign in</Link>;

  if (!token) {
    return (
      <AuthCard title="Reset password" footer={back}>
        <FormAlert>This reset link is invalid. Request a new one from the Forgot password page.</FormAlert>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Reset password" subtitle="Choose a new password." footer={back}>
      <form noValidate onSubmit={onSubmit}>
        <AuthField label="New password" type="password" autoComplete="new-password" hint="8 to 72 characters." value={form.values.password} onChange={form.set('password')} error={form.errors.password} />
        <AuthField label="Confirm password" type="password" autoComplete="new-password" value={form.values.confirm} onChange={form.set('confirm')} error={form.errors.confirm} />
        <FormAlert>{form.formError}</FormAlert>
        <Button variant="primary" type="submit" disabled={isLoading} className="mt-2 flex w-full items-center justify-center gap-2">
          {isLoading && <Spinner />} Reset password
        </Button>
      </form>
    </AuthCard>
  );
}
