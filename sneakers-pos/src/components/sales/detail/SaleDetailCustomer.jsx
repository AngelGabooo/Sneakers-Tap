import { User, ExternalLink } from 'lucide-react'
import Card from '../../common/Card'
import Badge from '../../common/Badge'

export default function SaleDetailCustomer({ sale, onViewCustomer }) {
  const hasCustomer = !!sale?.customerName

  return (
    <Card>
      <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text mb-4">
        Cliente
      </h2>

      {!hasCustomer ? (
        <div>
          <p className="text-sm font-medium text-brand-black dark:text-dark-text">
            Venta general
          </p>
          <p className="text-xs text-gray-500 dark:text-dark-muted mt-1">
            No se asignó un cliente a esta venta.
          </p>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-blue text-white flex items-center justify-center font-semibold shrink-0">
            {sale.customerName[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-brand-black dark:text-dark-text truncate">
              {sale.customerName}
            </p>
            {sale.customerType === 'wholesale' && (
              <Badge variant="info" className="mt-1">Cliente mayorista</Badge>
            )}

            <button
              onClick={() => onViewCustomer?.(sale.customerId)}
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-blue hover:underline"
            >
              <ExternalLink size={11} strokeWidth={2.2} />
              Ver cliente
            </button>
          </div>
        </div>
      )}
    </Card>
  )
}