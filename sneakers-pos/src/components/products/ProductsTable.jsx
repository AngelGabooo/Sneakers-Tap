import { ArrowUp, ArrowDown, Package, PackageX } from 'lucide-react'
import Card from '../common/Card'
import Badge from '../common/Badge'
import Checkbox from '../common/Checkbox'
import EmptyState from '../common/EmptyState'
import ProductRowActions from './ProductRowActions'
import ProductsTableSkeleton from './ProductsTableSkeleton'
import ProductsPagination from './ProductsPagination'

/**
 * Tabla profesional de productos.
 * Los datos llegan por props. Si están vacíos, mostramos empty states.
 */
export default function ProductsTable({
  items = [],
  loading = false,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  sort,
  onSortChange,
  onView, onEdit, onDuplicate, onToggleActive, onDelete,
  onNew,
  searchQuery = '',
  onClearSearch,
  // Paginación
  page, perPage, total, onPageChange, onPerPageChange,
}) {
  const hasItems = items.length > 0
  const allSelected = hasItems && selectedIds.length === items.length
  const someSelected = selectedIds.length > 0 && !allSelected

  const SortIndicator = ({ field }) => {
    if (sort?.field !== field) {
      return <ArrowUp size={12} className="opacity-0 group-hover:opacity-40" />
    }
    return sort.direction === 'asc'
      ? <ArrowUp size={12} className="text-brand-blue" />
      : <ArrowDown size={12} className="text-brand-blue" />
  }

  const ThSortable = ({ field, children, align = 'left', className = '' }) => (
    <th className={`text-${align} px-4 py-3 ${className}`}>
      <button
        type="button"
        onClick={() => onSortChange?.(field, sort?.field === field && sort.direction === 'asc' ? 'desc' : 'asc')}
        className="group inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted hover:text-brand-blue transition-colors"
      >
        {children}
        <SortIndicator field={field} />
      </button>
    </th>
  )

  return (
    <Card padded={false} className="overflow-hidden">
      {/* Estado de carga */}
      {loading && <ProductsTableSkeleton rows={5} />}

      {/* Estado vacío por búsqueda */}
      {!loading && !hasItems && searchQuery && (
        <EmptyState
          icon={PackageX}
          title="No encontramos productos"
          description="Intenta buscar con otro nombre, SKU o código de barras."
          action={
            <button
              onClick={onClearSearch}
              className="text-sm font-medium text-brand-blue hover:underline"
            >
              Limpiar búsqueda
            </button>
          }
        />
      )}

      {/* Estado vacío sin productos */}
      {!loading && !hasItems && !searchQuery && (
        <EmptyState
          icon={Package}
          title="Aún no tienes productos"
          description="Agrega tu primer producto para comenzar a administrar tu catálogo."
          action={
            <button
              onClick={onNew}
              className="text-sm font-medium text-brand-blue hover:underline"
            >
              + Crear producto
            </button>
          }
        />
      )}

      {/* Tabla */}
      {!loading && hasItems && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[880px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-dark-border bg-gray-50/60 dark:bg-dark-surface/60">
                  <th className="w-10 px-4 py-3">
                    <Checkbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={(e) => onToggleSelectAll?.(e.target.checked)}
                      aria-label="Seleccionar todos"
                    />
                  </th>

                  <ThSortable field="name" className="min-w-[280px]">Producto</ThSortable>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted">
                    Categoría
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted">
                    Marca
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted">
                    Variantes
                  </th>
                  <ThSortable field="price">Precio</ThSortable>
                  <ThSortable field="stock">Stock</ThSortable>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted">
                    Estado
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted w-[140px]">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {items.map((p) => {
                  const selected = selectedIds.includes(p.id)
                  const stockBadge =
                    p.stock === 0
                      ? { label: 'Agotado', variant: 'danger' }
                      : p.stock <= 5
                        ? { label: 'Stock bajo', variant: 'warning' }
                        : { label: 'Disponible', variant: 'success' }

                  return (
                    <tr
                      key={p.id}
                      className={`
                        border-b border-gray-100 dark:border-dark-border last:border-0
                        transition-colors
                        ${selected
                          ? 'bg-blue-50/60 dark:bg-blue-950/20'
                          : 'hover:bg-gray-50 dark:hover:bg-dark-surface/50'}
                      `}
                    >
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selected}
                          onChange={() => onToggleSelect?.(p.id)}
                          aria-label={`Seleccionar ${p.name}`}
                        />
                      </td>

                      {/* Producto */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-dark-surface overflow-hidden shrink-0 flex items-center justify-center">
                            {p.imageUrl
                              ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                              : <Package size={18} className="text-gray-400 dark:text-dark-muted" strokeWidth={1.8} />}
                          </div>
                          <div className="min-w-0">
                            <button
                              onClick={() => onView?.(p.id)}
                              className="text-sm font-medium text-brand-black dark:text-dark-text hover:text-brand-blue truncate block text-left transition-colors"
                            >
                              {p.name}
                            </button>
                            <p className="text-xs text-gray-500 dark:text-dark-muted truncate">
                              SKU: {p.sku}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-gray-700 dark:text-dark-muted whitespace-nowrap">
                        {p.category}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-dark-muted whitespace-nowrap">
                        {p.brand}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-dark-muted whitespace-nowrap">
                        {p.variants}
                      </td>
                      <td className="px-4 py-3 font-semibold text-brand-black dark:text-dark-text whitespace-nowrap">
                        {p.price}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-brand-black dark:text-dark-text font-medium">
                            {p.stock}
                          </span>
                          <Badge variant={stockBadge.variant}>{stockBadge.label}</Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge variant={p.status === 'active' ? 'success' : 'neutral'}>
                          {p.status === 'active' ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <ProductRowActions
                          onView={() => onView?.(p.id)}
                          onEdit={() => onEdit?.(p.id)}
                          onDuplicate={() => onDuplicate?.(p.id)}
                          onToggleActive={() => onToggleActive?.(p.id)}
                          onDelete={() => onDelete?.(p.id)}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <ProductsPagination
            page={page}
            perPage={perPage}
            total={total}
            onPageChange={onPageChange}
            onPerPageChange={onPerPageChange}
          />
        </>
      )}
    </Card>
  )
}