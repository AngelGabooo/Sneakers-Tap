import { Wallet, CheckCircle2, AlertTriangle, TrendingDown } from 'lucide-react'
import Card from '../../common/Card'

export default function CashHistoryStats({ stats }) {
  const items = [
    {
      key: 'sessions',
      label: 'Sesiones registradas',
      value: stats?.total ?? '—',
      icon: Wallet,
      tone: 'info',
    },
    {
      key: 'closed',
      label: 'Sesiones finalizadas',
      value: stats?.closed ?? '—',
      icon: CheckCircle2,
      tone: 'info',
    },
    {
      key: 'reconciled',
      label: 'Sin diferencias',
      value: stats?.reconciled ?? '—',
      icon: CheckCircle2,
      tone: 'success',
    },
    {
      key: 'diff',
      label: 'Requieren revisión',
      value: stats?.withDifference ?? '—',
      icon: AlertTriangle,
      tone: stats?.withDifference > 0 ? 'danger' : 'info',
    },
  ]

  const tones = {
    info:    'bg-blue-50 dark:bg-blue-950/40 text-brand-blue',
    success: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
    danger:  'bg-red-50 dark:bg-red-950/40 text-brand-red',
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
          <p className="text-xl font-bold text-brand-black dark:text-dark-text leading-tight">
            {value}
          </p>
        </Card>
      ))}
    </div>
  )
}