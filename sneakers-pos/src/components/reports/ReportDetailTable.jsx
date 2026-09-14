import { PackageSearch } from 'lucide-react'
import Card from '../common/Card'
import EmptyState from '../common/EmptyState'

export default function ReportDetailTable({ columns = [], rows = [], emptyMessage }) {
  if (rows.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={PackageSearch}
          title="Sin datos"
          description={emptyMessage || 'No hay datos para mostrar en este periodo.'}
        />
      </Card>
    )
  }

  return (
    <Card padded={false}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-gray-100 dark:border-dark-border bg-gray-50/60 dark:bg-dark-surface/60">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted whitespace-nowrap ${
                    col.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={row.id ?? idx}
                className="border-b border-gray-100 dark:border-dark-border last:border-0 hover:bg-gray-50 dark:hover:bg-dark-surface/40 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-5 py-3 whitespace-nowrap ${
                      col.align === 'right' ? 'text-right' : 'text-left'
                    } ${col.emphasis
                      ? 'font-semibold text-brand-black dark:text-dark-text'
                      : 'text-gray-700 dark:text-dark-muted'}`}
                  >
                    {col.render ? col.render(row) : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}