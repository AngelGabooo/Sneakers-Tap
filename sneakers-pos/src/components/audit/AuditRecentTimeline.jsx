import Card from '../common/Card'
import { getActionLabel, getModuleLabel, getLevelMeta } from '../../data/audit'

export default function AuditRecentTimeline({ events = [] }) {
  const visible = events.slice(0, 6)

  if (visible.length === 0) return null

  return (
    <Card className="mb-5">
      <h3 className="text-sm font-semibold text-brand-black dark:text-dark-text mb-3">
        Actividad reciente
      </h3>

      <ul className="space-y-3">
        {visible.map((e) => {
          const level = getLevelMeta(e.level)
          return (
            <li key={e.id} className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                level.variant === 'danger' ? 'bg-brand-red'
                : level.variant === 'info' ? 'bg-brand-blue'
                : 'bg-gray-400'
              }`} />
              <div className="flex-1 min-w-0 text-sm">
                <p className="text-brand-black dark:text-dark-text truncate">
                  <span className="font-medium">{e.user?.name || 'Sistema'}</span>{' '}
                  <span className="text-gray-500 dark:text-dark-muted">
                    {getActionLabel(e.action).toLowerCase()}
                  </span>{' '}
                  <span className="text-gray-500 dark:text-dark-muted">
                    {e.entityName || getModuleLabel(e.module)}
                  </span>
                </p>
                <p className="text-xs text-gray-400 dark:text-dark-muted mt-0.5">
                  {new Date(e.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}