import { cn } from '../../utils/utils';

const alertStyles = {
  error: 'border-danger/30 bg-[#fdecea] text-danger',
  success: 'border-brand/30 bg-tag-bg text-brand',
  warn: 'border-line bg-warn-bg text-warn',
};

/** Inline message box. type: error | success | warn */
export function FormAlert({ type = 'error', children }) {
  if (!children) return null;
  return (
    <p role={type === 'error' ? 'alert' : 'status'} className={cn('my-3 rounded-md border px-3 py-2 text-sm', alertStyles[type])}>
      {children}
    </p>
  );
}

/** Centered card used by every public auth screen. */
export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen place-items-center bg-page p-4">
      <div className="w-full max-w-[420px] rounded-xl border border-line bg-white p-7">
        <span className="mb-5 flex items-center gap-[9px] text-[26px] font-bold tracking-[-1px] text-header">
          <i
            aria-hidden="true"
            className="block h-6 w-6 bg-[#76d4ac]"
            style={{ backgroundImage: 'linear-gradient(90deg,transparent 43%,#142e3c 43% 57%,transparent 57%),linear-gradient(transparent 43%,#142e3c 43% 57%,transparent 57%)' }}
          />
          Bluegrid
        </span>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
        <div className="mt-4">{children}</div>
        {footer && <div className="mt-5 border-t border-line pt-4 text-center text-sm">{footer}</div>}
      </div>
    </div>
  );
}
