import { Package, ShoppingBag } from 'lucide-react'
import Card from '../common/Card'
import Button from '../common/Button'

export default function InventoryLowStockSection({ items = [], onCreatePurchase }) {
  if (items.length === 0) return null

  return (
    <Card padded={false}>
      <div className="p-5 lg:p-6 pb-0 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
            Productos por reponer
          </h3>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
            Variantes con stock igual o por debajo del mínimo.
          </p>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="border-y border-gray-100 dark:border-dark-border bg-gray-50/60 dark:bg-dark-surface/60">
              {['Producto', 'Variante', 'Stock', 'Mínimo', 'Sugerido', 'Proveedor'].map((h) => (
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
            {items.map((row) => (
              <tr
                key={row.id}
                className="border-b border-gray-100 dark:border-dark-border last:border-0"
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-md bg-gray-100 dark:bg-dark-surface overflow-hidden shrink-0 flex items-center justify-center">
                      {row.imageUrl
                        ? <img src={row.imageUrl} alt="" className="w-full h-full object-cover" />
                        : <Package size={14} className="text-gray-400" />}
                    </div>
                    <span className="text-brand-black dark:text-dark-text font-medium">
                      {row.productName}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3 text-gray-700 dark:text-dark-muted whitespace-nowrap">
                  {row.label}
                </td>
                <td className="px-5 py-3 font-semibold text-brand-red whitespace-nowrap">
                  {row.stock}
                </td>
                <td className="px-5 py-3 text-gray-700 dark:text-dark-muted whitespace-nowrap">
                  {row.minStock}
                </td>
                <td className="px-5 py-3 font-semibold text-brand-black dark:text-dark-text whitespace-nowrap">
                  {row.suggested}
                </td>
                <td className="px-5 py-3 text-gray-700 dark:text-dark-muted whitespace-nowrap">
                  {row.supplier || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-5 lg:p-6 pt-4">
        <Button variant="primary" icon={ShoppingBag} onClick={onCreatePurchase}>
          Crear compra
        </Button>
      </div>
    </Card>
  )
}