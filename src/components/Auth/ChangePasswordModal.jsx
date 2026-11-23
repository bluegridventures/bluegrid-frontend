import { Button, Modal, Spinner, showToast } from '../shared';
import AuthField from './AuthField';
import { FormAlert } from './AuthCard';
import useAuthForm from './useAuthForm';
import { useAuthStore } from '../../store/features/auth/useAuthStore';
import { validateConfirm, validateNewPassword, validateRequired } from '../../utils/validators';

export default function ChangePasswordModal({ onClose }) {
  const changePassword = useAuthStore((s) => s.changePassword);
  const isLoading = useAuthStore((s) => s.isLoading);
  const form = useAuthForm({ currentPassword: '', newPassword: '', confirm: '' }, (v) => ({
    currentPassword: validateRequired('Current password')(v.currentPassword),
    newPassword: validateNewPassword(v.newPassword),
    confirm: validateConfirm(v.newPassword, v.confirm),
  }));

  const onSubmit = form.submit(async (v) => {
    try {
      await changePassword(v.currentPassword, v.newPassword);
    } catch (err) {
      if (err.code === 'INVALID_CREDENTIALS') {
        // wrong current password: a form error, NOT a session problem
        form.setErrors({ currentPassword: 'Current password is incorrect.' });
        return;
      }
      throw err;
    }
    showToast('Password changed.');
    onClose();
  });

  return (
    <Modal title="Change password" onClose={onClose}>
      <form noValidate onSubmit={onSubmit} className="max-w-[420px]">
        <AuthField label="Current password" type="password" autoComplete="current-password" value={form.values.currentPassword} onChange={form.set('currentPassword')} error={form.errors.currentPassword} />
        <AuthField label="New password" type="password" autoComplete="new-password" hint="8 to 72 characters." value={form.values.newPassword} onChange={form.set('newPassword')} error={form.errors.newPassword} />
        <AuthField label="Confirm new password" type="password" autoComplete="new-password" value={form.values.confirm} onChange={form.set('confirm')} error={form.errors.confirm} />
        <FormAlert>{form.formError}</FormAlert>
        <p className="my-2 text-xs text-muted">Your other devices will be signed out. This one stays signed in.</p>
        <div className="mt-3 flex gap-2">
          <Button variant="primary" type="submit" disabled={isLoading} className="flex items-center gap-2">
            {isLoading && <Spinner />} Change password
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  );
}
