import Button from '../Button';
import { fieldClass } from '../FilterDropdown';

const SIZES = [20, 50, 100];

/** Server pagination controls. meta = { page, limit, total, totalPages } from the API. */
export default function Pagination({ meta, onPage, onLimit, disabled = false }) {
  if (!meta) return null;
  const { page, limit, total, totalPages } = meta;
  const from = total ? (page - 1) * limit + 1 : 0;
  const to = Math.min(page * limit, total);
  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
      <span className="text-muted">Showing {from}–{to} of {total}</span>
      <span className="flex flex-wrap items-center gap-2">
        <label className="m-0 flex items-center gap-1.5 font-semibold">
          Rows per page
          <select value={limit} disabled={disabled} onChange={(e) => onLimit(Number(e.target.value))} className={fieldClass}>
            {SIZES.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <Button disabled={disabled || page <= 1} onClick={() => onPage(page - 1)}>Previous</Button>
        <span>Page {page} of {Math.max(totalPages, 1)}</span>
        <Button disabled={disabled || page >= totalPages} onClick={() => onPage(page + 1)}>Next</Button>
      </span>
    </div>
  );
}
