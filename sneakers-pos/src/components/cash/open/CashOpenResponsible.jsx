import Card from '../../common/Card'

export default function CashOpenResponsible({ user }) {
  return (
    <Card>
      <header className="mb-4">
        <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
          Responsable de la caja
        </h2>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          La apertura quedará registrada a nombre de este usuario.
        </p>
      </header>

      <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-dark-border">
        <div className="w-10 h-10 rounded-full bg-brand-blue text-white flex items-center justify-center font-semibold shrink-0">
          {(user?.name?.[0] || 'H').toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-brand-black dark:text-dark-text truncate">
            {user?.name || 'Henry Sneakers'}
          </p>
          <p className="text-xs text-gray-500 dark:text-dark-muted truncate">
            {user?.role || 'Administrador'}
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-500 dark:text-dark-muted">
        Si necesitas asignar otro responsable, hazlo desde la configuración de usuarios.
      </p>
    </Card>
  )
}