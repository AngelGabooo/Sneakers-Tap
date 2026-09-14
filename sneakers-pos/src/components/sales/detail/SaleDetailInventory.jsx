import { ExternalLink } from 'lucide-react'
import Card from '../../common/Card'

export default function SaleDetailInventory({ sale, onViewMovements }) {
  const items = sale?.items || []

  return (
    <Card>
      <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text mb-4">
        Inventario afectado
      </h2>

      {items.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-dark-muted">
          No hay movimientos de inventario registrados.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.key}
              className="rounded-lg border border-gray-100 dark:border-dark-border p-3"
            >
              <p className="text-sm font-medium text-brand-black dark:text-dark-text truncate">
                {item.productName} · {item.variantLabel}
              </p>
              <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                <div>
                  <p className="text-gray-500 dark:text-dark-muted">Antes</p>
                  <p className="font-semibold text-brand-black dark:text-dark-text">—</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-dark-muted">Movimiento</p>
                  <p className="font-semibold text-brand-red">
                    -{item.quantity}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-dark-muted">Después</p>
                  <p className="font-semibold text-brand-black dark:text-dark-text">—</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {items.length > 0 && (
        <button
          onClick={() => onViewMovements?.()}
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-blue hover:underline"
        >
          <ExternalLink size={11} strokeWidth={2.2} />
          Ver movimientos de inventario
        </button>
      )}
    </Card>
  )
}