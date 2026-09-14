import { Package } from 'lucide-react'
import Card from '../../common/Card'

export default function SaleDetailItems({ sale, onViewProduct }) {
  const items = sale?.items || []

  return (
    <Card padded={false}>
      <div className="p-5 lg:p-6 pb-0">
        <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
          Productos
        </h2>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Productos y variantes vendidas en esta transacción.
        </p>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-dark-muted px-5 lg:px-6 py-8">
          Esta venta no tiene productos registrados.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm min-w-[820px]">
            <thead>
              <tr className="border-y border-gray-100 dark:border-dark-border bg-gray-50/60 dark:bg-dark-surface/60">
                {['Producto', 'Variante', 'SKU', 'Cant.', 'P. Unit.', 'Desc.', 'Imp.', 'Subtotal'].map((h) => (
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
              {items.map((item) => {
                const subtotal = Number(item.price) * Number(item.quantity)
                return (
                  <tr
                    key={item.key}
                    className="border-b border-gray-100 dark:border-dark-border last:border-0"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-dark-surface overflow-hidden shrink-0 flex items-center justify-center">
                          {item.imageUrl
                            ? <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                            : <Package size={16} className="text-gray-400" strokeWidth={1.8} />}
                        </div>
                        <button
                          onClick={() => onViewProduct?.(item.productId)}
                          className="text-sm font-medium text-brand-black dark:text-dark-text hover:text-brand-blue truncate text-left transition-colors"
                        >
                          {item.productName}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-700 dark:text-dark-muted whitespace-nowrap">
                      {item.variantLabel}
                    </td>
                    <td className="px-5 py-3 text-gray-700 dark:text-dark-muted text-xs font-mono whitespace-nowrap">
                      {item.sku}
                    </td>
                    <td className="px-5 py-3 font-semibold text-brand-black dark:text-dark-text whitespace-nowrap">
                      {item.quantity}
                    </td>
                    <td className="px-5 py-3 text-gray-700 dark:text-dark-muted whitespace-nowrap">
                      ${Number(item.price).toLocaleString('es-MX')}
                    </td>
                    <td className="px-5 py-3 text-brand-red whitespace-nowrap">
                      —
                    </td>
                    <td className="px-5 py-3 text-gray-700 dark:text-dark-muted whitespace-nowrap">
                      —
                    </td>
                    <td className="px-5 py-3 font-bold text-brand-black dark:text-dark-text whitespace-nowrap">
                      ${subtotal.toLocaleString('es-MX')}
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