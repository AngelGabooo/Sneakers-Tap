// src/components/credits/CreditsStats.jsx
import { Wallet, AlertTriangle, Clock, TrendingUp } from 'lucide-react'

const fmt = (n) => `$${Number(n || 0).toLocaleString('es-MX')}`

export default function CreditsStats({ stats }) {
  const cards = [
    {
      icon: Wallet,
      label: 'Créditos activos',
      value: stats.activeCount,
      tone: 'blue',
    },
    {
      icon: AlertTriangle,
      label: 'Vencidos',
      value: stats.overdueCount,
      tone: stats.overdueCount > 0 ? 'red' : 'gray',
    },
    {
      icon: Clock,
      label: 'Por cobrar',
      value: fmt(stats.totalPending),
      tone: 'amber',
    },
    {
      icon: TrendingUp,
      label: 'Total histórico',
      value: fmt(stats.totalLent),
      tone: 'emerald',
    },
  ]

  const tones = {
    blue:    'bg-blue-50 dark:bg-blue-950/30 text-brand-blue border-blue-100 dark:border-blue-900/40',
    red:     'bg-red-50 dark:bg-red-950/30 text-brand-red border-red-100 dark:border-red-900/40',
    amber:   'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/40',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40',
    gray:    'bg-gray-50 dark:bg-dark-surface text-gray-500 dark:text-dark-muted border-gray-200 dark:border-dark-border',
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-5">
      {cards.map(({ icon: Icon, label, value, tone }) => (
        <div
          key={label}
          className={`
            rounded-xl border p-4
            ${tones[tone]}
          `}
        >
          <div className="flex items-center gap-2 mb-2">
            <Icon size={16} strokeWidth={2} />
            <p className="text-[11px] font-semibold uppercase tracking-wider opacity-80">
              {label}
            </p>
          </div>
          <p className="text-xl lg:text-2xl font-bold">
            {value}
          </p>
        </div>
      ))}
    </div>
  )
}