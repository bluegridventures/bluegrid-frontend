import Layout from './index';
import HeaderAccount from '../Auth/HeaderAccount';
import { useAuthStore } from '../../store/features/auth/useAuthStore';
import { useAdminStore } from '../../store/features/admin/useAdminStore';
import { adminNav, platformNav, bdeNav } from '../../router/config';

const PREVIEW_FOOTER = 'Auth is live · Dashboard data is still dummy · Changes saved in this browser';

export function AdminLayout() {
  const tenantName = useAuthStore((s) => s.user?.tenant?.name);
  const demoName = useAdminStore((s) => s.name);
  return (
    <Layout workspace={tenantName || demoName} headerRight={<HeaderAccount />} navItems={adminNav} navLabel="Administration" footer={PREVIEW_FOOTER} />
  );
}

export function PlatformLayout() {
  const platformName = useAdminStore((s) => s.platformName);
  return (
    <Layout workspace={platformName} headerRight={<HeaderAccount />} navItems={platformNav} navLabel="Platform administration" footer={PREVIEW_FOOTER} />
  );
}

export function BdeLayout() {
  const tenantName = useAuthStore((s) => s.user?.tenant?.name);
  const demoName = useAdminStore((s) => s.name);
  return (
    <Layout workspace={tenantName || demoName} headerRight={<HeaderAccount />} navItems={bdeNav} navLabel="BDE workspace" footer={PREVIEW_FOOTER} />
  );
}
