import { cn } from '../../../utils/utils';

export default function Panel({ title, actions, tone = 'light', className, children }) {
  return (
    <section
      className={cn(
        'mb-4 min-w-0 rounded-[10px] border p-5 max-sm:p-3.5',
        tone === 'dark' ? 'border-board bg-board text-white' : tone === 'trend' ? 'border-trend bg-trend text-white' : 'border-line bg-white',
        className,
      )}
    >
      {(title || actions) && (
        <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
          {title && <h2 className="text-xl font-semibold tracking-tight">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
