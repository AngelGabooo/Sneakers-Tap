// src/pages/UserSessions.jsx
import { useMemo } from 'react'
import { useUsers } from '../context/UsersContext'
import { useView } from '../context/ViewContext'
import { useAuth } from '../context/AuthContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import { ArrowLeft, Monitor, Smartphone, LogOut } from 'lucide-react'

function detectDevice(ua) {
  if (!ua) return { type: 'desconocido', label: 'Desconocido' }
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua)
  const browser =
    /Edg\//.test(ua) ? 'Edge'
    : /Chrome\//.test(ua) ? 'Chrome'
    : /Firefox\//.test(ua) ? 'Firefox'
    : /Safari\//.test(ua) ? 'Safari'
    : 'Navegador'
  const os =
    /Windows/.test(ua) ? 'Windows'
    : /Mac OS/.test(ua) ? 'macOS'
    : /Android/.test(ua) ? 'Android'
    : /iPhone|iPad/.test(ua) ? 'iOS'
    : /Linux/.test(ua) ? 'Linux'
    : ''
  return {
    type: isMobile ? 'mobile' : 'desktop',
    label: `${browser}${os ? ` · ${os}` : ''}`,
  }
}

export default function UserSessions() {
  const { navigate, viewParams } = useView()
  const { user: currentUser } = useAuth()
  const { getUserById, getUserSessions, closeRemoteSession, logActivity } = useUsers()

  const userId = viewParams?.id
  const user = useMemo(() => (userId ? getUserById(userId) : null), [userId, getUserById])
  const sessions = useMemo(() => (userId ? getUserSessions(userId) : []), [userId, getUserSessions])

  const handleNavigate = (key) => navigate(key)

  const handleCloseRemote = (session) => {
    if (session.endedAt) return
    const ok = window.confirm(
      `¿Cerrar la sesión iniciada el ${new Date(session.startedAt).toLocaleString('es-MX')}?`,
    )
    if (!ok) return
    closeRemoteSession(user.id, session.id, `Cerrada por ${currentUser?.name || 'administrador'}`)
    logActivity(user.id, {
      type: 'session',
      label: 'Sesión cerrada remotamente',
      by: currentUser?.name || 'Administrador',
    })
    // Forzar re-render
    window.location.reload()
  }

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
          className="inline-flex items-center gap-1.5 text-gray-500 dark:text-dark-muted hover:text-blue-600 transition-colors font-medium"
        >
          <ArrowLeft size={14} />
          Usuarios y empleados
        </button>
      </nav>

      <header className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-brand-black dark:text-dark-text tracking-tight">
          Sesiones de {user.fullName}
        </h1>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-1">
          Historial de accesos registrados en este dispositivo.
        </p>
      </header>

      <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden">
        {sessions.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-gray-500 dark:text-dark-muted">
              Sin sesiones registradas.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-dark-border">
            {sessions.map((s) => {
              const device = detectDevice(s.device)
              const isActive = !s.endedAt
              const DeviceIcon = device.type === 'mobile' ? Smartphone : Monitor
              return (
                <li key={s.id} className="px-5 py-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                      : 'bg-gray-100 dark:bg-dark-card text-gray-400 dark:text-dark-muted'
                  }`}>
                    <DeviceIcon size={18} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-brand-black dark:text-dark-text">
                      {device.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-dark-muted mt-0.5">
                      Inicio: {new Date(s.startedAt).toLocaleString('es-MX')}
                    </p>
                    {s.endedAt && (
                      <p className="text-xs text-gray-500 dark:text-dark-muted">
                        Fin: {new Date(s.endedAt).toLocaleString('es-MX')}
                        {s.endReason && ` · ${s.endReason}`}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {isActive ? (
                      <>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                          ● Activa
                        </span>
                        <button
                          onClick={() => handleCloseRemote(s)}
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border border-gray-200 dark:border-dark-border text-brand-red hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          <LogOut size={12} />
                          Cerrar
                        </button>
                      </>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-500 dark:bg-dark-card dark:text-dark-muted">
                        Finalizada
                      </span>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </DashboardLayout>
  )
}