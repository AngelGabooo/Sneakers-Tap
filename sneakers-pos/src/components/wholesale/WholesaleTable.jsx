import { ArrowUp, ArrowDown, Users, Search } from 'lucide-react'
import Card from '../common/Card'
import Badge from '../common/Badge'
import Checkbox from '../common/Checkbox'
import EmptyState from '../common/EmptyState'
import WholesaleRowActions from './WholesaleRowActions'
import WholesaleTableSkeleton from './WholesaleTableSkeleton'
import WholesalePagination from './WholesalePagination'

const CONDITION = {
  basic:      { label: 'Mayoreo Básico',    variant: 'neutral' },
  premium:    { label: 'Mayoreo Premium',   variant: 'info' },
  distributor:{ label: 'Distribuidor',      variant: 'success' },
  custom:     { label: 'Personalizado',     variant: 'warning' },
}

const STATUS = {
  active:    { label: 'Activo',     variant: 'success' },
  inactive:  { label: 'Inactivo',   variant: 'neutral' },
  suspended: { label: 'Suspendido', variant: 'warning' },
  blocked:   { label: 'Bloqueado',  variant: 'danger' },
}

function getCreditState(w) {
  const limit = Number(w.creditLimit) || 0
  const used  = Number(w.creditUsed) || 0
  const avail = Math.max(0, limit - used)

  if (limit === 0) return { label: 'Sin crédito', variant: 'neutral', value: null }
  if (avail === 0) return { label: 'Límite alcanzado', variant: 'warning', value: '$0' }
  return { label: null, variant: null, value: avail }
}

export default function WholesaleTable({
  wholesales = [], loading = false,
  selectedIds = [], onToggleSelect, onToggleSelectAll,
  sort, onSortChange,
  onView, onEdit, onNewSale, onViewSales, onViewAccount, onViewAudit, onToggleStatus, onBlock,
  searchQuery = '', filtersActive = false, onClearAll,
  page, perPage, total, onPageChange, onPerPageChange,
  onGoToNew,
}) {
  const hasItems = wholesales.length > 0
  const allSelected = hasItems && selectedIds.length === wholesales.length
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
      {loading && <WholesaleTableSkeleton rows={6} />}

      {!loading && !hasItems && (searchQuery || filtersActive) && (
        <EmptyState
          icon={Search}
          title="No encontramos clientes"
          description="No existen clientes mayoristas que coincidan con los criterios seleccionados."
          action={
            <button onClick={onClearAll} className="text-sm font-medium text-brand-blue hover:underline">
              Limpiar filtros
            </button>
          }
        />
      )}

      {!loading && !hasItems && !searchQuery && !filtersActive && (
        <EmptyState
          icon={Users}
          title="Aún no tienes clientes mayoristas"
          description="Registra tu primer cliente mayorista para comenzar a administrar precios, crédito y condiciones comerciales."
          action={
            <button onClick={onGoToNew} className="text-sm font-medium text-brand-blue hover:underline">
              + Nuevo mayorista
            </button>
          }
        />
      )}

      {!loading && hasItems && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1140px]">
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

                  <ThSortable field="name" className="min-w-[240px]">Cliente mayorista</ThSortable>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted whitespace-nowrap">
                    Contacto
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted whitespace-nowrap">
                    Condición
                  </th>
                  <ThSortable field="lastPurchaseAt">Última compra</ThSortable>
                  <ThSortable field="salesInPeriod">Compras del periodo</ThSortable>
                  <ThSortable field="balance">Saldo</ThSortable>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted whitespace-nowrap">
                    Crédito disponible
                  </th>
                  <ThSortable field="status">Estado</ThSortable>
                  <th className="w-[60px] px-4 py-3" />
                </tr>
              </thead>

              <tbody>
                {wholesales.map((w) => {
                  const selected = selectedIds.includes(w.id)
                  const condition = CONDITION[w.condition] || CONDITION.basic
                  const status = STATUS[w.status] || STATUS.active
                  const credit = getCreditState(w)
                  const overdue = w.balance > 0 && w.overdue

                  return (
                    <tr
                      key={w.id}
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
                          onChange={() => onToggleSelect?.(w.id)}
                          aria-label={`Seleccionar ${w.name}`}
                        />
                      </td>

                      {/* Cliente */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-brand-blue text-white flex items-center justify-center font-semibold shrink-0 text-sm">
                            {(w.name?.[0] || '?').toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <button
                              onClick={() => onView?.(w)}
                              className="text-sm font-medium text-brand-black dark:text-dark-text hover:text-brand-blue truncate block text-left transition-colors"
                            >
                              {w.name}
                            </button>
                            <p className="text-xs font-mono text-gray-500 dark:text-dark-muted truncate">
                              {w.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contacto */}
                      <td className="px-4 py-3">
                        <p className="text-sm text-brand-black dark:text-dark-text truncate">
                          {w.contactName || '—'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-dark-muted truncate">
                          {w.phone || w.email || '—'}
                        </p>
                      </td>

                      {/* Condición */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button onClick={() => onView?.(w)}>
                          <Badge variant={condition.variant}>{condition.label}</Badge>
                        </button>
                      </td>

                      {/* Última compra */}
                      <td className="px-4 py-3 whitespace-nowrap text-xs">
                        {w.lastPurchaseAt ? (
                          <>
                            <p className="text-brand-black dark:text-dark-text font-medium">
                              {new Date(w.lastPurchaseAt).toLocaleDateString('es-MX', {
                                day: '2-digit', month: 'short', year: 'numeric',
                              })}
                            </p>
                            <p className="text-gray-400 dark:text-dark-muted">
                              {Math.floor((Date.now() - new Date(w.lastPurchaseAt).getTime()) / 86400000)} días
                            </p>
                          </>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 font-medium">
                            Sin compra reciente
                          </span>
                        )}
                      </td>

                      {/* Compras del periodo */}
                      <td className="px-4 py-3 font-semibold text-brand-black dark:text-dark-text whitespace-nowrap">
                        ${Number(w.salesInPeriod || 0).toLocaleString('es-MX')}
                      </td>

                      {/* Saldo */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {w.balance > 0 ? (
                          <>
                            <p className={`text-sm font-semibold ${overdue ? 'text-brand-red' : 'text-brand-black dark:text-dark-text'}`}>
                              ${Number(w.balance).toLocaleString('es-MX')}
                            </p>
                            {overdue && (
                              <p className="text-[11px] text-brand-red">Vencido</p>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-emerald-600 dark:text-emerald-400">
                            Al corriente
                          </span>
                        )}
                      </td>

                      {/* Crédito disponible */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {credit.value !== null ? (
                          <div>
                            <p className="text-sm font-medium text-brand-black dark:text-dark-text">
                              ${Number(credit.value).toLocaleString('es-MX')}
                            </p>
                            {credit.label && (
                              <p className="text-[11px] text-amber-600 dark:text-amber-400">
                                {credit.label}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500 dark:text-dark-muted">
                            {credit.label}
                          </span>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <Badge variant={status.variant}>{status.label}</Badge>
                          {overdue && (
                            <Badge variant="danger">Pago vencido</Badge>
                          )}
                        </div>
                      </td>

                      {/* Acciones */}
                      <td className="px-4 py-3">
                        <WholesaleRowActions
                          wholesale={w}
                          onView={onView}
                          onEdit={onEdit}
                          onNewSale={onNewSale}
                          onViewSales={onViewSales}
                          onViewAccount={onViewAccount}
                          onViewAudit={onViewAudit}
                          onToggleStatus={onToggleStatus}
                          onBlock={onBlock}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <WholesalePagination
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