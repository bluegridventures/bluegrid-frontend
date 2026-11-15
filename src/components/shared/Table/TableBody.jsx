export default function TableBody({ columns, rows, rowKey }) {
  return (
    <tbody>
      {rows.map((row, i) => (
        <tr key={rowKey ? rowKey(row, i) : i}>
          {columns.map((c, j) => (
            <td key={j} className={`border-b border-line px-2.5 py-3 ${c.className || ''}`}>
              {c.cell ? c.cell(row) : row[c.key]}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}
