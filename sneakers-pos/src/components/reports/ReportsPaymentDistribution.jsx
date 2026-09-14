import Card from '../common/Card'

const fmtMoney = (n) =>
  `$${Number(n || 0).toLocaleString('es-MX', { maximumFractionDigits: 0 })}`

export default function ReportsPaymentDistribution({ payments = {} }) {
  const rows = [
    { key: 'cash',     label: 'Efectivo',      value: payments.cash },
    { key: 'card',     label: 'Tarjeta',       value: payments.card },
    { key: 'transfer', label: 'Transferencia', value: payments.transfer },
    { key: 'digital',  label: 'Pago digital',  value: payments.digital },
    { key: 'other',    label: 'Otro',          value: payments.other },
  ].filter((r) => r.value && r.value.amount > 0)

  const total = rows.reduce((a, r) => a + (Number(r.value.amount) || 0), 0)

  return (
    <Card padded={false}>
      <div className="p-5 pb-0">
        <h3 className="text-base font-semibold text-brand-black dark:text-dark-text">
          Ventas por método de pago
        </h3>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Distribución del periodo.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-dark-muted px-5 py-6">
          Sin datos en el periodo.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-gray-100 dark:divide-dark-border">
          {rows.map(({ key, label, value }) => {
            const pct = total > 0 ? (value.amount / total) * 100 : 0
            return (
              <li key={key} className="px-5 py-3">
                <div className="flex items-center justify-between gap-3 text-sm mb-1.5">
                  <span className="text-brand-black dark:text-dark-text font-medium">{label}</span>
                  <span className="text-gray-500 dark:text-dark-muted text-xs">
                    {pct.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-dark-surface overflow-hidden">
                    <div
                      className="h-full bg-brand-blue"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-brand-black dark:text-dark-text whitespace-nowrap">
                    {fmtMoney(value.amount)}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}