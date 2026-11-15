import { Outlet } from 'react-router-dom';
import Header from '../Header';
import Navbar from '../Navbar';
import { ShowToast } from '../shared';

/** Generic portal shell: header, top navigation, routed content, footer. */
export default function Layout({ workspace, headerRight, navItems, navLabel, footer }) {
  return (
    <div className="min-h-screen">
      <Header workspace={workspace}>{headerRight}</Header>
      <Navbar items={navItems} label={navLabel} />
      <main className="mx-auto max-w-[1840px] px-[clamp(16px,3.7vw,66px)] py-[30px] max-sm:py-5">
        <Outlet />
        <footer className="my-2 text-xs text-muted">{footer}</footer>
      </main>
      <ShowToast />
    </div>
  );
}
