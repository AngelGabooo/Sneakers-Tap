import { Activity, Clock, Users, AlertCircle } from 'lucide-react'

export default function UsersActivitySummary({ summary }) {
  if (!summary) return null

  const items = [
    { icon: Activity, label: 'Sesiones activas', value: summary.activeSessions },
    { icon: Clock, label: 'Último acceso', value: summary.lastAccessLabel },
    { icon: Users, label: 'Acceso reciente', value: `${summary.recentAccessCount} empleados` },
    { icon: AlertCircle, label: 'Requieren atención', value: summary.requireAttention, tone: 'attention' },
  ]

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-5 px-1 text-sm text-gray-600 dark:text-dark-muted">
      {items.map(({ icon: Icon, label, value, tone }, idx) => (
        <div key={label} className="flex items-center gap-1.5">
          {idx > 0 && <span className="hidden sm:inline text-gray-300 dark:text-dark-border mr-1.5">·</span>}
          <Icon
            size={14}
            strokeWidth={2}
            className={tone === 'attention' ? 'text-amber-500' : 'text-gray-400 dark:text-dark-muted'}
          />
          <span className="text-gray-500 dark:text-dark-muted">{label}:</span>
          <span
            className={`font-medium ${
              tone === 'attention'
                ? 'text-amber-700 dark:text-amber-400'
                : 'text-brand-black dark:text-dark-text'
            }`}
          >
            {value}
          </span>
        </div>
      ))}
    </div>
  )
}