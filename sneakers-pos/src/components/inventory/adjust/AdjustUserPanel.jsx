import Card from '../../common/Card'

export default function AdjustUserPanel({ user, timestamp }) {
  return (
    <Card>
      <h3 className="text-base font-semibold text-brand-black dark:text-dark-text mb-3">
        Registrado por
      </h3>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-brand-blue text-white flex items-center justify-center font-semibold">
          {(user?.name?.[0] || 'H').toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-brand-black dark:text-dark-text truncate">
            {user?.name || 'Henry'}
          </p>
          <p className="text-xs text-gray-500 dark:text-dark-muted truncate">
            {user?.role || 'Administrador'}
          </p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-dark-border">
        <p className="text-xs text-gray-500 dark:text-dark-muted">
          {new Date(timestamp).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}
        </p>
      </div>
    </Card>
  )
}