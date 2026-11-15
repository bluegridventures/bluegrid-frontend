import { cn } from '../../../utils/utils';

export const fieldClass = 'max-w-full rounded-md border border-field bg-white px-2.5 py-2 text-[#193846]';

/** Controlled <select>. `options` may be strings or { value, label }. */
export default function FilterDropdown({ value, onChange, options, label, className }) {
  return (
    <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className={cn(fieldClass, className)}>
      {options.map((o) =>
        typeof o === 'string' ? (
          <option key={o}>{o}</option>
        ) : (
          <option key={o.value} value={o.value}>{o.label}</option>
        ),
      )}
    </select>
  );
}
