import { ArrowUp, ArrowDown, Package, PackageX, Search } from 'lucide-react'
import Card from '../common/Card'
import Badge from '../common/Badge'
import Checkbox from '../common/Checkbox'
import EmptyState from '../common/EmptyState'
import InventoryRowActions from './InventoryRowActions'
import InventoryTableSkeleton from './InventoryTableSkeleton'
import InventoryPagination from './InventoryPagination'

const STOCK_STATE = {
  healthy: { label: 'Normal',     variant: 'success' },
  low:     { label: 'Stock bajo', variant: 'warning' },
  out:     { label: 'Agotado',    variant: 'danger' },
  inactive:{ label: 'Inactivo',   variant: 'neutral' },
}

/**
 * Obtiene el estado de una fila de inventario según su stock y mínimo.
 */
function getStockState(stock, minStock, productStatus) {
  if (productStatus && productStatus !== 'active') return 'inactive'
  if (Number(stock) <= 0) return 'out'
  if (Number(stock) <= Number(minStock || 0)) return 'low'
  return 'healthy'
}

export default function InventoryTable({
  items = [],
  loading = false,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  sort,
  onSortChange,
  onView, onEdit, onViewMovements, onAdjustStock, onRegisterPurchase,
  searchQuery = '',
  onClearSearch,
  filtersActive = false,
  onClearFilters,
  onGoToCreate,
  onGoToPurchase,
  page, perPage, total, onPageChange, onPerPageChange,
}) {
  const hasItems = items.length > 0
  const allSelected = hasItems && selectedIds.length === items.length
  const someSelected = selectedIds.length > 0 && !allSelected

  const SortIndicator = ({ field }) => {
    if (sort?.field !== field) return <ArrowUp size={12} className="opacity-0 group-hover:opacity-40" />
    return sort.direction === 'asc'
      ? <ArrowUp size={12} className="text-brand-blue" />
      : <ArrowDown size={12} className="text-brand-blue" />
  }

  const ThSortable = ({ field, children, className = '' }) => (
    <th className={`text-left px-4 py-3 ${className}`}>
      <button
        type="button"
        onClick={() => onSortChange?.(field, sort?.field === field && sort.direction === 'asc' ? 'desc' : 'asc')}
        className="group inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted hover:text-brand-blue transition-colors whitespace-nowrap"
      >
        {children}
        <SortIndicator field={field} />
      </button>
    </th>
  )

  return (
    <Card padded={false} className="overflow-hidden">
      {loading && <InventoryTableSkeleton rows={6} />}

      {!loading && !hasItems && (searchQuery || filtersActive) && (
        <EmptyState
          icon={Search}
          title="No encontramos existencias"
          description="No hay productos que coincidan con los filtros seleccionados."
          action={
            <button
              onClick={() => { onClearSearch?.(); onClearFilters?.() }}
              className="text-sm font-medium text-brand-blue hover:underline"
            >
              Limpiar filtros
            </button>
          }
        />
      )}

      {!loading && !hasItems && !searchQuery && !filtersActive && (
        <EmptyState
          icon={Package}
          title="No hay inventario registrado"
          description="Cuando agregues productos y registres existencias, aparecerán aquí."
          action={
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                onClick={onGoToCreate}
                className="text-sm font-medium text-brand-blue hover:underline"
              >
                Agregar producto
              </button>
              <span className="hidden sm:inline text-gray-300 dark:text-dark-muted">·</span>
              <button
                onClick={onGoToPurchase}
                className="text-sm font-medium text-brand-blue hover:underline"
              >
                Registrar compra
              </button>
            </div>
          }
        />
      )}

      {!loading && hasItems && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1040px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-dark-border bg-gray-50/60 dark:bg-dark-surface/60">
                  <th className="w-10 px-4 py-3">
                    <Checkbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={(e) => onToggleSelectAll?.(e.target.checked)}
                      aria-label="Seleccionar todas"
                    />
                  </th>

                  <ThSortable field="productName" className="min-w-[240px]">Producto</ThSortable>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted">
                    Variante
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted">
                    SKU
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted">
                    Ubicación
                  </th>
                  <ThSortable field="stock">Stock</ThSortable>
                  <ThSortable field="minStock">Mínimo</ThSortable>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted">
                    Disponible
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted">
                    Estado
                  </th>
                  <ThSortable field="lastMovementAt">Último mov.</ThSortable>
                  <th className="w-[60px] px-4 py-3" />
                </tr>
              </thead>

              <tbody>
                {items.map((row) => {
                  const selected = selectedIds.includes(row.id)
                  const state = getStockState(row.stock, row.minStock, row.productStatus)
                  const badge = STOCK_STATE[state]

                  return (
                    <tr
                      key={row.id}
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
                          onChange={() => onToggleSelect?.(row.id)}
                          aria-label={`Seleccionar ${row.productName}`}
                        />
                      </td>

                      {/* Producto */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-dark-surface overflow-hidden shrink-0 flex items-center justify-center">
                            {row.imageUrl
                              ? <img src={row.imageUrl} alt={row.productName} className="w-full h-full object-cover" />
                              : <Package size={18} className="text-gray-400 dark:text-dark-muted" strokeWidth={1.8} />}
                          </div>
                          <div className="min-w-0">
                            <button
                              onClick={() => onView?.(row.productId)}
                              className="text-sm font-medium text-brand-black dark:text-dark-text hover:text-brand-blue truncate block text-left transition-colors"
                            >
                              {row.productName}
                            </button>
                            <p className="text-xs text-gray-500 dark:text-dark-muted truncate">
                              {row.category || '—'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Variante */}
                      <td className="px-4 py-3 text-brand-black dark:text-dark-text font-medium whitespace-nowrap">
                        {row.label}
                      </td>

                      {/* SKU */}
                      <td className="px-4 py-3 text-gray-700 dark:text-dark-muted text-xs font-mono whitespace-nowrap">
                        {row.sku || '—'}
                      </td>

                      {/* Ubicación */}
                      <td className="px-4 py-3 text-gray-700 dark:text-dark-muted whitespace-nowrap">
                        {row.location || 'Sin asignar'}
                      </td>

                      {/* Stock */}
                      <td className="px-4 py-3 font-semibold text-brand-black dark:text-dark-text whitespace-nowrap">
                        {row.stock}
                      </td>

                      {/* Mínimo */}
                      <td className="px-4 py-3 text-gray-700 dark:text-dark-muted whitespace-nowrap">
                        {row.minStock}
                      </td>

                      {/* Disponible */}
                      <td className="px-4 py-3 font-medium text-brand-black dark:text-dark-text whitespace-nowrap">
                        {row.stock}
                      </td>

                      {/* Estado */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </td>

                      {/* Último movimiento */}
                      <td className="px-4 py-3 text-gray-500 dark:text-dark-muted text-xs whitespace-nowrap">
                        {row.lastMovementAt
                          ? new Date(row.lastMovementAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
                          : '—'}
                      </td>

                      {/* Acciones */}
                      <td className="px-4 py-3">
                        <InventoryRowActions
                          onView={() => onView?.(row.productId)}
                          onEdit={() => onEdit?.(row.productId)}
                          onViewMovements={() => onViewMovements?.(row.productId, row.variantId)}
                          onAdjustStock={() => onAdjustStock?.(row)}
                          onRegisterPurchase={() => onRegisterPurchase?.(row)}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <InventoryPagination
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