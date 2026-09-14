import { Activity } from 'lucide-react'
import Card from '../common/Card'
import EmptyState from '../common/EmptyState'

export default function RecentActivityCard({ activities = [] }) {
  const hasData = activities.length > 0

  return (
    <Card>
      <div className="mb-4">
        <h3 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
          Actividad reciente
        </h3>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Últimos movimientos del sistema
        </p>
      </div>

      {hasData ? (
        <ul className="space-y-3.5">
          {activities.map((a) => (
            <li key={a.id} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-dark-surface flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-dark-muted shrink-0">
                {(a.user?.[0] || '?').toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-brand-black dark:text-dark-text">
                  <span className="font-semibold">{a.user}</span>{' '}
                  <span className="text-gray-600 dark:text-dark-muted">{a.action}</span>
                </p>
                <p className="text-xs text-gray-400 dark:text-dark-muted mt-0.5">{a.at}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Activity}
          title="Sin actividad reciente"
          description="Aquí verás las últimas acciones de los usuarios."
        />
      )}
    </Card>
  )
}