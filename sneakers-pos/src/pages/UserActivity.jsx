// src/pages/UserActivity.jsx
import { useEffect, useMemo, useState } from 'react'
import { useUsers } from '../context/UsersContext'
import { useView } from '../context/ViewContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import {
  ArrowLeft, Activity, Circle, ShoppingCart, Shield, LogIn, LogOut,
  Loader2, RefreshCw,
} from 'lucide-react'

const TYPE_CONFIG = {
  sale:     { icon: ShoppingCart, color: 'text-green-600 dark:text-green-400',   bg: 'bg-green-50 dark:bg-green-950/40' },
  audit:    { icon: Shield,       color: 'text-blue-600 dark:text-blue-400',     bg: 'bg-blue-50 dark:bg-blue-950/40' },
  session:  { icon: LogIn,        color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/40' },
  default:  { icon: Activity,     color: 'text-gray-600 dark:text-gray-400',     bg: 'bg-gray-50 dark:bg-gray-950/40' },
}

export default function UserActivity() {
  const { navigate, viewParams } = useView()
  const { getUserById, getUserActivity, getUserSessions } = useUsers()

  const userId = viewParams?.id
  const user = useMemo(() => (userId ? getUserById(userId) : null), [userId, getUserById])

  const [activity, setActivity] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    async function load() {
      if (!userId) {
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const [act, sess] = await Promise.all([
          getUserActivity(userId),
          getUserSessions(userId),
        ])
        if (alive) {
          setActivity(act || [])
          setSessions(sess || [])
        }
      } catch (err) {
        console.error('❌ Error cargando actividad:', err)
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [userId, getUserActivity, getUserSessions])

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
          Ventas, sesiones y eventos de auditoría registrados para este usuario.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <StatCard label="Total eventos" value={activity.length} loading={loading} />
        <StatCard label="Sesiones registradas" value={sessions.length} loading={loading} />
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
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-brand-blue" />
            <h2 className="text-sm font-semibold text-brand-black dark:text-dark-text">
              Bitácora de actividad
            </h2>
          </div>
          {loading && <Loader2 size={14} className="animate-spin text-brand-blue" />}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 size={24} className="animate-spin text-brand-blue mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-dark-muted">
              Cargando actividad…
            </p>
          </div>
        ) : activity.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500 dark:text-dark-muted">
              Sin actividad registrada para este usuario.
            </p>
          </div>
        ) : (
          <ol className="relative border-l border-gray-200 dark:border-dark-border ml-2 space-y-4">
            {activity.map((a) => {
              const cfg = TYPE_CONFIG[a.type] || TYPE_CONFIG.default
              const Icon = cfg.icon
              return (
                <li key={a.id} className="pl-5 relative">
                  <div className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full ${cfg.bg} ring-2 ring-white dark:ring-dark-surface flex items-center justify-center`}>
                    <Icon size={9} className={cfg.color} strokeWidth={2.5} />
                  </div>
                  <p className="text-sm text-brand-black dark:text-dark-text">
                    {a.label}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-dark-muted mt-0.5">
                    {new Date(a.at).toLocaleString('es-MX')}
                    {a.by && ` · por ${a.by}`}
                  </p>
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </DashboardLayout>
  )
}

function StatCard({ label, value, loading }) {
  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-4">
      <p className="text-xs text-gray-500 dark:text-dark-muted">{label}</p>
      {loading ? (
        <div className="h-8 w-12 bg-gray-100 dark:bg-dark-card rounded animate-pulse mt-1" />
      ) : (
        <p className="text-2xl font-bold text-brand-black dark:text-dark-text mt-1">
          {value}
        </p>
      )}
    </div>
  )
}