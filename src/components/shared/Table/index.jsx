import TableHeader from './TableHeader';
import TableBody from './TableBody';
import { cn } from '../../../utils/utils';

/**
 * columns: [{ header, key?, cell?(row), className? }]
 * rows: any[]   rowKey?(row, index)   loading?: shows a spinner when empty, dims the rows while refetching
 */
export default function Table({ columns, rows, rowKey, empty = 'No matching records.', loading = false }) {
  if (!rows.length) {
    return (
      <p className="py-5 text-muted" role={loading ? 'status' : undefined}>
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-brand" /> Loading…
          </span>
        ) : (
          empty
        )}
      </p>
    );
  }
  return (
    <div className={cn('max-h-[70vh] overflow-auto transition-opacity', loading && 'opacity-60')} aria-busy={loading}>
      <table className="w-full border-collapse whitespace-nowrap text-left text-[13px]">
        <TableHeader columns={columns} />
        <TableBody columns={columns} rows={rows} rowKey={rowKey} />
      </table>
    </div>
  );
}
