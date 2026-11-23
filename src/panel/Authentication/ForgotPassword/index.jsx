import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Spinner } from '../../../components/shared';
import AuthCard, { FormAlert } from '../../../components/Auth/AuthCard';
import AuthField from '../../../components/Auth/AuthField';
import useAuthForm from '../../../components/Auth/useAuthForm';
import { useAuthStore } from '../../../store/features/auth/useAuthStore';
import { validateEmail } from '../../../utils/validators';

export default function ForgotPassword() {
  const forgotPassword = useAuthStore((s) => s.forgotPassword);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [sent, setSent] = useState(false);
  const form = useAuthForm({ email: '' }, (v) => ({ email: validateEmail(v.email) }));

  const onSubmit = form.submit(async (v) => {
    await forgotPassword(v.email.trim());
    setSent(true); // the API always answers sent:true, so the message stays neutral
  });

  return (
    <AuthCard
      title="Forgot password"
      subtitle="Enter your email and we will send you a reset link."
      footer={<Link to="/login" className="font-semibold text-brand">Back to sign in</Link>}
    >
      {sent ? (
        <FormAlert type="success">If this email exists, a reset link has been sent.</FormAlert>
      ) : (
        <form noValidate onSubmit={onSubmit}>
          <AuthField label="Email" type="email" autoComplete="email" value={form.values.email} onChange={form.set('email')} error={form.errors.email} />
          <FormAlert>{form.formError}</FormAlert>
          <Button variant="primary" type="submit" disabled={isLoading} className="mt-2 flex w-full items-center justify-center gap-2">
            {isLoading && <Spinner />} Send reset link
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
