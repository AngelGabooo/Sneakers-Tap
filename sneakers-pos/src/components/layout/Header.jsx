// src/components/layout/Header.jsx
import { useEffect, useRef, useState } from 'react'
import {
  Search, Bell, Menu, User, Settings, LogOut, ChevronDown,
  ShieldCheck, X, ShoppingCart, Wallet, RotateCcw, AlertTriangle,
  BellRing, BellOff, Check, CheckCheck, Inbox, Loader2,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useView } from '../../context/ViewContext'
import { useNotifications } from '../../context/NotificationsContext'
import Toast from '../common/Toast'
import ConfirmModal from '../common/ConfirmModal'
import SyncIndicator from './SyncIndicator'
import {
  subscribeToPush,
  getPushStatus,
  isPushSupported,
} from '../../utils/webPush'

/* ---------------------------------------------------------------- */
/* Icono según tipo de notificación                                  */
/* ---------------------------------------------------------------- */
function NotifIcon({ type }) {
  const map = {
    sale:       { icon: ShoppingCart,  bg: 'bg-blue-100 dark:bg-blue-900/40',       fg: 'text-blue-600 dark:text-blue-300' },
    cash_open:  { icon: Wallet,        bg: 'bg-emerald-100 dark:bg-emerald-900/40', fg: 'text-emerald-600 dark:text-emerald-300' },
    cash_close: { icon: Wallet,        bg: 'bg-amber-100 dark:bg-amber-900/40',     fg: 'text-amber-600 dark:text-amber-300' },
    return:     { icon: RotateCcw,     bg: 'bg-purple-100 dark:bg-purple-900/40',   fg: 'text-purple-600 dark:text-purple-300' },
    cancel:     { icon: AlertTriangle, bg: 'bg-red-100 dark:bg-red-900/40',         fg: 'text-brand-red' },
  }
  const meta = map[type] || map.sale
  const Icon = meta.icon
  return (
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.bg} ${meta.fg}`}>
      <Icon size={16} strokeWidth={2} />
    </div>
  )
}

function relativeTime(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return 'Ahora'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min} min`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} h`
  const days = Math.floor(hr / 24)
  return `${days} d`
}

export default function Header({ onOpenMobile, user: userProp, period, onPeriodChange }) {
  const { user: authUser, logout } = useAuth()
  const { setActiveView } = useView()
  const {
    notifications, unreadCount,
    markAsRead, markAllAsRead, clearAll,
  } = useNotifications()

  const user = userProp || authUser

  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const menuRef = useRef(null)
  const notifRef = useRef(null)

  // 👇 Web Push
  const [pushStatus, setPushStatus] = useState('unknown')
  const [pushLoading, setPushLoading] = useState(false)

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    if (!menuOpen && !notifOpen) return
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [menuOpen, notifOpen])

  // Cerrar con Escape
  useEffect(() => {
    if (!menuOpen && !notifOpen) return
    const handler = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        setNotifOpen(false)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [menuOpen, notifOpen])

  // Consultar estado del push al montar y al abrir el panel
  useEffect(() => {
    if (!user?.id) return
    let alive = true
    async function check() {
      const status = await getPushStatus()
      if (alive) setPushStatus(status)
    }
    check()
    return () => { alive = false }
  }, [user?.id, notifOpen])

  const handleLogout = () => {
    setMenuOpen(false)
    setLogoutConfirmOpen(true)
  }

  const handleConfirmLogout = () => {
    setLogoutConfirmOpen(false)
    logout()
  }

  const handleGoToProfile = () => {
    setMenuOpen(false)
    setActiveView('profile')
  }

  const handleGoToSettings = () => {
    setMenuOpen(false)
    setActiveView('settings')
  }

  const handleNotifClick = (notif) => {
    markAsRead(notif.id)
    const routes = {
      sale:       'sales-history',
      cash_open:  'cash-current',
      cash_close: 'cash-history',
      return:     'sales-history',
      cancel:     'sales-history',
    }
    const target = routes[notif.type]
    if (target) {
      setNotifOpen(false)
      setActiveView(target)
    }
  }

  /**
   * ⭐ Activar Web Push real (funciona con navegador cerrado)
   */
  const handleEnablePush = async () => {
    if (!user?.id) return

    setPushLoading(true)
    try {
      const result = await subscribeToPush(user.id)

      if (result.ok) {
        setPushStatus('subscribed')
        setToast({
          title: '🔔 Notificaciones push activadas',
          description: 'Recibirás alertas incluso con el navegador cerrado.',
        })
      } else if (result.reason === 'ios-needs-install') {
        setToast({
          title: '📱 Instala la app en tu iPhone',
          description:
            'Para recibir notificaciones en iPhone, toca el botón Compartir en Safari → "Añadir a pantalla de inicio". Luego abre la app desde el ícono.',
        })
      } else if (result.reason === 'denied') {
        setToast({
          title: 'Permiso denegado',
          description: 'Habilítalo manualmente desde la configuración del navegador.',
        })
      } else if (result.reason === 'unsupported') {
        setToast({
          title: 'No soportado',
          description: 'Tu navegador no permite notificaciones push.',
        })
      } else if (result.reason === 'no-vapid') {
        setToast({
          title: 'Configuración incompleta',
          description: 'Falta la VAPID key en el entorno.',
        })
      } else {
        setToast({
          title: 'Error al activar',
          description: result.reason || 'Intenta de nuevo.',
        })
      }
    } catch (err) {
      setToast({
        title: 'Error',
        description: err.message || 'Intenta de nuevo.',
      })
    } finally {
      setPushLoading(false)
    }
  }

  const initials = (user?.name || 'H')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const pushSupported = isPushSupported()

  return (
    // ⭐ Añadido: safe-header  (respeta el notch del iPhone)
    //    Se eliminó 'h-16' porque .safe-header ya define la altura correcta.
    <header className="safe-header bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border pl-4 lg:pl-6 pr-3 lg:pr-5 flex items-center gap-3">
      {/* Botón menú (móvil) */}
      <button
        onClick={onOpenMobile}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-card text-gray-600 dark:text-dark-muted"
        aria-label="Abrir menú"
      >
        <Menu size={20} />
      </button>

      {/* Búsqueda */}
      <div className="relative flex-1 max-w-md">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
          <Search size={17} strokeWidth={1.8} />
        </span>
        <input
          type="text"
          placeholder="Buscar productos, ventas, clientes..."
          className="
            w-full h-10 pl-9 pr-3 rounded-lg text-sm
            bg-gray-50 dark:bg-dark-card text-brand-black dark:text-dark-text
            border border-transparent
            focus:border-brand-blue focus:bg-white dark:focus:bg-dark-surface
            focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40
            outline-none placeholder:text-gray-400 dark:placeholder:text-dark-muted
            transition-all duration-150
          "
        />
      </div>

      {/* Selector de período */}
      {onPeriodChange && (
        <div className="hidden md:block">
          <select
            value={period}
            onChange={(e) => onPeriodChange?.(e.target.value)}
            className="
              h-10 px-3 rounded-lg text-sm font-medium
              bg-white dark:bg-dark-card
              border border-gray-200 dark:border-dark-border
              text-brand-black dark:text-dark-text
              hover:border-brand-blue focus:border-brand-blue
              outline-none cursor-pointer transition-colors
            "
          >
            <option value="today">Hoy</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
            <option value="year">Este año</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Indicador de sincronización */}
      <SyncIndicator />

      {/* Notificaciones */}
      <div className="relative" ref={notifRef}>
        <button
          type="button"
          onClick={() => setNotifOpen((v) => !v)}
          className={`
            relative p-2 rounded-lg transition-colors
            ${notifOpen
              ? 'bg-blue-50 dark:bg-blue-950/40 text-brand-blue'
              : 'hover:bg-gray-100 dark:hover:bg-dark-card text-gray-600 dark:text-dark-muted'}
          `}
          aria-label="Notificaciones"
          aria-haspopup="menu"
          aria-expanded={notifOpen}
        >
          <Bell size={19} strokeWidth={1.9} />
          {unreadCount > 0 && (
            <span className="
              absolute top-1 right-1 min-w-[16px] h-[16px] px-1
              rounded-full bg-brand-red text-white text-[10px] font-bold
              flex items-center justify-center
              ring-2 ring-white dark:ring-dark-surface
            ">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {notifOpen && (
  <div
    role="menu"
    className="
      /* ---------- MÓVIL: panel anclado a la pantalla ---------- */
      fixed inset-x-2 top-[calc(env(safe-area-inset-top,0px)+4.5rem)] bottom-4 z-50
      flex flex-col
      bg-white dark:bg-dark-card
      border border-gray-200 dark:border-dark-border
      rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40
      overflow-hidden
      /* ---------- DESKTOP: dropdown clásico ---------- */
      lg:absolute lg:inset-x-auto lg:right-0 lg:top-full lg:bottom-auto lg:mt-3
      lg:w-[400px] lg:max-h-[80vh]
    "
  >
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 dark:border-dark-border bg-gradient-to-r from-blue-50/60 to-transparent dark:from-blue-950/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center">
                    <Inbox size={16} className="text-white" strokeWidth={2.2} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-brand-black dark:text-dark-text">
                      Notificaciones
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-dark-muted">
                      {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="
                        inline-flex items-center gap-1 h-7 px-2.5 rounded-md
                        text-[11px] font-semibold
                        text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-950/40
                        transition-colors
                      "
                    >
                      <CheckCheck size={12} strokeWidth={2.4} />
                      Marcar todas
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={clearAll}
                      className="
                        w-7 h-7 rounded-md flex items-center justify-center
                        text-gray-400 hover:text-brand-red
                        hover:bg-red-50 dark:hover:bg-red-950/30
                        transition-colors
                      "
                      title="Limpiar todas"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Banner de push NO activado */}
            {pushSupported && pushStatus !== 'subscribed' && pushStatus !== 'denied' && (
              <div className="px-5 py-3.5 bg-blue-50/80 dark:bg-blue-950/30 border-b border-blue-100 dark:border-blue-900/50">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-dark-card flex items-center justify-center shrink-0 shadow-sm">
                    <BellRing size={15} className="text-brand-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-brand-blue dark:text-blue-300">
                      Activa las notificaciones push
                    </p>
                    <p className="text-[11px] text-gray-600 dark:text-dark-muted mt-0.5">
                      Recibe alertas incluso con el navegador cerrado.
                    </p>
                    <button
                      type="button"
                      onClick={handleEnablePush}
                      disabled={pushLoading}
                      className="
                        mt-2 inline-flex items-center gap-1.5 h-7 px-3 rounded-md
                        text-[11px] font-bold bg-brand-blue text-white
                        hover:bg-blue-700 transition-colors shadow-sm
                        disabled:opacity-60 disabled:cursor-not-allowed
                      "
                    >
                      {pushLoading ? (
                        <Loader2 size={11} className="animate-spin" />
                      ) : (
                        <BellRing size={11} strokeWidth={2.4} />
                      )}
                      {pushLoading ? 'Activando…' : 'Activar push'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ⭐ NUEVO: Aviso especial iOS (necesita instalar PWA) */}
            {pushStatus === 'ios-needs-install' && (
              <div className="px-5 py-3.5 bg-amber-50/80 dark:bg-amber-950/30 border-b border-amber-100 dark:border-amber-900/50">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-dark-card flex items-center justify-center shrink-0 shadow-sm text-base">
                    📱
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                      Instala la app en tu iPhone
                    </p>
                    <p className="text-[11px] text-gray-700 dark:text-dark-muted mt-1 leading-relaxed">
                      Apple requiere que instales la app primero. Pasos:
                    </p>
                    <ol className="text-[11px] text-gray-700 dark:text-dark-muted mt-1.5 space-y-0.5 list-decimal list-inside">
                      <li>Toca el botón <strong>Compartir</strong> (⬆️)</li>
                      <li>Elige <strong>"Añadir a pantalla de inicio"</strong></li>
                      <li>Abre la app desde el ícono</li>
                      <li>Vuelve aquí y activa las notificaciones</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {/* Permiso denegado */}
            {pushSupported && pushStatus === 'denied' && (
              <div className="px-5 py-3 bg-red-50/80 dark:bg-red-950/30 border-b border-red-100 dark:border-red-900/50">
                <p className="text-[11px] text-brand-red">
                  🔕 Permiso denegado. Habilítalo desde la configuración del sistema.
                </p>
              </div>
            )}

            {/* Badge push activo */}
            {pushStatus === 'subscribed' && (
              <div className="px-5 py-2 bg-emerald-50/60 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900/40 flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Check size={11} className="text-white" strokeWidth={3} />
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  Push activado · Recibirás alertas en este dispositivo
                </span>
              </div>
            )}

            {/* No soportado */}
            {!pushSupported && pushStatus !== 'ios-needs-install' && (
              <div className="px-5 py-3 bg-amber-50/80 dark:bg-amber-950/30 border-b border-amber-100 dark:border-amber-900/50">
                <p className="text-[11px] text-amber-800 dark:text-amber-300">
                  ⚠️ Tu navegador no soporta notificaciones push. Prueba Chrome o Firefox.
                </p>
              </div>
            )}

            {/* Lista */}
<div className="flex-1 min-h-0 overflow-y-auto lg:max-h-[420px] lg:flex-none">
              {notifications.length === 0 ? (
                <div className="text-center py-14 px-4">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-dark-card mx-auto mb-3 flex items-center justify-center">
                    <BellOff size={26} className="text-gray-300 dark:text-dark-border" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm font-semibold text-brand-black dark:text-dark-text">
                    Sin notificaciones
                  </p>
                  <p className="text-xs text-gray-500 dark:text-dark-muted mt-1">
                    Aquí verás las novedades importantes.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-dark-border">
                  {notifications.map((n) => (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => handleNotifClick(n)}
                        className={`
                          w-full text-left flex items-start gap-3 px-5 py-3.5
                          transition-colors relative
                          ${!n.read
                            ? 'bg-blue-50/30 dark:bg-blue-950/10 hover:bg-blue-50/60 dark:hover:bg-blue-950/20'
                            : 'hover:bg-gray-50 dark:hover:bg-dark-surface'}
                        `}
                      >
                        {!n.read && (
                          <span className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full bg-brand-blue" />
                        )}

                        <NotifIcon type={n.type} />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm leading-tight ${!n.read ? 'font-bold' : 'font-medium'} text-brand-black dark:text-dark-text`}>
                              {n.title}
                            </p>
                            <span className="text-[10px] font-semibold text-gray-400 dark:text-dark-muted whitespace-nowrap mt-0.5">
                              {relativeTime(n.createdAt)}
                            </span>
                          </div>

                          {n.description && (
                            <p className="text-xs text-gray-500 dark:text-dark-muted mt-1 line-clamp-2">
                              {n.description}
                            </p>
                          )}

                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            {n.actorName && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-500 dark:text-dark-muted bg-gray-100 dark:bg-dark-card px-1.5 py-0.5 rounded">
                                <User size={9} strokeWidth={2.5} />
                                {n.actorName}
                              </span>
                            )}
                            {n.priority === 'critical' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-brand-red bg-red-50 dark:bg-red-950/40 px-1.5 py-0.5 rounded">
                                <AlertTriangle size={9} strokeWidth={2.5} />
                                Crítico
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="px-5 py-2.5 border-t border-gray-100 dark:border-dark-border bg-gray-50/60 dark:bg-dark-surface/40">
                <p className="text-[11px] text-center text-gray-500 dark:text-dark-muted">
                  Mostrando las últimas {notifications.length} notificaciones
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Separador */}
      <div className="h-8 w-px bg-gray-200 dark:bg-dark-border mx-1" />

      {/* Menú de cuenta */}
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className={`
            flex items-center gap-2.5 pl-1 pr-2 h-11 rounded-lg
            transition-colors
            ${menuOpen
              ? 'bg-blue-50 dark:bg-blue-950/40'
              : 'hover:bg-gray-100 dark:hover:bg-dark-card'}
          `}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-blue to-blue-700 text-white flex items-center justify-center font-semibold text-sm shrink-0 shadow-sm">
            {initials}
          </div>
          <div className="hidden lg:block leading-tight text-left">
            <p className="text-sm font-semibold text-brand-black dark:text-dark-text truncate max-w-[140px]">
              {user?.name || 'Usuario'}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-dark-muted truncate max-w-[140px]">
              {user?.role || 'Administrador'}
            </p>
          </div>
          <ChevronDown
            size={14}
            className={`hidden sm:block text-gray-400 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="
              absolute right-0 top-full mt-3 w-72 z-50
              bg-white dark:bg-dark-card
              border border-gray-200 dark:border-dark-border
              rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40
              overflow-hidden
            "
          >
            <div className="px-5 py-4 bg-gradient-to-br from-blue-50/80 to-transparent dark:from-blue-950/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-blue to-blue-700 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-md">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-brand-black dark:text-dark-text truncate">
                    {user?.name || 'Usuario'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-dark-muted truncate">
                    {user?.email || 'usuario@sneakers.com'}
                  </p>
                </div>
              </div>
              <span className="
                inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-lg
                text-[11px] font-bold
                bg-blue-100 text-brand-blue
                dark:bg-blue-950/60 dark:text-blue-300
              ">
                <ShieldCheck size={11} strokeWidth={2.4} />
                {user?.role || 'Administrador'}
              </span>
            </div>

            <div className="py-1.5">
              <button
                type="button"
                role="menuitem"
                onClick={handleGoToProfile}
                className="
                  w-full flex items-center gap-3 px-5 py-2.5 text-sm
                  text-brand-black dark:text-dark-text
                  hover:bg-gray-50 dark:hover:bg-dark-surface transition-colors
                "
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-dark-card flex items-center justify-center">
                  <User size={15} className="text-gray-500 dark:text-dark-muted" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Mi perfil</p>
                  <p className="text-[11px] text-gray-500 dark:text-dark-muted">
                    Edita tus datos personales
                  </p>
                </div>
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={handleGoToSettings}
                className="
                  w-full flex items-center gap-3 px-5 py-2.5 text-sm
                  text-brand-black dark:text-dark-text
                  hover:bg-gray-50 dark:hover:bg-dark-surface transition-colors
                "
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-dark-card flex items-center justify-center">
                  <Settings size={15} className="text-gray-500 dark:text-dark-muted" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Configuración</p>
                  <p className="text-[11px] text-gray-500 dark:text-dark-muted">
                    Ajustes de la tienda
                  </p>
                </div>
              </button>
            </div>

            <div className="border-t border-gray-100 dark:border-dark-border py-1.5">
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="
                  w-full flex items-center gap-3 px-5 py-2.5 text-sm font-medium
                  text-brand-red
                  hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors
                "
              >
                <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/40 flex items-center justify-center">
                  <LogOut size={15} className="text-brand-red" />
                </div>
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        open={logoutConfirmOpen}
        title="¿Cerrar sesión?"
        description="Tendrás que volver a iniciar sesión para continuar usando Sneakers."
        confirmText="Cerrar sesión"
        cancelText="Cancelar"
        tone="logout"
        onConfirm={handleConfirmLogout}
        onCancel={() => setLogoutConfirmOpen(false)}
      />

      <Toast
        open={!!toast}
        variant="success"
        title={toast?.title}
        description={toast?.description}
        onClose={() => setToast(null)}
      />
    </header>
  )
}