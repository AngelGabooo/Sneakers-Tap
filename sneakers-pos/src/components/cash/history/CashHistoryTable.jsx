import {
  ArrowUp, ArrowDown, Wallet, Search,
  TrendingUp, TrendingDown, CheckCircle2,
} from 'lucide-react'
import Card from '../../common/Card'
import Badge from '../../common/Badge'
import Checkbox from '../../common/Checkbox'
import EmptyState from '../../common/EmptyState'
import CashHistoryRowActions from './CashHistoryRowActions'
import CashHistoryTableSkeleton from './CashHistoryTableSkeleton'
import CashHistoryPagination from './CashHistoryPagination'

const SESSION_STATUS = {
  open:   { label: 'En curso', variant: 'info' },
  closed: { label: 'Cerrada',  variant: 'neutral' },
}

function getResult(session) {
  if (session.status === 'open') return null
  const diff = Number(session.closingFund || 0) - Number(session.expectedCash || 0)
  if (Math.abs(diff) < 0.01) return { key: 'reconciled', label: 'Conciliada', variant: 'success', diff }
  if (diff > 0) return { key: 'surplus', label: 'Sobrante', variant: 'warning', diff }
  return { key: 'shortage', label: 'Faltante', variant: 'danger', diff }
}

export default function CashHistoryTable({
  sessions = [],
  loading = false,
  selectedIds = [],
  onToggleSelect, onToggleSelectAll,
  sort, onSortChange,
  onViewDetail, onViewSales, onViewMovements, onViewAudit, onExport, onViewCurrent,
  searchQuery = '', filtersActive = false, onClearAll,
  page, perPage, total, onPageChange, onPerPageChange,
  onGoToOpen,
}) {
  const hasItems = sessions.length > 0
  const allSelected = hasItems && selectedIds.length === sessions.length
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
      {loading && <CashHistoryTableSkeleton rows={6} />}

      {!loading && !hasItems && (searchQuery || filtersActive) && (
        <EmptyState
          icon={Search}
          title="No encontramos sesiones"
          description="No existen sesiones que coincidan con los filtros seleccionados."
          action={
            <button onClick={onClearAll} className="text-sm font-medium text-brand-blue hover:underline">
              Limpiar filtros
            </button>
          }
        />
      )}

      {!loading && !hasItems && !searchQuery && !filtersActive && (
        <EmptyState
          icon={Wallet}
          title="No hay cajas registradas"
          description="Todavía no se han registrado sesiones de caja en este periodo."
          action={
            <button onClick={onGoToOpen} className="text-sm font-medium text-brand-blue hover:underline">
              Abrir una caja
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

                  <ThSortable field="openedAt">Fecha</ThSortable>
                  <ThSortable field="cashLabel">Caja / Sesión</ThSortable>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted whitespace-nowrap">
                    Sucursal
                  </th>
                  <ThSortable field="responsibleName">Responsable</ThSortable>
                  <ThSortable field="totalSales">Ventas</ThSortable>
                  <ThSortable field="expectedCash">Efvo. esperado</ThSortable>
                  <ThSortable field="closingFund">Contado</ThSortable>
                  <ThSortable field="difference">Diferencia</ThSortable>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted whitespace-nowrap">
                    Estado
                  </th>
                  <th className="w-[60px] px-4 py-3" />
                </tr>
              </thead>

              <tbody>
                {sessions.map((s) => {
                  const selected = selectedIds.includes(s.id)
                  const result = getResult(s)
                  const sessionStatus = SESSION_STATUS[s.status] || SESSION_STATUS.closed
                  const opened = new Date(s.openedAt)

                  return (
                    <tr
                      key={s.id}
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
                          onChange={() => onToggleSelect?.(s.id)}
                          aria-label={`Seleccionar ${s.id}`}
                        />
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-sm font-medium text-brand-black dark:text-dark-text">
                          {opened.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-dark-muted">
                          {opened.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-sm font-medium text-brand-black dark:text-dark-text">
                          {s.cashLabel}
                        </p>
                        <button
                          onClick={() => onViewDetail?.(s)}
                          className="text-xs font-mono text-brand-blue hover:underline"
                        >
                          #{s.id}
                        </button>
                      </td>

                      <td className="px-4 py-3 text-gray-700 dark:text-dark-muted text-xs whitespace-nowrap">
                        {s.branch || '—'}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-brand-blue text-white flex items-center justify-center text-[11px] font-semibold shrink-0">
                            {(s.responsibleName?.[0] || '?').toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-brand-black dark:text-dark-text truncate">
                              {s.responsibleName || '—'}
                            </p>
                            <p className="text-[11px] text-gray-500 dark:text-dark-muted truncate">
                              {s.responsibleRole || '—'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-semibold text-brand-black dark:text-dark-text whitespace-nowrap">
                        ${Number(s.totalSales || 0).toLocaleString('es-MX')}
                      </td>

                      <td className="px-4 py-3 text-gray-700 dark:text-dark-muted whitespace-nowrap">
                        ${Number(s.expectedCash || 0).toLocaleString('es-MX')}
                      </td>

                      <td className="px-4 py-3 text-gray-700 dark:text-dark-muted whitespace-nowrap">
                        {s.status === 'open' ? '—' : `$${Number(s.closingFund || 0).toLocaleString('es-MX')}`}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        {!result ? (
                          <span className="text-xs text-gray-400 dark:text-dark-muted">—</span>
                        ) : Math.abs(result.diff) < 0.01 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-dark-muted">
                            <CheckCircle2 size={12} strokeWidth={2.4} />
                            $0
                          </span>
                        ) : result.diff > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                            <TrendingUp size={12} strokeWidth={2.4} />
                            +${Math.abs(result.diff).toLocaleString('es-MX')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-red">
                            <TrendingDown size={12} strokeWidth={2.4} />
                            -${Math.abs(result.diff).toLocaleString('es-MX')}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <Badge variant={sessionStatus.variant}>{sessionStatus.label}</Badge>
                          {result && result.key !== 'reconciled' && (
                            <Badge variant={result.variant}>{result.label}</Badge>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <CashHistoryRowActions
                          session={s}
                          onViewDetail={onViewDetail}
                          onViewSales={onViewSales}
                          onViewMovements={onViewMovements}
                          onViewAudit={onViewAudit}
                          onExport={onExport}
                          onViewCurrent={onViewCurrent}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <CashHistoryPagination
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