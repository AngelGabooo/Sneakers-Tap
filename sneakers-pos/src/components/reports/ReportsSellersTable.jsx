import Card from '../common/Card'

const fmtMoney = (n) =>
  `$${Number(n || 0).toLocaleString('es-MX', { maximumFractionDigits: 0 })}`

export default function ReportsSellersTable({ sellers = [] }) {
  return (
    <Card padded={false}>
      <div className="p-5 pb-0">
        <h3 className="text-base font-semibold text-brand-black dark:text-dark-text">
          Rendimiento por vendedor
        </h3>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Top del periodo seleccionado.
        </p>
      </div>

      {sellers.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-dark-muted px-5 py-6">
          Sin datos en el periodo.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-gray-100 dark:border-dark-border bg-gray-50/60 dark:bg-dark-surface/60">
                {['Vendedor', 'Ventas', 'Ingresos', 'Ticket', 'Devoluciones'].map((h) => (
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
              {sellers.map((s) => (
                <tr key={s.name} className="border-b border-gray-100 dark:border-dark-border last:border-0">
                  <td className="px-5 py-3 text-brand-black dark:text-dark-text font-medium">{s.name}</td>
                  <td className="px-5 py-3 text-gray-700 dark:text-dark-muted">{s.count}</td>
                  <td className="px-5 py-3 font-semibold text-brand-black dark:text-dark-text">
                    {fmtMoney(s.revenue)}
                  </td>
                  <td className="px-5 py-3 text-gray-700 dark:text-dark-muted">{fmtMoney(s.avgTicket)}</td>
                  <td className="px-5 py-3 text-gray-700 dark:text-dark-muted">{s.refunds}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}