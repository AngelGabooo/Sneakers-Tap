import Card from '../../common/Card'
import Badge from '../../common/Badge'

const STATUS = {
  completed:      { label: 'Completada',            variant: 'success' },
  pending:        { label: 'Pendiente',             variant: 'warning' },
  partial_return: { label: 'Parcialmente devuelta', variant: 'info' },
  returned:       { label: 'Devuelta',              variant: 'neutral' },
  cancelled:      { label: 'Cancelada',             variant: 'danger' },
}

export default function CashCurrentSalesTable({ sales = [], onViewSale, onViewAll }) {
  const rows = sales.slice(0, 10)

  return (
    <Card padded={false}>
      <div className="p-5 pb-0 flex items-center justify-between">
        <div>
          <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
            Ventas recientes
          </h2>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
            Últimas ventas registradas en esta sesión.
          </p>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-medium text-brand-blue hover:underline"
          >
            Ver todas
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-dark-muted px-5 py-6">
          Aún no hay ventas en esta sesión.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm min-w-[820px]">
            <thead>
              <tr className="border-y border-gray-100 dark:border-dark-border bg-gray-50/60 dark:bg-dark-surface/60">
                {['Hora', 'Venta', 'Cliente', 'Total', 'Método', 'Vendedor', 'Estado'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const status = STATUS[s.status] || STATUS.completed
                return (
                  <tr
                    key={s.id}
                    className="border-b border-gray-100 dark:border-dark-border last:border-0"
                  >
                    <td className="px-5 py-3 text-gray-700 dark:text-dark-muted whitespace-nowrap text-xs">
                      {new Date(s.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <button
                        onClick={() => onViewSale?.(s.id)}
                        className="text-sm font-medium text-brand-blue hover:underline font-mono"
                      >
                        #{s.folio}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-brand-black dark:text-dark-text truncate max-w-[180px]">
                      {s.customerName || 'Venta general'}
                    </td>
                    <td className="px-5 py-3 font-semibold text-brand-black dark:text-dark-text whitespace-nowrap">
                      ${Number(s.total || 0).toLocaleString('es-MX')}
                    </td>
                    <td className="px-5 py-3 text-gray-700 dark:text-dark-muted whitespace-nowrap text-xs">
                      {s.payment?.methodLabel || '—'}
                    </td>
                    <td className="px-5 py-3 text-gray-700 dark:text-dark-muted whitespace-nowrap text-xs">
                      {s.cashier || '—'}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}