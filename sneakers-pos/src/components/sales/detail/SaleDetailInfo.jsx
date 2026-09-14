import Card from '../../common/Card'
import Badge from '../../common/Badge'

const STATUS = {
  completed:      { label: 'Completada',            variant: 'success' },
  pending:        { label: 'Pendiente',             variant: 'warning' },
  partial_return: { label: 'Parcialmente devuelta', variant: 'warning' },
  returned:       { label: 'Devuelta',              variant: 'neutral' },
  cancelled:      { label: 'Cancelada',             variant: 'danger' },
  refunded:       { label: 'Reembolsada',           variant: 'neutral' },
}

export default function SaleDetailInfo({ sale }) {
  const created = sale?.createdAt ? new Date(sale.createdAt) : null
  const status = STATUS[sale?.status] || STATUS.completed

  const rows = [
    { label: 'Número',    value: sale?.folio, mono: true },
    { label: 'Fecha',     value: created?.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) },
    { label: 'Hora',      value: created?.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) },
    { label: 'Sucursal',  value: sale?.branch },
    { label: 'Caja',      value: sale?.cashId, mono: true },
    { label: 'Vendedor',  value: sale?.cashier },
    { label: 'Rol',       value: sale?.cashierRole },
  ]

  return (
    <Card>
      <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text mb-4">
        Información de la venta
      </h2>

      <ul className="space-y-2.5">
        {rows.map((r) => (
          <li key={r.label} className="flex items-start justify-between gap-3 text-sm">
            <span className="text-gray-500 dark:text-dark-muted shrink-0">{r.label}</span>
            <span className={`font-medium text-brand-black dark:text-dark-text text-right truncate ${r.mono ? 'font-mono text-xs' : ''}`}>
              {r.value || '—'}
            </span>
          </li>
        ))}
        <li className="flex items-start justify-between gap-3 text-sm pt-2 border-t border-gray-100 dark:border-dark-border">
          <span className="text-gray-500 dark:text-dark-muted shrink-0">Estado</span>
          <Badge variant={status.variant}>{status.label}</Badge>
        </li>
      </ul>
    </Card>
  )
}