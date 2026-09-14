import Card from '../common/Card'

const fmtMoney = (n) =>
  `$${Number(n || 0).toLocaleString('es-MX', { maximumFractionDigits: 0 })}`

export default function ReportsOverview({ summary }) {
  const items = [
    { key: 'gross',    label: 'Ingresos brutos',     value: summary?.grossSales },
    { key: 'discount', label: 'Descuentos',          value: summary?.discounts },
    { key: 'refunds',  label: 'Devoluciones',        value: summary?.refunds },
    { key: 'cancel',   label: 'Cancelaciones',       value: summary?.cancellations },
    { key: 'net',      label: 'Ventas netas',        value: summary?.netSales, emphasis: true },
    { key: 'profit',   label: 'Utilidad estimada',   value: summary?.profit, emphasis: true },
  ]

  return (
    <Card className="mb-5">
      <header className="mb-4">
        <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
          Resumen de ventas
        </h2>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Cálculo del periodo seleccionado.
        </p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {items.map(({ key, label, value, emphasis }) => (
          <div key={key} className="min-w-0">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 dark:text-dark-muted">
              {label}
            </p>
            <p
              className={`
                mt-0.5 truncate
                ${emphasis
                  ? 'text-lg font-bold text-brand-black dark:text-dark-text'
                  : 'text-sm font-medium text-brand-black dark:text-dark-text'}
              `}
            >
              {value != null ? fmtMoney(value) : '—'}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-border text-[11px] text-gray-400 dark:text-dark-muted">
        Las métricas se calculan a partir de las ventas registradas en el sistema. Si no hay datos en el periodo, los valores aparecen vacíos.
      </p>
    </Card>
  )
}