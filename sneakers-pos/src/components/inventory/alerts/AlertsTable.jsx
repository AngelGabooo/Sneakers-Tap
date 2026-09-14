import { ArrowUp, ArrowDown, Package, CheckCircle2, Search } from 'lucide-react'
import Card from '../../common/Card'
import Badge from '../../common/Badge'
import Checkbox from '../../common/Checkbox'
import EmptyState from '../../common/EmptyState'
import AlertsRowActions from './AlertsRowActions'
import AlertsTableSkeleton from './AlertsTableSkeleton'
import AlertsPagination from './AlertsPagination'

const URGENCY = {
  critical: { label: 'Crítica', variant: 'danger' },
  high:     { label: 'Alta',    variant: 'danger' },
  medium:   { label: 'Media',   variant: 'warning' },
  soon:     { label: 'Por agotarse', variant: 'info' },
}

const STATE = {
  out:  { label: 'Agotado',    variant: 'danger' },
  low:  { label: 'Stock bajo', variant: 'warning' },
  soon: { label: 'Por agotarse', variant: 'info' },
}

export default function AlertsTable({
  items = [], loading = false,
  selectedIds = [],
  onToggleSelect, onToggleSelectAll,
  sort, onSortChange,
  onViewProduct, onViewInventory, onViewMovements, onAdjustStock, onCreatePurchase, onViewSupplier, onReponer,
  searchQuery = '', filtersActive = false, onClearAll,
  page, perPage, total, onPageChange, onPerPageChange,
  onGoToInventory,
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
      {loading && <AlertsTableSkeleton rows={6} />}

      {!loading && !hasItems && (searchQuery || filtersActive) && (
        <EmptyState
          icon={Search}
          title="No hay alertas con estos filtros"
          description="Prueba con otros criterios de búsqueda o elimina algunos filtros."
          action={
            <button onClick={onClearAll} className="text-sm font-medium text-brand-blue hover:underline">
              Limpiar filtros
            </button>
          }
        />
      )}

      {!loading && !hasItems && !searchQuery && !filtersActive && (
        <EmptyState
          icon={CheckCircle2}
          title="Todo está bajo control"
          description="No hay productos con stock bajo o agotado en este momento."
          action={
            <button onClick={onGoToInventory} className="text-sm font-medium text-brand-blue hover:underline">
              Ver inventario
            </button>
          }
        />
      )}

      {!loading && hasItems && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1080px]">
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
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted whitespace-nowrap">Variante</th>
                  <ThSortable field="stock">Stock</ThSortable>
                  <ThSortable field="minStock">Mínimo</ThSortable>
                  <ThSortable field="missing">Faltante</ThSortable>
                  <ThSortable field="urgencyOrder">Urgencia</ThSortable>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted whitespace-nowrap">Proveedor</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted whitespace-nowrap">Últ. movimiento</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted whitespace-nowrap">Estado</th>
                  <th className="w-[60px] px-4 py-3" />
                </tr>
              </thead>

              <tbody>
                {items.map((row) => {
                  const selected = selectedIds.includes(row.id)
                  const urg = URGENCY[row.urgency] || URGENCY.medium
                  const st = STATE[row.state] || STATE.low

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

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-dark-surface overflow-hidden shrink-0 flex items-center justify-center">
                            {row.imageUrl
                              ? <img src={row.imageUrl} alt="" className="w-full h-full object-cover" />
                              : <Package size={18} className="text-gray-400" strokeWidth={1.8} />}
                          </div>
                          <div className="min-w-0">
                            <button
                              onClick={() => onViewProduct?.(row.productId)}
                              className="text-sm font-medium text-brand-black dark:text-dark-text hover:text-brand-blue truncate block text-left transition-colors"
                            >
                              {row.productName}
                            </button>
                            <p className="text-xs text-gray-500 dark:text-dark-muted font-mono truncate">
                              {row.sku || '—'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-brand-black dark:text-dark-text font-medium whitespace-nowrap">
                        {row.label}
                      </td>

                      <td className={`px-4 py-3 font-semibold whitespace-nowrap ${row.stock === 0 ? 'text-brand-red' : 'text-brand-black dark:text-dark-text'}`}>
                        {row.stock}
                      </td>

                      <td className="px-4 py-3 text-gray-700 dark:text-dark-muted whitespace-nowrap">
                        {row.minStock}
                      </td>

                      <td className="px-4 py-3 text-brand-red font-semibold whitespace-nowrap">
                        {row.missing}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge variant={urg.variant}>{urg.label}</Badge>
                      </td>

                      <td className="px-4 py-3 text-gray-700 dark:text-dark-muted text-xs whitespace-nowrap">
                        {row.supplier || (
                          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                            Sin proveedor
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-gray-500 dark:text-dark-muted text-xs whitespace-nowrap">
                        {row.lastMovementAt
                          ? new Date(row.lastMovementAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
                          : '—'}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge variant={st.variant}>{st.label}</Badge>
                      </td>

                      <td className="px-4 py-3">
                        <AlertsRowActions
                          onReponer={() => onReponer?.(row)}
                          onViewProduct={() => onViewProduct?.(row.productId)}
                          onViewInventory={() => onViewInventory?.(row)}
                          onViewMovements={() => onViewMovements?.(row)}
                          onAdjustStock={() => onAdjustStock?.(row)}
                          onCreatePurchase={() => onCreatePurchase?.(row)}
                          onViewSupplier={() => onViewSupplier?.(row)}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <AlertsPagination
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