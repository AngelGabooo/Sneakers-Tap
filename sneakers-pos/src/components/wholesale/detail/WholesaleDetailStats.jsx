import { DollarSign, Package, Wallet, CreditCard } from 'lucide-react'
import Card from '../../common/Card'

const fmt = (n) =>
  `$${Number(n || 0).toLocaleString('es-MX', { maximumFractionDigits: 0 })}`

export default function WholesaleDetailStats({ stats }) {
  const items = [
    {
      key: 'sales',
      label: 'Compras del mes',
      value: fmt(stats?.salesInPeriod),
      icon: DollarSign,
      tone: 'info',
    },
    {
      key: 'orders',
      label: 'Pedidos',
      value: stats?.ordersInPeriod ?? '—',
      icon: Package,
      tone: 'info',
    },
    {
      key: 'balance',
      label: 'Saldo pendiente',
      value: fmt(stats?.balance),
      icon: Wallet,
      tone: stats?.balance > 0 ? 'warning' : 'info',
    },
    {
      key: 'available',
      label: 'Crédito disponible',
      value: fmt(stats?.creditAvailable),
      icon: CreditCard,
      tone: 'success',
    },
  ]

  const tones = {
    info:    'bg-blue-50 dark:bg-blue-950/40 text-brand-blue',
    success: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
    warning: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      {items.map(({ key, label, value, icon: Icon, tone }) => (
        <Card key={key} className="!p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${tones[tone]}`}>
              <Icon size={17} strokeWidth={1.9} />
            </div>
            <p className="text-xs text-gray-500 dark:text-dark-muted truncate">{label}</p>
          </div>
          <p className="text-xl font-bold text-brand-black dark:text-dark-text leading-tight truncate">
            {value}
          </p>
        </Card>
      ))}
    </div>
  )
}