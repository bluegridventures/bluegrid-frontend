export default function TableHeader({ columns }) {
  return (
    <thead>
      <tr>
        {columns.map((c, i) => (
          <th key={i} className="sticky top-0 border-b border-line bg-thead px-2.5 py-3 text-xs font-bold text-muted">
            {c.header}
          </th>
        ))}
      </tr>
    </thead>
  );
}
