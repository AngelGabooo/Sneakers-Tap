import Card from '../common/Card'

const fmtMoney = (n) =>
  `$${Number(n || 0).toLocaleString('es-MX', { maximumFractionDigits: 0 })}`

export default function ReportsBranchesTable({ branches = [] }) {
  return (
    <Card padded={false}>
      <div className="p-5 pb-0">
        <h3 className="text-base font-semibold text-brand-black dark:text-dark-text">
          Rendimiento por sucursal
        </h3>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Distribución por ubicación.
        </p>
      </div>

      {branches.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-dark-muted px-5 py-6">
          Sin datos en el periodo.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-gray-100 dark:border-dark-border bg-gray-50/60 dark:bg-dark-surface/60">
                {['Sucursal', 'Ventas', 'Ingresos', 'Productos', 'Ticket'].map((h) => (
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
              {branches.map((b) => (
                <tr key={b.name} className="border-b border-gray-100 dark:border-dark-border last:border-0">
                  <td className="px-5 py-3 text-brand-black dark:text-dark-text font-medium">{b.name}</td>
                  <td className="px-5 py-3 text-gray-700 dark:text-dark-muted">{b.count}</td>
                  <td className="px-5 py-3 font-semibold text-brand-black dark:text-dark-text">
                    {fmtMoney(b.revenue)}
                  </td>
                  <td className="px-5 py-3 text-gray-700 dark:text-dark-muted">{b.products}</td>
                  <td className="px-5 py-3 text-gray-700 dark:text-dark-muted">{fmtMoney(b.avgTicket)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}