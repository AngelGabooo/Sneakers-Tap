import { ArrowUp, ArrowDown, Receipt, Search } from 'lucide-react'
import Card from '../../common/Card'
import Badge from '../../common/Badge'
import Checkbox from '../../common/Checkbox'
import EmptyState from '../../common/EmptyState'
import SalesHistoryRowActions from './SalesHistoryRowActions'
import SalesHistoryTableSkeleton from './SalesHistoryTableSkeleton'
import SalesHistoryPagination from './SalesHistoryPagination'

const STATUS = {
  completed:      { label: 'Completada',             variant: 'success' },
  pending:        { label: 'Pendiente',              variant: 'warning' },
  partial_return: { label: 'Parcialmente devuelta',  variant: 'info' },
  returned:       { label: 'Devuelta',               variant: 'neutral' },
  cancelled:      { label: 'Cancelada',              variant: 'danger' },
  refunded:       { label: 'Reembolsada',            variant: 'neutral' },
}

export default function SalesHistoryTable({
  sales = [],
  loading = false,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  sort,
  onSortChange,
  onViewDetail,
  onViewCustomer,
  onPrint,
  onSend,
  onReturn,
  onCancel,
  onViewAudit,
  searchQuery = '',
  filtersActive = false,
  onClearAll,
  page,
  perPage,
  total,
  onPageChange,
  onPerPageChange,
  onGoToPos,
}) {
  const hasSales = sales.length > 0
  const allSelected = hasSales && selectedIds.length === sales.length
  const someSelected = selectedIds.length > 0 && !allSelected

  const SortIndicator = ({ field }) => {
    if (sort?.field !== field) {
      return <ArrowUp size={12} className="opacity-0 group-hover:opacity-40" />
    }
    return sort.direction === 'asc'
      ? <ArrowUp size={12} className="text-brand-blue" />
      : <ArrowDown size={12} className="text-brand-blue" />
  }

  const ThSortable = ({ field, children, className = '' }) => (
    <th className={`text-left px-4 py-3 ${className}`}>
      <button
        type="button"
        onClick={() =>
          onSortChange?.(
            field,
            sort?.field === field && sort.direction === 'asc' ? 'desc' : 'asc',
          )
        }
        className="group inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted hover:text-brand-blue transition-colors whitespace-nowrap"
      >
        {children}
        <SortIndicator field={field} />
      </button>
    </th>
  )

  return (
    <Card padded={false} className="overflow-hidden">
      {loading && <SalesHistoryTableSkeleton rows={6} />}

      {/* Sin resultados por búsqueda o filtros */}
      {!loading && !hasSales && (searchQuery || filtersActive) && (
        <EmptyState
          icon={Search}
          title="No encontramos ventas"
          description="Prueba con otros términos de búsqueda o modifica los filtros."
          action={
            <button
              onClick={onClearAll}
              className="text-sm font-medium text-brand-blue hover:underline"
            >
              Limpiar filtros
            </button>
          }
        />
      )}

      {/* Estado vacío inicial */}
      {!loading && !hasSales && !searchQuery && !filtersActive && (
        <EmptyState
          icon={Receipt}
          title="Aún no hay ventas"
          description="Las ventas que registres desde el punto de venta aparecerán aquí."
          action={
            <button
              onClick={onGoToPos}
              className="text-sm font-medium text-brand-blue hover:underline"
            >
              Nueva venta
            </button>
          }
        />
      )}

      {/* Tabla */}
      {!loading && hasSales && (
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

                  <ThSortable field="createdAt">Fecha y hora</ThSortable>
                  <ThSortable field="folio">Venta</ThSortable>
                  <ThSortable field="customerName" className="min-w-[180px]">
                    Cliente
                  </ThSortable>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted whitespace-nowrap">
                    Productos
                  </th>
                  <ThSortable field="total">Total</ThSortable>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted whitespace-nowrap">
                    Pago
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted whitespace-nowrap">
                    Caja
                  </th>
                  <ThSortable field="cashier">Vendedor</ThSortable>
                  <ThSortable field="status">Estado</ThSortable>
                  <th className="w-[60px] px-4 py-3" />
                </tr>
              </thead>

              <tbody>
                {sales.map((sale) => {
                  const selected = selectedIds.includes(sale.id)
                  const status = STATUS[sale.status] || STATUS.completed
                  const itemCount = (sale.items || []).length
                  const created = new Date(sale.createdAt)

                  return (
                    <tr
                      key={sale.id}
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
                          onChange={() => onToggleSelect?.(sale.id)}
                          aria-label={`Seleccionar ${sale.folio}`}
                        />
                      </td>

                      {/* Fecha y hora */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-sm text-brand-black dark:text-dark-text font-medium">
                          {created.toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-dark-muted">
                          {created.toLocaleTimeString('es-MX', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </td>

                      {/* Venta */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          onClick={() => onViewDetail?.(sale.id)}
                          className="text-sm font-medium text-brand-blue hover:underline font-mono"
                        >
                          #{sale.folio}
                        </button>
                      </td>

                      {/* Cliente */}
                      <td className="px-4 py-3">
                        {sale.customerName ? (
                          <button
                            onClick={() => onViewCustomer?.(sale.customerId)}
                            className="text-sm text-brand-black dark:text-dark-text hover:text-brand-blue truncate block text-left transition-colors"
                          >
                            {sale.customerName}
                          </button>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-dark-muted">
                            Venta general
                          </span>
                        )}
                      </td>

                      {/* Productos */}
                      <td className="px-4 py-3 text-gray-700 dark:text-dark-muted whitespace-nowrap">
                        {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
                      </td>

                      {/* Total */}
                      <td className="px-4 py-3 font-semibold text-brand-black dark:text-dark-text whitespace-nowrap">
                        ${Number(sale.total || 0).toLocaleString('es-MX')}
                      </td>

                      {/* Pago */}
                      <td className="px-4 py-3 text-gray-700 dark:text-dark-muted whitespace-nowrap text-xs">
                        {sale.payment?.methodLabel || '—'}
                      </td>

                      {/* Caja */}
                      <td className="px-4 py-3 text-gray-700 dark:text-dark-muted whitespace-nowrap text-xs">
                        {sale.cashId || '—'}
                      </td>

                      {/* Vendedor */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-brand-blue text-white flex items-center justify-center text-[11px] font-semibold shrink-0">
                            {(sale.cashier?.[0] || '?').toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-brand-black dark:text-dark-text truncate">
                              {sale.cashier || '—'}
                            </p>
                            <p className="text-[11px] text-gray-500 dark:text-dark-muted truncate">
                              {sale.cashierRole || '—'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>

                      {/* Acciones */}
                      <td className="px-4 py-3">
                        <SalesHistoryRowActions
                          sale={sale}
                          onViewDetail={onViewDetail}
                          onPrint={onPrint}
                          onSend={onSend}
                          onReturn={onReturn}
                          onCancel={onCancel}
                          onViewAudit={onViewAudit}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <SalesHistoryPagination
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