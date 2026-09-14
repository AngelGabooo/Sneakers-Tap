import { Users, CheckCircle2, CreditCard, Wallet } from 'lucide-react'
import Card from '../common/Card'

const fmt = (n) =>
  `$${Number(n || 0).toLocaleString('es-MX', { maximumFractionDigits: 0 })}`

export default function WholesaleStats({ stats }) {
  const items = [
    {
      key: 'total',
      label: 'Clientes mayoristas',
      value: stats?.total ?? '—',
      note: 'Registrados',
      icon: Users,
      tone: 'info',
    },
    {
      key: 'active',
      label: 'Activos',
      value: stats?.active ?? '—',
      note: 'Con relación vigente',
      icon: CheckCircle2,
      tone: 'success',
    },
    {
      key: 'withCredit',
      label: 'Con crédito',
      value: stats?.withCredit ?? '—',
      note: 'Con línea de crédito',
      icon: CreditCard,
      tone: 'info',
    },
    {
      key: 'pending',
      label: 'Saldo pendiente',
      value: fmt(stats?.pendingBalance),
      note: stats?.overdueCount > 0
        ? `${stats.overdueCount} con pago vencido`
        : 'Por cobrar',
      icon: Wallet,
      tone: stats?.overdueCount > 0 ? 'danger' : 'info',
    },
  ]

  const tones = {
    info:    'bg-blue-50 dark:bg-blue-950/40 text-brand-blue',
    success: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
    danger:  'bg-red-50 dark:bg-red-950/40 text-brand-red',
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
      {items.map(({ key, label, value, note, icon: Icon, tone }) => (
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
          <p className="text-[11px] text-gray-400 dark:text-dark-muted mt-0.5 truncate">{note}</p>
        </Card>
      ))}
    </div>
  )
}