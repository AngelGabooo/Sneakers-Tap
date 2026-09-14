import { DollarSign, Wallet, TrendingUp, TrendingDown } from 'lucide-react'
import Card from '../../common/Card'

const fmt = (n) =>
  `$${Number(n || 0).toLocaleString('es-MX', { maximumFractionDigits: 0 })}`

export default function CashHistoryFinancial({ financial }) {
  const items = [
    {
      key: 'sales',
      label: 'Ventas totales',
      value: fmt(financial?.totalSales),
      icon: DollarSign,
      tone: 'info',
    },
    {
      key: 'expected',
      label: 'Efectivo esperado',
      value: fmt(financial?.expected),
      icon: Wallet,
      tone: 'info',
    },
    {
      key: 'counted',
      label: 'Efectivo contado',
      value: fmt(financial?.counted),
      icon: Wallet,
      tone: 'info',
    },
    {
      key: 'diff',
      label: 'Diferencias netas',
      value: `${financial?.netDiff >= 0 ? '+' : '-'}${fmt(Math.abs(financial?.netDiff))}`,
      icon: financial?.netDiff >= 0 ? TrendingUp : TrendingDown,
      tone: financial?.netDiff === 0 ? 'success'
        : financial?.netDiff > 0 ? 'warning'
        : 'danger',
    },
  ]

  const tones = {
    info:    'bg-blue-50 dark:bg-blue-950/40 text-brand-blue',
    success: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
    warning: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
    danger:  'bg-red-50 dark:bg-red-950/40 text-brand-red',
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-2">
      {items.map(({ key, label, value, icon: Icon, tone }) => (
        <Card key={key} className="!p-4">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${tones[tone]}`}>
              <Icon size={17} strokeWidth={1.9} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-dark-muted truncate">{label}</p>
              <p className="text-base font-bold text-brand-black dark:text-dark-text leading-tight truncate">
                {value}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}