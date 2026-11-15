import { NavLink } from 'react-router-dom';
import { cn } from '../../utils/utils';

/** items: [{ label, to, end? }] */
export default function Navbar({ items, label }) {
  return (
    <nav aria-label={label} className="sticky top-0 z-10 flex gap-[22px] overflow-auto border-b border-line bg-white px-[clamp(16px,3.7vw,66px)] max-lg:gap-4">
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          end={it.end}
          className={({ isActive }) =>
            cn(
              'whitespace-nowrap border-b-[3px] py-[13px] text-xs font-semibold',
              isActive ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-ink',
            )
          }
        >
          {it.label}
        </NavLink>
      ))}
    </nav>
  );
}
