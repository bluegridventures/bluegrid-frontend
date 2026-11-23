import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../Header';
import { Button } from '../shared';
import ChangePasswordModal from './ChangePasswordModal';
import { useAuthStore } from '../../store/features/auth/useAuthStore';
import { ROLE_LABELS } from '../../store/constant';

const initialsOf = (name = '') =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';

/** Real signed-in user in the portal header: name, role, Change password, Sign out. */
export default function HeaderAccount() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [changing, setChanging] = useState(false);
  if (!user) return null;

  return (
    <>
      <span className="text-right leading-tight max-sm:hidden">
        {user.name}
        <span className="block text-xs text-[#a9bec6]">{ROLE_LABELS[user.role] || user.role}</span>
      </span>
      <Avatar initials={initialsOf(user.name)} />
      <Button variant="ghost" className="text-xs text-[#d4e2e7]" onClick={() => setChanging(true)}>Change password</Button>
      <Button
        variant="ghost"
        className="text-xs text-[#d4e2e7]"
        onClick={async () => {
          await logout();
          navigate('/login', { replace: true });
        }}
      >
        Sign out
      </Button>
      {changing && <ChangePasswordModal onClose={() => setChanging(false)} />}
    </>
  );
}
