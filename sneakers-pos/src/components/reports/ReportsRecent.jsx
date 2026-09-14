import { Clock } from 'lucide-react'
import Card from '../common/Card'

export default function ReportsRecent({ items = [] }) {
  return (
    <Card padded={false}>
      <div className="p-5 pb-0 flex items-start gap-2">
        <Clock size={15} className="text-gray-400 mt-0.5" strokeWidth={2.2} />
        <div>
          <h3 className="text-sm font-semibold text-brand-black dark:text-dark-text">
            Reportes recientes
          </h3>
          <p className="text-xs text-gray-500 dark:text-dark-muted mt-0.5">
            Últimos ejecutados por ti o tu equipo.
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-dark-muted px-5 py-6">
          Aún no has ejecutado ningún reporte.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-gray-100 dark:divide-dark-border">
          {items.map((it) => (
            <li
              key={it.id}
              className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-dark-surface/40 transition-colors"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-brand-black dark:text-dark-text truncate">
                  {it.label}
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-muted">
                  {it.period} · {it.user}
                </p>
              </div>
              <span className="text-xs text-gray-400 dark:text-dark-muted whitespace-nowrap">
                {it.relative}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}