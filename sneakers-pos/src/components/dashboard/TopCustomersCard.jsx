import { Users } from 'lucide-react'
import Card from '../common/Card'
import Badge from '../common/Badge'
import EmptyState from '../common/EmptyState'

export default function TopCustomersCard({ customers = [] }) {
  const hasData = customers.length > 0

  return (
    <Card>
      <div className="mb-4">
        <h3 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
          Mejores clientes
        </h3>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Los que más han comprado en el período
        </p>
      </div>

      {hasData ? (
        <ul className="divide-y divide-gray-100 dark:divide-dark-border">
          {customers.map((c, idx) => (
            <li key={c.name} className="py-3 flex items-center gap-3">
              <span className="w-6 text-sm font-semibold text-gray-400 dark:text-dark-muted">
                {String(idx + 1).padStart(2, '0')}
              </span>

              <div className="w-9 h-9 rounded-full bg-brand-blue text-white flex items-center justify-center text-sm font-semibold shrink-0">
                {c.name?.[0]?.toUpperCase() || '?'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-brand-black dark:text-dark-text truncate">
                    {c.name}
                  </p>
                  {c.isWholesale && <Badge variant="info">Mayorista</Badge>}
                </div>
                <p className="text-xs text-gray-500 dark:text-dark-muted">
                  {c.transactions} {c.transactions === 1 ? 'compra' : 'compras'}
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-brand-black dark:text-dark-text">
                  {c.totalFormatted}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Users}
          title="Sin ventas registradas"
          description="Los mejores clientes aparecerán aquí."
        />
      )}
    </Card>
  )
}