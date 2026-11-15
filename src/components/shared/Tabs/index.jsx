import { cn } from '../../../utils/utils';

export default function Tabs({ tabs, value, onChange }) {
  return (
    <div className="my-3 flex gap-3 overflow-auto" role="tablist">
      {tabs.map((t) => (
        <button
          key={t}
          type="button"
          role="tab"
          aria-selected={t === value}
          onClick={() => onChange(t)}
          className={cn(
            'whitespace-nowrap border-0 border-b-[3px] bg-transparent px-1.5 py-2 text-[13px] font-semibold',
            t === value ? 'border-brand text-brand' : 'border-transparent text-muted',
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
