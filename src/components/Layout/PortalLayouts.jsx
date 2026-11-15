import { useLocation, useNavigate } from 'react-router-dom';
import Layout from './index';
import { Avatar } from '../Header';
import { Button } from '../shared';
import { useAuthStore } from '../../store/features/auth/useAuthStore';
import { useAdminStore } from '../../store/features/admin/useAdminStore';
import { adminNav, platformNav, bdeNav } from '../../router/config';

const headerSelect = 'rounded-md border border-[#52717c] bg-[#244554] px-2.5 py-2 text-white max-sm:w-[145px]';

function SignOut() {
  const signOut = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();
  return (
    <Button variant="ghost" className="text-xs text-[#d4e2e7]" onClick={() => { signOut(); navigate('/login'); }}>
      Sign out
    </Button>
  );
}

function AdminAccount() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const portal = pathname.startsWith('/platform') ? 'Platform admin' : 'Company admin';
  return (
    <>
      <select
        aria-label="Preview admin portal"
        value={portal}
        onChange={(e) => navigate(e.target.value === 'Platform admin' ? '/platform' : '/admin')}
        className={headerSelect}
      >
        <option>Company admin</option>
        <option>Platform admin</option>
      </select>
      <Avatar initials="TM" />
      <SignOut />
    </>
  );
}

export function AdminLayout() {
  const name = useAdminStore((s) => s.name);
  return (
    <Layout
      workspace={name}
      headerRight={<AdminAccount />}
      navItems={adminNav}
      navLabel="Administration"
      footer="Interactive admin preview · Fictional records · Changes saved in this browser"
    />
  );
}

export function PlatformLayout() {
  const platformName = useAdminStore((s) => s.platformName);
  return (
    <Layout
      workspace={platformName}
      headerRight={<AdminAccount />}
      navItems={platformNav}
      navLabel="Platform administration"
      footer="Interactive admin preview · Fictional records · Changes saved in this browser"
    />
  );
}

export function BdeLayout() {
  const name = useAdminStore((s) => s.name);
  const user = useAuthStore((s) => s.user);
  return (
    <Layout
      workspace={name}
      headerRight={
        <>
          <span>
            {user?.name} <span className="max-sm:hidden">· Business development executive</span>
          </span>
          <Avatar initials={user?.initials || 'Z'} />
          <SignOut />
        </>
      }
      navItems={bdeNav}
      navLabel="BDE workspace"
      footer="Offline BDE preview · Fictional providers · Browser-local demo data"
    />
  );
}
