import { Receipt, Search, User } from 'lucide-react'
import Card from '../../common/Card'
import Badge from '../../common/Badge'
import EmptyState from '../../common/EmptyState'

const STATUS = {
  completed:      { label: 'Completada',            variant: 'success' },
  pending:        { label: 'Pendiente',             variant: 'warning' },
  partial_return: { label: 'Parcialmente devuelta', variant: 'info' },
  returned:       { label: 'Devuelta',              variant: 'neutral' },
  cancelled:      { label: 'Cancelada',             variant: 'danger' },
  refunded:       { label: 'Reembolsada',           variant: 'neutral' },
}

export default function SalesHistoryCardList({
  sales = [],
  loading = false,
  onViewDetail,
  searchQuery = '',
  filtersActive = false,
  onClearAll,
  onGoToPos,
}) {
  const hasSales = sales.length > 0

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="!p-4">
            <div className="h-3 w-32 bg-gray-100 dark:bg-dark-surface rounded animate-pulse" />
            <div className="h-3 w-20 bg-gray-100 dark:bg-dark-surface rounded animate-pulse mt-2" />
            <div className="h-3 w-full bg-gray-100 dark:bg-dark-surface rounded animate-pulse mt-3" />
          </Card>
        ))}
      </div>
    )
  }

  if (!hasSales && (searchQuery || filtersActive)) {
    return (
      <Card>
        <EmptyState
          icon={Search}
          title="No encontramos ventas"
          description="Prueba con otros términos de búsqueda o modifica los filtros."
          action={
            <button onClick={onClearAll} className="text-sm font-medium text-brand-blue hover:underline">
              Limpiar filtros
            </button>
          }
        />
      </Card>
    )
  }

  if (!hasSales) {
    return (
      <Card>
        <EmptyState
          icon={Receipt}
          title="Aún no hay ventas"
          description="Las ventas que registres desde el punto de venta aparecerán aquí."
          action={
            <button onClick={onGoToPos} className="text-sm font-medium text-brand-blue hover:underline">
              Nueva venta
            </button>
          }
        />
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {sales.map((sale) => {
        const status = STATUS[sale.status] || STATUS.completed
        const itemCount = (sale.items || []).length
        const created = new Date(sale.createdAt)

        return (
          <Card
            key={sale.id}
            className="!p-4 cursor-pointer hover:shadow-cardHover transition-shadow"
          >
            <button
              className="w-full text-left"
              onClick={() => onViewDetail?.(sale.id)}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="text-sm font-mono font-medium text-brand-blue truncate">
                    #{sale.folio}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-dark-muted mt-0.5">
                    {created.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })} ·{' '}
                    {created.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-dark-muted mb-2">
                <User size={12} strokeWidth={2.2} />
                <span className="truncate">
                  {sale.customerName || 'Venta general'}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-dark-border">
                <span className="text-xs text-gray-500 dark:text-dark-muted">
                  {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
                </span>
                <span className="text-base font-bold text-brand-black dark:text-dark-text">
                  ${Number(sale.total || 0).toLocaleString('es-MX')}
                </span>
              </div>
            </button>
          </Card>
        )
      })}
    </div>
  )
}