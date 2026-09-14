import { ExternalLink } from 'lucide-react'
import Card from '../../common/Card'

const fmt = (n) => `$${Number(n || 0).toLocaleString('es-MX')}`

export default function CashCloseMovements({ summary, onViewAll }) {
  const {
    initialFund = 0,
    cashSales = 0,
    cashIn = 0,
    cashOut = 0,
    refunds = 0,
  } = summary || {}

  const rows = [
    { label: 'Fondo inicial',          value: initialFund,  tone: 'neutral' },
    { label: 'Ventas en efectivo',     value: cashSales,    tone: 'info' },
    { label: 'Entrada de efectivo',    value: cashIn,       tone: 'info' },
    { label: 'Retiro de efectivo',     value: -cashOut,     tone: 'danger' },
    { label: 'Reembolsos en efectivo', value: -refunds,     tone: refunds ? 'danger' : 'neutral' },
  ]

  return (
    <Card>
      <header className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
            Movimientos de efectivo
          </h2>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
            Operaciones que afectan al efectivo físico de la caja.
          </p>
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="inline-flex items-center gap-1 text-xs font-medium text-brand-blue hover:underline shrink-0"
          >
            <ExternalLink size={11} strokeWidth={2.2} />
            Ver movimientos
          </button>
        )}
      </header>

      <ul className="space-y-2 text-sm">
        {rows.map(({ label, value, tone }) => (
          <li key={label} className="flex items-center justify-between gap-3">
            <span className="text-gray-500 dark:text-dark-muted">{label}</span>
            <span className={`font-semibold ${
              tone === 'danger' ? 'text-brand-red'
              : tone === 'info' ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-brand-black dark:text-dark-text'
            }`}>
              {value >= 0 ? '+' : ''}{fmt(value)}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  )
}