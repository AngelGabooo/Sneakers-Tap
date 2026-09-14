import Card from '../../common/Card'

const fmt = (n) => `$${Number(n || 0).toLocaleString('es-MX')}`

export default function CashCloseSalesByPayment({ payments = {} }) {
  const rows = [
    { key: 'cash',     label: 'Efectivo',      value: payments.cash },
    { key: 'card',     label: 'Tarjeta',       value: payments.card },
    { key: 'transfer', label: 'Transferencia', value: payments.transfer },
    { key: 'digital',  label: 'Pago digital',  value: payments.digital },
    { key: 'other',    label: 'Otro',          value: payments.other },
  ].filter((r) => r.value && r.value.count > 0)

  const totalCount = rows.reduce((a, r) => a + r.value.count, 0)
  const totalAmount = rows.reduce((a, r) => a + (Number(r.value.amount) || 0), 0)

  return (
    <Card padded={false}>
      <div className="p-5 pb-0">
        <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
          Ventas de la sesión
        </h2>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Distribución por método de pago.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-dark-muted px-5 py-6">
          Aún no hay ventas registradas en esta sesión.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-gray-100 dark:border-dark-border bg-gray-50/60 dark:bg-dark-surface/60">
                {['Método', 'Ventas', 'Total'].map((h) => (
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
              {rows.map(({ key, label, value }) => (
                <tr
                  key={key}
                  className="border-b border-gray-100 dark:border-dark-border last:border-0"
                >
                  <td className="px-5 py-3 text-brand-black dark:text-dark-text font-medium">
                    {label}
                  </td>
                  <td className="px-5 py-3 text-gray-700 dark:text-dark-muted">
                    {value.count}
                  </td>
                  <td className="px-5 py-3 font-semibold text-brand-black dark:text-dark-text">
                    {fmt(value.amount)}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50/60 dark:bg-dark-surface/60 font-bold">
                <td className="px-5 py-3 text-brand-black dark:text-dark-text">Total</td>
                <td className="px-5 py-3 text-brand-black dark:text-dark-text">{totalCount}</td>
                <td className="px-5 py-3 text-brand-black dark:text-dark-text">{fmt(totalAmount)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}