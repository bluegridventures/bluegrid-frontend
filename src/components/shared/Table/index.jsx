import TableHeader from './TableHeader';
import TableBody from './TableBody';

/**
 * columns: [{ header, key?, cell?(row), className? }]
 * rows: any[]   rowKey?(row, index)
 */
export default function Table({ columns, rows, rowKey, empty = 'No matching records.' }) {
  if (!rows.length) return <p className="py-5 text-muted">{empty}</p>;
  return (
    <div className="max-h-[70vh] overflow-auto">
      <table className="w-full border-collapse whitespace-nowrap text-left text-[13px]">
        <TableHeader columns={columns} />
        <TableBody columns={columns} rows={rows} rowKey={rowKey} />
      </table>
    </div>
  );
}
