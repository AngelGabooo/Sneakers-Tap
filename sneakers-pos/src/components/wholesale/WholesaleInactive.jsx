import { Clock, ArrowRight } from 'lucide-react'
import Card from '../common/Card'

export default function WholesaleInactive({ clients = [], onView }) {
  const visible = clients.slice(0, 5)

  if (visible.length === 0) return null

  return (
    <Card padded={false} className="mt-5">
      <div className="p-5 pb-0">
        <div className="flex items-center gap-2 mb-1">
          <Clock size={14} className="text-gray-400" strokeWidth={2} />
          <h3 className="text-sm font-semibold text-brand-black dark:text-dark-text">
            Clientes sin compra reciente
          </h3>
        </div>
        <p className="text-xs text-gray-500 dark:text-dark-muted">
          Clientes que podrían necesitar seguimiento comercial.
        </p>
      </div>

      <ul className="mt-3 divide-y divide-gray-100 dark:divide-dark-border">
        {visible.map((w) => {
          const days = w.lastPurchaseAt
            ? Math.floor((Date.now() - new Date(w.lastPurchaseAt).getTime()) / 86400000)
            : null
          return (
            <li
              key={w.id}
              className="flex items-center justify-between gap-3 px-5 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-brand-black dark:text-dark-text truncate">
                  {w.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-muted">
                  {w.lastPurchaseAt
                    ? `Última compra: ${new Date(w.lastPurchaseAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })} · ${days} días`
                    : 'Sin compras registradas'}
                </p>
              </div>
              <button
                onClick={() => onView?.(w)}
                className="inline-flex items-center gap-1 text-xs font-medium text-brand-blue hover:underline shrink-0"
              >
                Ver cliente
                <ArrowRight size={11} strokeWidth={2.4} />
              </button>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}