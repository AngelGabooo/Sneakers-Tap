import { UserCheck } from 'lucide-react'
import Card from '../common/Card'
import EmptyState from '../common/EmptyState'

export default function TopSellersCard({ sellers = [] }) {
  const hasData = sellers.length > 0

  return (
    <Card>
      <div className="mb-4">
        <h3 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
          Mejores vendedores
        </h3>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Ranking del período seleccionado
        </p>
      </div>

      {hasData ? (
        <ul className="divide-y divide-gray-100 dark:divide-dark-border">
          {sellers.map((s, idx) => (
            <li key={s.name} className="py-3 flex items-center gap-3">
              <span className="w-6 text-sm font-semibold text-gray-400 dark:text-dark-muted">
                {String(idx + 1).padStart(2, '0')}
              </span>

              <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-semibold shrink-0">
                {s.name?.[0]?.toUpperCase() || '?'}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-brand-black dark:text-dark-text truncate">
                  {s.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-muted">
                  {s.transactions} {s.transactions === 1 ? 'venta' : 'ventas'}
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-brand-black dark:text-dark-text">
                  {s.totalFormatted}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={UserCheck}
          title="Sin ventas registradas"
          description="El ranking de vendedores aparecerá aquí."
        />
      )}
    </Card>
  )
}