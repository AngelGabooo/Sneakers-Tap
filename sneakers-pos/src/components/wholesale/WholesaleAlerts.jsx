import { AlertTriangle, Clock, TrendingDown } from 'lucide-react'
import Card from '../common/Card'

export default function WholesaleAlerts({ alerts = [], onFilterClick }) {
  if (alerts.length === 0) return null

  const iconMap = {
    overdue:  AlertTriangle,
    limit:    TrendingDown,
    inactive: Clock,
  }

  const toneMap = {
    overdue:  'text-brand-red',
    limit:    'text-amber-600 dark:text-amber-400',
    inactive: 'text-gray-500 dark:text-dark-muted',
  }

  return (
    <Card className="mb-5">
      <h2 className="text-sm font-semibold text-brand-black dark:text-dark-text mb-3">
        Requieren atención
      </h2>

      <ul className="space-y-3">
        {alerts.map((a, i) => {
          const Icon = iconMap[a.type] || AlertTriangle
          return (
            <li key={i} className="flex items-start gap-3">
              <Icon size={15} strokeWidth={2.2} className={`${toneMap[a.type]} shrink-0 mt-0.5`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-brand-black dark:text-dark-text">
                  {a.label}
                </p>
              </div>
              <button
                onClick={() => onFilterClick?.(a.filter)}
                className="text-xs font-medium text-brand-blue hover:underline shrink-0"
              >
                Ver clientes
              </button>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}