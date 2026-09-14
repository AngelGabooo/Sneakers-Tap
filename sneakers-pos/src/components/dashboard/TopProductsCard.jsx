import { PackageOpen } from 'lucide-react'
import Card from '../common/Card'
import EmptyState from '../common/EmptyState'

export default function TopProductsCard({ products = [], onViewAll }) {
  const hasData = products.length > 0

  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
            Productos más vendidos
          </h3>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
            Los productos con mayor número de ventas
          </p>
        </div>
      </div>

      {hasData ? (
        <>
          <ul className="divide-y divide-gray-100 dark:divide-dark-border">
            {products.map((p, idx) => (
              <li key={p.id} className="py-3 flex items-center gap-4">
                <span className="w-6 text-sm font-semibold text-gray-400 dark:text-dark-muted">
                  {String(idx + 1).padStart(2, '0')}
                </span>

                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-dark-surface overflow-hidden shrink-0">
                  {p.imageUrl && (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brand-black dark:text-dark-text truncate">
                    {p.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-dark-muted">{p.category}</p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-brand-black dark:text-dark-text">
                    {p.units} vendidos
                  </p>
                  <p className="text-xs text-gray-500 dark:text-dark-muted">{p.revenue}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-border">
            <button
              onClick={onViewAll}
              className="text-sm font-medium text-brand-blue hover:text-brand-blueDark hover:underline"
            >
              Ver todos los productos
            </button>
          </div>
        </>
      ) : (
        <EmptyState
          icon={PackageOpen}
          title="Aún no hay productos vendidos"
          description="Los productos más vendidos aparecerán aquí."
        />
      )}
    </Card>
  )
}