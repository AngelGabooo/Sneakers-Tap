import { ArrowUp, ArrowDown, Package, Search } from 'lucide-react'
import Card from '../../common/Card'
import Badge from '../../common/Badge'
import EmptyState from '../../common/EmptyState'
import MovementsRowActions from './MovementsRowActions'
import MovementsTableSkeleton from './MovementsTableSkeleton'
import MovementsPagination from './MovementsPagination'

const TYPE_META = {
  in:       { label: '+ Entrada',    variant: 'success', icon: '+' },
  out:      { label: '− Salida',     variant: 'danger',  icon: '−' },
  adjust:   { label: 'Ajuste',       variant: 'info',    icon: '±' },
  return:   { label: '↩ Devolución', variant: 'info',    icon: '↩' },
  loss:     { label: '− Merma',      variant: 'danger',  icon: '−' },
  damage:   { label: '− Daño',       variant: 'danger',  icon: '−' },
  transfer: { label: '⇄ Transfer.',  variant: 'info',    icon: '⇄' },
}

const REASON_LABELS = {
  reception: 'Recepción de mercancía',
  sale: 'Venta',
  return: 'Devolución',
  physical: 'Conteo físico',
  shrinkage: 'Merma',
  damage: 'Daño',
  correction: 'Corrección',
  transfer: 'Transferencia',
  other: 'Otro',
}

function formatRelative(iso) {
  if (!iso) return ''
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'Hace unos segundos'
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`
  if (diff < 604800) return `Hace ${Math.floor(diff / 86400)} d`
  return ''
}

export default function MovementsTable({
  items = [], loading = false,
  sort, onSortChange,
  onViewDetail, onViewProduct, onViewDocument, onViewUser,
  searchQuery = '', filtersActive = false, onClearAll,
  page, perPage, total, onPageChange, onPerPageChange,
}) {
  const hasItems = items.length > 0

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
      {loading && <MovementsTableSkeleton rows={6} />}

      {!loading && !hasItems && (searchQuery || filtersActive) && (
        <EmptyState
          icon={Search}
          title="No encontramos movimientos"
          description="No existen movimientos que coincidan con los filtros seleccionados."
          action={
            <button onClick={onClearAll} className="text-sm font-medium text-brand-blue hover:underline">
              Limpiar filtros
            </button>
          }
        />
      )}

      {!loading && !hasItems && !searchQuery && !filtersActive && (
        <EmptyState
          icon={Package}
          title="Sin movimientos registrados"
          description="Los movimientos aparecerán aquí cuando ajustes inventario o registres compras/ventas."
        />
      )}

      {!loading && hasItems && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1180px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-dark-border bg-gray-50/60 dark:bg-dark-surface/60">
                  <ThSortable field="createdAt" className="min-w-[140px]">Fecha y hora</ThSortable>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted min-w-[240px]">
                    Producto
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted">
                    Variante
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted">
                    Tipo
                  </th>
                  <ThSortable field="quantity">Cantidad</ThSortable>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted">
                    Stock ant.
                  </th>
                  <ThSortable field="stockAfter">Stock res.</ThSortable>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted">
                    Motivo
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted">
                    Usuario
                  </th>
                  <th className="w-[60px] px-4 py-3" />
                </tr>
              </thead>

              <tbody>
                {items.map((m) => {
                  const meta = TYPE_META[m.type] || TYPE_META.adjust
                  const isPositive = Number(m.quantity) > 0
                  return (
                    <tr
                      key={m.id}
                      className="border-b border-gray-100 dark:border-dark-border last:border-0 hover:bg-gray-50 dark:hover:bg-dark-surface/50 transition-colors"
                    >
                      {/* Fecha */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-brand-black dark:text-dark-text text-xs font-medium">
                          {new Date(m.createdAt).toLocaleString('es-MX', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                        <p className="text-[11px] text-gray-400 dark:text-dark-muted mt-0.5">
                          {formatRelative(m.createdAt)}
                        </p>
                      </td>

                      {/* Producto */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-dark-surface overflow-hidden shrink-0 flex items-center justify-center">
                            <Package size={16} className="text-gray-400 dark:text-dark-muted" strokeWidth={1.8} />
                          </div>
                          <div className="min-w-0">
                            <button
                              onClick={() => onViewProduct?.(m.productId)}
                              className="text-sm font-medium text-brand-black dark:text-dark-text hover:text-brand-blue truncate block text-left transition-colors"
                            >
                              {m.productName}
                            </button>
                            <p className="text-xs text-gray-500 dark:text-dark-muted font-mono truncate">
                              {m.sku || '—'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Variante */}
                      <td className="px-4 py-3 text-brand-black dark:text-dark-text font-medium whitespace-nowrap">
                        {m.variantLabel || '—'}
                      </td>

                      {/* Tipo */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                      </td>

                      {/* Cantidad */}
                      <td className={`px-4 py-3 font-semibold whitespace-nowrap ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-brand-red'}`}>
                        {isPositive ? '+' : ''}{m.quantity}
                      </td>

                      {/* Stock anterior */}
                      <td className="px-4 py-3 text-gray-700 dark:text-dark-muted whitespace-nowrap">
                        {m.stockBefore}
                      </td>

                      {/* Stock resultante */}
                      <td className="px-4 py-3 font-semibold text-brand-black dark:text-dark-text whitespace-nowrap">
                        {m.stockAfter}
                      </td>

                      {/* Motivo */}
                      <td className="px-4 py-3 text-gray-700 dark:text-dark-muted whitespace-nowrap text-xs">
                        {REASON_LABELS[m.reason] || m.reason || '—'}
                        {m.documentId && (
                          <span className="block text-[11px] text-brand-blue mt-0.5">
                            {m.documentId}
                          </span>
                        )}
                      </td>

                      {/* Usuario */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-brand-blue text-white flex items-center justify-center text-[11px] font-semibold shrink-0">
                            {(m.userName?.[0] || '?').toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-brand-black dark:text-dark-text truncate">
                              {m.userName}
                            </p>
                            <p className="text-[11px] text-gray-500 dark:text-dark-muted truncate">
                              {m.userRole || '—'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Acciones */}
                      <td className="px-4 py-3">
                        <MovementsRowActions
                          onViewDetail={() => onViewDetail?.(m)}
                          onViewProduct={() => onViewProduct?.(m.productId)}
                          onViewDocument={() => onViewDocument?.(m)}
                          onViewUser={() => onViewUser?.(m.userName)}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <MovementsPagination
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