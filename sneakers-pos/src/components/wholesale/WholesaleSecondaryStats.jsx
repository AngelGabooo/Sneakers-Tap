import Card from '../common/Card'

const fmt = (n) =>
  `$${Number(n || 0).toLocaleString('es-MX', { maximumFractionDigits: 0 })}`

export default function WholesaleSecondaryStats({ stats }) {
  const items = [
    { key: 'sales',    label: 'Ventas mayoristas del mes', value: fmt(stats?.sales) },
    { key: 'orders',   label: 'Pedidos del mes',           value: stats?.orders ?? '—' },
    { key: 'avg',      label: 'Ticket promedio',           value: fmt(stats?.avgTicket) },
    { key: 'avail',    label: 'Crédito disponible',        value: fmt(stats?.creditAvailable) },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      {items.map(({ key, label, value }) => (
        <Card key={key} className="!p-3">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 dark:text-dark-muted truncate">
            {label}
          </p>
          <p className="text-base font-bold text-brand-black dark:text-dark-text mt-1 truncate">
            {value}
          </p>
        </Card>
      ))}
    </div>
  )
}