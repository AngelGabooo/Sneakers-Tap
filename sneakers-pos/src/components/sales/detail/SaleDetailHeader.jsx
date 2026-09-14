import { ChevronRight } from 'lucide-react'
import Badge from '../../common/Badge'

const STATUS = {
  completed:       { label: 'Completada',           variant: 'success' },
  pending:         { label: 'Pendiente',            variant: 'warning' },
  partial_return:  { label: 'Parcialmente devuelta', variant: 'warning' },
  returned:        { label: 'Devuelta',             variant: 'neutral' },
  cancelled:       { label: 'Cancelada',            variant: 'danger'  },
  refunded:        { label: 'Reembolsada',          variant: 'neutral' },
}

export default function SaleDetailHeader({ sale, onBack, children }) {
  const status = STATUS[sale?.status] || STATUS.completed

  const created = sale?.createdAt ? new Date(sale.createdAt) : null

  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm mb-5">
        <button
          onClick={onBack}
          className="text-gray-500 dark:text-dark-muted hover:text-brand-blue transition-colors font-medium"
        >
          Ventas
        </button>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-brand-black dark:text-dark-text font-medium">
          {sale?.folio || 'Detalle de venta'}
        </span>
      </nav>

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-black dark:text-dark-text tracking-tight">
              Venta {sale?.folio}
            </h1>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>

          {created && (
            <p className="text-sm text-gray-500 dark:text-dark-muted mt-1">
              {created.toLocaleDateString('es-MX', {
                day: '2-digit', month: 'long', year: 'numeric',
              })} · {created.toLocaleTimeString('es-MX', {
                hour: '2-digit', minute: '2-digit',
              })}
            </p>
          )}
        </div>

        {children}
      </div>
    </>
  )
}