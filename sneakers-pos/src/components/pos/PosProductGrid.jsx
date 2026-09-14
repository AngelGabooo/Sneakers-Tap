import { PackageSearch } from 'lucide-react'
import EmptyState from '../common/EmptyState'
import PosProductCard from './PosProductCard'

export default function PosProductGrid({ products = [], loading = false, onProductClick }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-100 dark:border-dark-border overflow-hidden">
            <div className="aspect-square bg-gray-100 dark:bg-dark-surface animate-pulse" />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-gray-100 dark:bg-dark-surface rounded animate-pulse" />
              <div className="h-3 w-2/3 bg-gray-100 dark:bg-dark-surface rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="Sin productos"
        description="No se encontraron productos con la búsqueda o categoría seleccionada."
      />
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
      {products.map((p) => (
        <PosProductCard key={p.id} product={p} onClick={onProductClick} />
      ))}
    </div>
  )
}