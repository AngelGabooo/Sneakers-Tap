import { AlertTriangle, ShieldAlert, Clock } from 'lucide-react'

export default function CashCurrentAlerts({ alerts = [] }) {
  if (alerts.length === 0) return null

  const iconMap = {
    warning: AlertTriangle,
    danger:  ShieldAlert,
    info:    Clock,
  }

  const toneMap = {
    warning: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300',
    danger:  'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 text-brand-red',
    info:    'bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/50 text-brand-blue',
  }

  return (
    <div className="space-y-3 mb-5">
      {alerts.map((a, i) => {
        const Icon = iconMap[a.tone] || AlertTriangle
        return (
          <div
            key={i}
            className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 rounded-lg border ${toneMap[a.tone]}`}
          >
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <Icon size={16} strokeWidth={2.2} className="shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">{a.title}</p>
                {a.description && (
                  <p className="text-xs opacity-80 mt-0.5">{a.description}</p>
                )}
              </div>
            </div>
            {a.actionLabel && (
              <button
                onClick={a.onAction}
                className="text-sm font-medium underline hover:no-underline self-start sm:self-auto"
              >
                {a.actionLabel}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}