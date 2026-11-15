import { cn } from '../../../utils/utils';

export default function AnalyticsCard({ label, value, hint, tone, onClick }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'min-h-[90px] rounded-[9px] border border-line p-3.5 text-left',
        tone === 'danger' ? 'bg-danger-bg' : 'bg-white',
        onClick && 'cursor-pointer hover:bg-hover',
      )}
    >
      <span className="block text-xs text-muted">{label}</span>
      <strong className={cn('block text-[30px] leading-tight font-bold tracking-[-0.05em]', tone === 'danger' && 'text-danger')}>{value}</strong>
      {hint && <small className="block text-[11px] text-muted">{hint}</small>}
    </Tag>
  );
}

const colsClass = { 5: 'xl:grid-cols-5', 7: 'xl:grid-cols-7' };

export function StatGrid({ cols = 5, children }) {
  return <div className={cn('mb-4 grid grid-cols-2 gap-2.5 md:grid-cols-4', colsClass[cols])}>{children}</div>;
}
