import { PackageOpen } from 'lucide-react'
import Card from '../common/Card'
import EmptyState from '../common/EmptyState'

const fmtMoney = (n) =>
  `$${Number(n || 0).toLocaleString('es-MX', { maximumFractionDigits: 0 })}`

export default function ReportsTopProducts({ products = [] }) {
  const hasData = products.length > 0

  return (
    <Card padded={false}>
      <div className="p-5 pb-0">
        <h3 className="text-base font-semibold text-brand-black dark:text-dark-text">
          Productos más vendidos
        </h3>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Top del periodo seleccionado.
        </p>
      </div>

      {!hasData ? (
        <EmptyState
          icon={PackageOpen}
          title="Sin productos vendidos"
          description="No hay datos para mostrar."
        />
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-gray-100 dark:border-dark-border bg-gray-50/60 dark:bg-dark-surface/60">
                {['Producto', 'Unidades', 'Ventas', 'Ingresos'].map((h) => (
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
              {products.map((p) => (
                <tr
                  key={p.key}
                  className="border-b border-gray-100 dark:border-dark-border last:border-0 hover:bg-gray-50 dark:hover:bg-dark-surface/40 transition-colors"
                >
                  <td className="px-5 py-3 text-brand-black dark:text-dark-text font-medium truncate max-w-[280px]">
                    {p.name}
                  </td>
                  <td className="px-5 py-3 text-gray-700 dark:text-dark-muted">{p.units}</td>
                  <td className="px-5 py-3 text-gray-700 dark:text-dark-muted">{p.sales}</td>
                  <td className="px-5 py-3 font-semibold text-brand-black dark:text-dark-text">
                    {fmtMoney(p.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}