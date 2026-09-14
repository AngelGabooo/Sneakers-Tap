import { TrendingUp, TrendingDown, DollarSign, Receipt, ShoppingBag } from 'lucide-react'
import Card from '../common/Card'

const fmtMoney = (n) =>
  `$${Number(n || 0).toLocaleString('es-MX', { maximumFractionDigits: 0 })}`

const fmtNumber = (n) => Number(n || 0).toLocaleString('es-MX')

function DeltaIndicator({ current, previous }) {
  if (previous == null || previous === 0 || current == null) return null
  const delta = current - previous
  const pct = previous !== 0 ? (delta / previous) * 100 : 0
  const positive = delta >= 0
  const Icon = positive ? TrendingUp : TrendingDown
  return (
    <span
      className={`
        inline-flex items-center gap-0.5 text-xs font-medium
        ${positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-brand-red'}
      `}
    >
      <Icon size={12} strokeWidth={2.4} />
      {positive ? '+' : ''}{pct.toFixed(1)}%
    </span>
  )
}

export default function ReportsKPI({ kpis, compare }) {
  const items = [
    {
      key: 'sales',
      label: 'Ventas netas',
      value: kpis?.netSales != null ? fmtMoney(kpis.netSales) : '—',
      helper: `${fmtNumber(kpis?.salesCount)} ventas`,
      icon: DollarSign,
      current: kpis?.netSales,
      previous: compare?.netSales,
    },
    {
      key: 'ticket',
      label: 'Ticket promedio',
      value: kpis?.avgTicket != null ? fmtMoney(kpis.avgTicket) : '—',
      helper: 'por venta',
      icon: Receipt,
      current: kpis?.avgTicket,
      previous: compare?.avgTicket,
    },
    {
      key: 'products',
      label: 'Productos vendidos',
      value: kpis?.productsSold != null ? fmtNumber(kpis.productsSold) : '—',
      helper: 'unidades',
      icon: ShoppingBag,
      current: kpis?.productsSold,
      previous: compare?.productsSold,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
      {items.map(({ key, label, value, helper, icon: Icon, current, previous }) => (
        <Card key={key} className="!p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
              <Icon size={17} className="text-brand-blue" strokeWidth={1.9} />
            </div>
            <p className="text-xs text-gray-500 dark:text-dark-muted">{label}</p>
          </div>

          <p className="text-2xl font-bold text-brand-black dark:text-dark-text leading-tight">
            {value}
          </p>

          <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-500 dark:text-dark-muted">
            <span>{helper}</span>
            <DeltaIndicator current={current} previous={previous} />
          </div>
        </Card>
      ))}
    </div>
  )
}