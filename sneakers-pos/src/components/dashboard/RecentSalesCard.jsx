import { Receipt } from 'lucide-react'
import Card from '../common/Card'
import Badge from '../common/Badge'
import EmptyState from '../common/EmptyState'

const STATUS_VARIANT = {
  completed: 'success',
  pending:   'warning',
  cancelled: 'danger',
}

const STATUS_LABEL = {
  completed: 'Completada',
  pending:   'Pendiente',
  cancelled: 'Cancelada',
}

export default function RecentSalesCard({ sales = [], onViewAll }) {
  const hasData = sales.length > 0

  return (
    <Card padded={false}>
      <div className="p-5 lg:p-6 pb-0">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
              Ventas recientes
            </h3>
            <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
              Últimas operaciones realizadas
            </p>
          </div>
          <button
            onClick={onViewAll}
            className="text-sm font-medium text-brand-blue hover:underline"
          >
            Ver todas
          </button>
        </div>
      </div>

      {hasData ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-gray-100 dark:border-dark-border bg-gray-50/60 dark:bg-dark-surface/60">
                {['Folio', 'Cliente', 'Productos', 'Total', 'Método', 'Cajero', 'Estado'].map((h) => (
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
              {sales.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-gray-100 dark:border-dark-border last:border-0 hover:bg-gray-50 dark:hover:bg-dark-surface/50 transition-colors"
                >
                  <td className="px-5 py-3 font-medium text-brand-black dark:text-dark-text whitespace-nowrap">
                    {s.folio}
                  </td>
                  <td className="px-5 py-3 text-gray-700 dark:text-dark-muted whitespace-nowrap">
                    {s.customer}
                  </td>
                  <td className="px-5 py-3 text-gray-700 dark:text-dark-muted whitespace-nowrap">
                    {s.items}
                  </td>
                  <td className="px-5 py-3 font-semibold text-brand-black dark:text-dark-text whitespace-nowrap">
                    {s.total}
                  </td>
                  <td className="px-5 py-3 text-gray-700 dark:text-dark-muted whitespace-nowrap">
                    {s.method}
                  </td>
                  <td className="px-5 py-3 text-gray-700 dark:text-dark-muted whitespace-nowrap">
                    {s.cashier}
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <Badge variant={STATUS_VARIANT[s.status] || 'neutral'}>
                      {STATUS_LABEL[s.status] || s.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={Receipt}
          title="Aún no hay ventas registradas"
          description="Cuando se realicen ventas, aparecerán en esta tabla."
        />
      )}
    </Card>
  )
}