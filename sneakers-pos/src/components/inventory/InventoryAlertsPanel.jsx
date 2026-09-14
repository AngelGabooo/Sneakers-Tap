import { AlertTriangle, PackageX, Bell } from 'lucide-react'
import Card from '../common/Card'
import Badge from '../common/Badge'

export default function InventoryAlertsPanel({ alerts = [], onViewAll, onItemClick }) {
  const hasAlerts = alerts.length > 0
  const visible = alerts.slice(0, 5)

  return (
    <Card>
      <header className="flex items-start justify-between mb-4 gap-3">
        <div>
          <h3 className="text-base font-semibold text-brand-black dark:text-dark-text flex items-center gap-2">
            <Bell size={15} className="text-brand-blue" strokeWidth={2} />
            Alertas de inventario
          </h3>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
            Variantes que requieren atención
          </p>
        </div>
      </header>

      {!hasAlerts ? (
        <p className="text-sm text-gray-500 dark:text-dark-muted py-6 text-center">
          Todo en orden. No hay alertas de inventario.
        </p>
      ) : (
        <>
          <ul className="space-y-3">
            {visible.map((a) => {
              const isOut = a.level === 'out'
              return (
                <li
                  key={a.id}
                  className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-surface/50 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
                  onClick={() => onItemClick?.(a)}
                >
                  <div
                    className={`
                      w-9 h-9 rounded-lg flex items-center justify-center shrink-0
                      ${isOut
                        ? 'bg-red-50 dark:bg-red-950/40 text-brand-red'
                        : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'}
                    `}
                  >
                    {isOut
                      ? <PackageX size={18} strokeWidth={1.9} />
                      : <AlertTriangle size={18} strokeWidth={1.9} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-brand-black dark:text-dark-text truncate">
                      {a.productName} · {a.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-dark-muted">
                      {isOut
                        ? '0 unidades · Agotado'
                        : `${a.stock} unidades · Mínimo: ${a.minStock}`}
                    </p>
                  </div>

                  <Badge variant={isOut ? 'danger' : 'warning'}>
                    {isOut ? 'Agotado' : 'Stock bajo'}
                  </Badge>
                </li>
              )
            })}
          </ul>

          {alerts.length > visible.length && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-border">
              <button
                onClick={onViewAll}
                className="text-sm font-medium text-brand-blue hover:underline"
              >
                Ver todas las alertas ({alerts.length})
              </button>
            </div>
          )}
        </>
      )}
    </Card>
  )
}