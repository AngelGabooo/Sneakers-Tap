import { Wallet, Search, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react'
import Card from '../../common/Card'
import Badge from '../../common/Badge'
import EmptyState from '../../common/EmptyState'

const SESSION_STATUS = {
  open:   { label: 'En curso', variant: 'info' },
  closed: { label: 'Cerrada',  variant: 'neutral' },
}

function getResult(s) {
  if (s.status === 'open') return null
  const diff = Number(s.closingFund || 0) - Number(s.expectedCash || 0)
  if (Math.abs(diff) < 0.01) return { key: 'reconciled', label: 'Conciliada', variant: 'success', diff }
  if (diff > 0) return { key: 'surplus', label: 'Sobrante', variant: 'warning', diff }
  return { key: 'shortage', label: 'Faltante', variant: 'danger', diff }
}

export default function CashHistoryCardList({
  sessions = [],
  loading = false,
  onViewDetail,
  searchQuery = '',
  filtersActive = false,
  onClearAll,
  onGoToOpen,
}) {
  const hasItems = sessions.length > 0

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="!p-4">
            <div className="h-3 w-32 bg-gray-100 dark:bg-dark-surface rounded animate-pulse" />
            <div className="h-3 w-20 bg-gray-100 dark:bg-dark-surface rounded animate-pulse mt-2" />
            <div className="h-3 w-full bg-gray-100 dark:bg-dark-surface rounded animate-pulse mt-3" />
          </Card>
        ))}
      </div>
    )
  }

  if (!hasItems && (searchQuery || filtersActive)) {
    return (
      <Card>
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
      </Card>
    )
  }

  if (!hasItems) {
    return (
      <Card>
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
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {sessions.map((s) => {
        const result = getResult(s)
        const status = SESSION_STATUS[s.status] || SESSION_STATUS.closed
        const opened = new Date(s.openedAt)

        return (
          <Card
            key={s.id}
            className="!p-4 cursor-pointer hover:shadow-cardHover transition-shadow"
          >
            <button className="w-full text-left" onClick={() => onViewDetail?.(s)}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-brand-black dark:text-dark-text">
                    {s.cashLabel}
                  </p>
                  <p className="text-xs font-mono text-brand-blue mt-0.5">
                    #{s.id}
                  </p>
                </div>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>

              <p className="text-xs text-gray-500 dark:text-dark-muted">
                {opened.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })} ·{' '}
                {opened.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
              </p>

              <p className="text-xs text-gray-600 dark:text-dark-muted mt-1 truncate">
                {s.responsibleName}
              </p>

              <div className="flex items-center justify-between gap-3 pt-3 mt-3 border-t border-gray-100 dark:border-dark-border">
                <div>
                  <p className="text-[11px] text-gray-500 dark:text-dark-muted">Ventas</p>
                  <p className="text-sm font-semibold text-brand-black dark:text-dark-text">
                    ${Number(s.totalSales || 0).toLocaleString('es-MX')}
                  </p>
                </div>
                {result && (
                  <div className="text-right">
                    <p className="text-[11px] text-gray-500 dark:text-dark-muted">Diferencia</p>
                    {Math.abs(result.diff) < 0.01 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-dark-muted">
                        <CheckCircle2 size={12} strokeWidth={2.4} /> $0
                      </span>
                    ) : result.diff > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                        <TrendingUp size={12} strokeWidth={2.4} /> +${Math.abs(result.diff).toLocaleString('es-MX')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-red">
                        <TrendingDown size={12} strokeWidth={2.4} /> -${Math.abs(result.diff).toLocaleString('es-MX')}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </button>
          </Card>
        )
      })}
    </div>
  )
}