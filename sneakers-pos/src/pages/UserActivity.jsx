// src/pages/UserActivity.jsx
import { useMemo } from 'react'
import { useUsers } from '../context/UsersContext'
import { useView } from '../context/ViewContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import { ArrowLeft, Activity, Circle } from 'lucide-react'

export default function UserActivity() {
  const { navigate, viewParams } = useView()
  const { getUserById, getUserActivity, getUserSessions } = useUsers()

  const userId = viewParams?.id
  const user = useMemo(() => (userId ? getUserById(userId) : null), [userId, getUserById])
  const activity = useMemo(() => (userId ? getUserActivity(userId) : []), [userId, getUserActivity])
  const sessions = useMemo(() => (userId ? getUserSessions(userId) : []), [userId, getUserSessions])

  const handleNavigate = (key) => navigate(key)

  if (!user) {
    return (
      <DashboardLayout activeKey="users" onNavigate={handleNavigate}>
        <div className="text-center py-16">
          <p className="text-sm text-gray-500 dark:text-dark-muted">
            Usuario no encontrado.
          </p>
          <button
            onClick={() => navigate('users')}
            className="mt-4 text-sm font-medium text-brand-blue hover:underline"
          >
            Volver a usuarios
          </button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeKey="users" onNavigate={handleNavigate}>
      <nav className="flex items-center gap-1.5 text-sm mb-5">
        <button
          type="button"
          onClick={() => navigate('users')}
          className="inline-flex items-center gap-1.5 text-gray-500 dark:text-dark-muted hover:text-brand-blue transition-colors font-medium"
        >
          <ArrowLeft size={14} />
          Usuarios y empleados
        </button>
      </nav>

      <header className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-brand-black dark:text-dark-text tracking-tight">
          Actividad de {user.fullName}
        </h1>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-1">
          Últimos eventos registrados para este usuario.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-4">
          <p className="text-xs text-gray-500 dark:text-dark-muted">Total eventos</p>
          <p className="text-2xl font-bold text-brand-black dark:text-dark-text mt-1">
            {activity.length}
          </p>
        </div>
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-4">
          <p className="text-xs text-gray-500 dark:text-dark-muted">Sesiones registradas</p>
          <p className="text-2xl font-bold text-brand-black dark:text-dark-text mt-1">
            {sessions.length}
          </p>
        </div>
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-4">
          <p className="text-xs text-gray-500 dark:text-dark-muted">Último acceso</p>
          <p className="text-sm font-semibold text-brand-black dark:text-dark-text mt-1">
            {user.lastAccess
              ? new Date(user.lastAccess).toLocaleString('es-MX')
              : 'Sin registro'}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={16} className="text-brand-blue" />
          <h2 className="text-sm font-semibold text-brand-black dark:text-dark-text">
            Bitácora de actividad
          </h2>
        </div>

        {activity.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500 dark:text-dark-muted">
              Sin actividad registrada para este usuario.
            </p>
          </div>
        ) : (
          <ol className="relative border-l border-gray-200 dark:border-dark-border ml-2 space-y-4">
            {activity.map((a) => (
              <li key={a.id} className="pl-5 relative">
                <Circle
                  size={10}
                  className="absolute -left-[5px] top-1.5 fill-brand-blue text-brand-blue"
                />
                <p className="text-sm text-brand-black dark:text-dark-text">
                  {a.label}
                </p>
                <p className="text-xs text-gray-400 dark:text-dark-muted mt-0.5">
                  {new Date(a.at).toLocaleString('es-MX')}
                  {a.by && ` · por ${a.by}`}
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </DashboardLayout>
  )
}