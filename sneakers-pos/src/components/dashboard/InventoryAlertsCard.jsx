import { AlertTriangle, PackageX } from 'lucide-react'
import Card from '../common/Card'
import Badge from '../common/Badge'
import EmptyState from '../common/EmptyState'

export default function InventoryAlertsCard({ alerts = [], onViewInventory }) {
  const hasData = alerts.length > 0

  return (
    <Card>
      <div className="mb-4">
        <h3 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
          Alertas de inventario
        </h3>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Productos que necesitan atención
        </p>
      </div>

      {hasData ? (
        <>
          <ul className="space-y-3">
            {alerts.map((a) => {
              const isOut = a.level === 'out'
              return (
                <li key={a.id} className="flex items-start gap-3">
                  <div
                    className={`
                      w-9 h-9 rounded-lg flex items-center justify-center shrink-0
                      ${isOut
                        ? 'bg-red-50 dark:bg-red-950/40 text-brand-red'
                        : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'}
                    `}
                  >
                    {isOut ? <PackageX size={18} strokeWidth={1.9} /> : <AlertTriangle size={18} strokeWidth={1.9} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-brand-black dark:text-dark-text truncate">
                      {a.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-dark-muted">
                      Stock: <span className="font-medium">{a.stock} unidades</span>
                    </p>
                  </div>

                  <Badge variant={isOut ? 'danger' : 'warning'}>
                    {isOut ? 'Agotado' : 'Stock bajo'}
                  </Badge>
                </li>
              )
            })}
          </ul>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-border">
            <button
              onClick={onViewInventory}
              className="text-sm font-medium text-brand-blue hover:text-brand-blueDark hover:underline"
            >
              Ver inventario
            </button>
          </div>
        </>
      ) : (
        <EmptyState
          icon={AlertTriangle}
          title="Todo en orden"
          description="No hay alertas de inventario por el momento."
        />
      )}
    </Card>
  )
}