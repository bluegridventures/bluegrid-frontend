import Button from '../Button';
import { cn } from '../../../utils/utils';

const WARN = ['Admin review', 'Pending', 'Suspended', 'Revoked', 'Do not call', 'Past due', 'Missed'];

export function StatusBadge({ label, tone }) {
  const warn = tone ? tone === 'warn' : WARN.includes(label);
  return (
    <span className={cn('inline-block rounded-[5px] px-[7px] py-[3px] text-xs', warn ? 'bg-warn-bg text-warn' : 'bg-tag-bg text-tag-fg')}>
      {label}
    </span>
  );
}

export function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        {eyebrow && <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.13em] text-brand">{eyebrow}</p>}
        <h1 className="text-[clamp(31px,3vw,44px)] leading-[1.13] font-bold tracking-[-0.055em]">{title}</h1>
        {subtitle && <p className="mt-1.5 text-muted">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}

export function KeyValueList({ items }) {
  return (
    <dl className="grid grid-cols-[minmax(110px,.7fr)_1.5fr] gap-x-3 gap-y-1.5">
      {Object.entries(items).map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-muted">{k}</dt>
          <dd className="m-0 break-words">{v === '' || v == null ? '—' : v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ProviderCell({ name, npi, onClick }) {
  return (
    <>
      {onClick ? <Button variant="link" onClick={onClick}>{name}</Button> : <span>{name}</span>}
      {npi && <small className="block text-muted">NPI {npi}</small>}
    </>
  );
}

export function ActivityTimeline({ items }) {
  return items.map((e, i) => (
    <div key={i} className="my-2 border-l-2 border-[#9cc7b6] pl-3">
      <strong>{e.title}</strong> <small className="text-muted">{e.meta}</small>
      <p className="break-words">{e.note}</p>
    </div>
  ));
}

export function BarChart({ data, maxHeight = 68 }) {
  const peak = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="mt-4 flex h-[108px] items-end gap-3.5 max-sm:gap-1.5">
      {data.map((d) => (
        <div key={d.label} className="grid flex-1 content-end justify-items-center text-center text-[11px]">
          <b>{d.value}</b>
          <div
            className="w-3/4 max-w-[50px] rounded-t-[3px] bg-[repeating-linear-gradient(0deg,#84dab3_0_5px,#245445_5px_7px)]"
            style={{ height: Math.round((d.value / peak) * maxHeight) }}
          />
          <small className="text-[#c1d6d7]">{d.label}</small>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ children }) {
  return <p className="py-5 text-muted">{children}</p>;
}

/** Red inline banner with an optional Retry button (list / detail load failures). */
export function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <p role="alert" className="my-3 flex flex-wrap items-center gap-2 rounded-md border border-danger/30 bg-[#fdecea] px-3 py-2 text-sm text-danger">
      {message}
      {onRetry && <Button variant="link" onClick={onRetry}>Retry</Button>}
    </p>
  );
}
