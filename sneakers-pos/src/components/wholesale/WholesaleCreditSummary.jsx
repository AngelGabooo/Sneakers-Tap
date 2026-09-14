import { CreditCard } from 'lucide-react'
import Card from '../common/Card'

const fmt = (n) =>
  `$${Number(n || 0).toLocaleString('es-MX', { maximumFractionDigits: 0 })}`

export default function WholesaleCreditSummary({ credit }) {
  const items = [
    { key: 'total',     label: 'Crédito total',  value: fmt(credit?.total) },
    { key: 'used',      label: 'Utilizado',      value: fmt(credit?.used) },
    { key: 'available', label: 'Disponible',     value: fmt(credit?.available), emphasis: true },
    { key: 'overdue',   label: 'Vencido',        value: fmt(credit?.overdue), tone: 'danger' },
  ]

  return (
    <Card className="mb-5">
      <header className="flex items-center gap-2 mb-3">
        <CreditCard size={15} className="text-brand-blue" strokeWidth={2} />
        <h2 className="text-sm font-semibold text-brand-black dark:text-dark-text">
          Situación de crédito
        </h2>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map(({ key, label, value, emphasis, tone }) => (
          <div key={key} className="rounded-lg border border-gray-100 dark:border-dark-border p-3">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 dark:text-dark-muted">
              {label}
            </p>
            <p className={`${emphasis ? 'text-lg font-bold text-brand-blue' : 'text-base font-semibold'} mt-0.5 ${
              tone === 'danger' ? 'text-brand-red' : 'text-brand-black dark:text-dark-text'
            }`}>
              {value}
            </p>
          </div>
        ))}
      </div>
    </Card>
  )
}