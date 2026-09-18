// src/pages/UserSessions.jsx
import { useEffect, useMemo, useState } from 'react'
import { useUsers } from '../context/UsersContext'
import { useView } from '../context/ViewContext'
import { useAuth } from '../context/AuthContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import { ArrowLeft, Monitor, Smartphone, LogOut, Loader2, RefreshCw } from 'lucide-react'

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

function fmtDuration(startIso, endIso) {
  if (!startIso) return '—'
  const start = new Date(startIso).getTime()
  const end = endIso ? new Date(endIso).getTime() : Date.now()
  const diff = Math.max(0, end - start)
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m`
  return 'menos de 1m'
}

export default function UserSessions() {
  const { navigate, viewParams } = useView()
  const { user: currentUser } = useAuth()
  const { getUserById, getUserSessions, closeRemoteSession, logActivity } = useUsers()

  const userId = viewParams?.id
  const user = useMemo(() => (userId ? getUserById(userId) : null), [userId, getUserById])

  // ⭐ FIX: usar estado local + async
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [closing, setClosing] = useState(null)

  useEffect(() => {
    let alive = true
    async function load() {
      if (!userId) {
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const list = await getUserSessions(userId)
        if (alive) setSessions(Array.isArray(list) ? list : [])
      } catch (err) {
        console.error('❌ Error cargando sesiones:', err)
        if (alive) setSessions([])
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [userId, getUserSessions])

  const handleNavigate = (key) => navigate(key)

  const handleCloseRemote = async (session) => {
    if (session.endedAt) return
    const ok = window.confirm(
      `¿Cerrar la sesión iniciada el ${new Date(session.startedAt).toLocaleString('es-MX')}?`,
    )
    if (!ok) return

    setClosing(session.id)
    try {
      await closeRemoteSession(
        user.id,
        session.id,
        `Cerrada por ${currentUser?.name || 'administrador'}`,
      )
      logActivity(user.id, {
        type: 'session',
        label: 'Sesión cerrada remotamente',
        by: currentUser?.name || 'Administrador',
      })
      // Recargar sesiones
      const list = await getUserSessions(userId)
      setSessions(Array.isArray(list) ? list : [])
    } catch (err) {
      console.error('❌ Error cerrando sesión:', err)
      window.alert('No se pudo cerrar la sesión: ' + err.message)
    } finally {
      setClosing(null)
    }
  }

  const handleRefresh = async () => {
    if (!userId) return
    setLoading(true)
    try {
      const list = await getUserSessions(userId)
      setSessions(Array.isArray(list) ? list : [])
    } catch (err) {
      console.error('❌ Error recargando sesiones:', err)
    } finally {
      setLoading(false)
    }
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

  const activeCount = sessions.filter((s) => !s.endedAt).length

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

      <header className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-brand-black dark:text-dark-text tracking-tight">
            Sesiones de {user.fullName}
          </h1>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-1">
            Historial de accesos al sistema (entradas y salidas).
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="
            inline-flex items-center gap-1.5 h-9 px-3 rounded-lg
            text-xs font-semibold
            bg-white dark:bg-dark-card
            border border-gray-200 dark:border-dark-border
            text-gray-600 dark:text-dark-muted
            hover:bg-gray-50 dark:hover:bg-dark-surface
            disabled:opacity-50
            transition-colors
          "
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </header>

      {/* Stats rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <StatBox label="Total sesiones" value={sessions.length} loading={loading} />
        <StatBox label="Activas ahora" value={activeCount} loading={loading} highlight={activeCount > 0} />
        <StatBox
          label="Última actividad"
          value={
            sessions[0]?.startedAt
              ? new Date(sessions[0].startedAt).toLocaleString('es-MX', {
                  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                })
              : '—'
          }
          loading={loading}
        />
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden">
        {loading ? (
          <div className="text-center py-16">
            <Loader2 size={24} className="animate-spin text-brand-blue mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-dark-muted">
              Cargando sesiones…
            </p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-gray-500 dark:text-dark-muted">
              Sin sesiones registradas todavía.
            </p>
            <p className="text-xs text-gray-400 dark:text-dark-muted mt-1">
              Las sesiones se registran a partir del próximo inicio de sesión.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-dark-border">
            {sessions.map((s) => {
              const device = detectDevice(s.device || s.userAgent)
              const isActive = !s.endedAt
              const DeviceIcon = device.type === 'mobile' ? Smartphone : Monitor
              const closingThis = closing === s.id

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
                    {s.endedAt ? (
                      <p className="text-xs text-gray-500 dark:text-dark-muted">
                        Fin: {new Date(s.endedAt).toLocaleString('es-MX')}
                        {s.endReason && ` · ${s.endReason}`}
                      </p>
                    ) : (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        Duración: {fmtDuration(s.startedAt)}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {isActive ? (
                      <>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Activa
                        </span>
                        <button
                          onClick={() => handleCloseRemote(s)}
                          disabled={closingThis}
                          className="
                            inline-flex items-center gap-1.5 h-8 px-3 rounded-lg
                            text-xs font-medium
                            border border-gray-200 dark:border-dark-border
                            text-brand-red
                            hover:bg-red-50 dark:hover:bg-red-950/30
                            disabled:opacity-50
                            transition-colors
                          "
                        >
                          {closingThis ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <LogOut size={12} />
                          )}
                          {closingThis ? 'Cerrando…' : 'Cerrar'}
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

function StatBox({ label, value, loading, highlight = false }) {
  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-4">
      <p className="text-xs text-gray-500 dark:text-dark-muted">{label}</p>
      {loading ? (
        <div className="h-7 w-16 bg-gray-100 dark:bg-dark-card rounded animate-pulse mt-1" />
      ) : (
        <p className={`text-lg font-bold mt-1 ${
          highlight ? 'text-emerald-600 dark:text-emerald-400' : 'text-brand-black dark:text-dark-text'
        }`}>
          {value}
        </p>
      )}
    </div>
  )
}