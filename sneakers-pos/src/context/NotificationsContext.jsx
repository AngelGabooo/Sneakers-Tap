// src/context/NotificationsContext.jsx
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useAuth } from './AuthContext'
import { useNetwork } from './NetworkContext'
import { notificationsRepo } from '../repositories/notificationsRepo'
import {
  isSupported as browserSupported,
  getPermission as getBrowserPermission,
  requestPermission as requestBrowserPermission,
  showBrowserNotification,
} from '../utils/browserNotifications'

const NotificationsContext = createContext(null)

// ⭐ Sonido crítico (mismo helper que en main.jsx)
function playCriticalSound() {
  try {
    const audio = new Audio('/sounds/critical.wav')
    audio.volume = 0.7
    audio.play().catch(() => {})
  } catch {}
}

export function NotificationsProvider({ children }) {
  const { user } = useAuth()
  const { isOnline } = useNetwork()
  const [notifications, setNotifications] = useState([])
  const [browserPermission, setBrowserPermission] = useState(() => getBrowserPermission())
  const notifiedIdsRef = useRef(new Set())
  const mountedRef = useRef(true)

  // Cargar al montar
  useEffect(() => {
    mountedRef.current = true
    const cache = notificationsRepo.getLocal()
    setNotifications(cache)
    cache.forEach((n) => notifiedIdsRef.current.add(n.id))

    return () => { mountedRef.current = false }
  }, [])

  // Sync remoto al montar/reconectar
  useEffect(() => {
    if (!isOnline) return
    let alive = true
    async function sync() {
      try {
        const remote = await notificationsRepo.syncFromSupabase()
        if (alive && mountedRef.current) {
          setNotifications(remote)
          remote.forEach((n) => notifiedIdsRef.current.add(n.id))
        }
      } catch (err) {
        console.warn('⚠️ Sync notif falló:', err.message)
      }
    }
    const t = setTimeout(sync, 1500)
    return () => { alive = false; clearTimeout(t) }
  }, [isOnline])

  // ⭐ Web Push + sonido crítico (app en foreground)
  useEffect(() => {
    if (!user) return
    if (browserPermission !== 'granted') return
    if (user.role !== 'Administrador' && user.role !== 'Gerente') return

    notifications.forEach((n) => {
      if (notifiedIdsRef.current.has(n.id)) return
      notifiedIdsRef.current.add(n.id)
      if (n.actorName === user.name) return

      // ⭐ Sonido crítico (solo si la app está abierta)
      if (n.priority === 'critical') {
        playCriticalSound()
      }

      showBrowserNotification({
        title: n.title || 'SNEAKERS',
        body: n.description || '',
        icon: '/icon-192.png',
        tag: n.id,
        priority: n.priority === 'critical' ? 'critical' : 'default',
        onClick: () => {
          try { window.focus() } catch {}
          // ⭐ Deep link al hacer click
          const meta = n.meta || {}
          if (meta.saleId) sessionStorage.setItem('pendingSaleId', meta.saleId)
        },
      })
    })
  }, [notifications, user, browserPermission])

  const push = useCallback(async (notif) => {
    const entry = await notificationsRepo.create(notif)
    setNotifications((list) => [entry, ...list].slice(0, 100))
    notifiedIdsRef.current.add(entry.id)
    return entry
  }, [])

  const markAsRead = useCallback(async (id) => {
    await notificationsRepo.markAsRead(id)
    setNotifications((list) =>
      list.map((n) => (n.id === id ? { ...n, read: true } : n)),
    )
  }, [])

  const markAllAsRead = useCallback(async () => {
    await notificationsRepo.markAllAsRead()
    setNotifications((list) => list.map((n) => ({ ...n, read: true })))
  }, [])

  const clearAll = useCallback(async () => {
    await notificationsRepo.clearAll()
    setNotifications([])
  }, [])

  const enableBrowserNotifications = useCallback(async () => {
    if (!browserSupported()) return { ok: false, reason: 'unsupported' }
    if (browserPermission === 'granted') return { ok: true, permission: 'granted' }
    const result = await requestBrowserPermission()
    setBrowserPermission(result)
    return { ok: result === 'granted', permission: result }
  }, [browserPermission])

  const visible = user?.role === 'Administrador' || user?.role === 'Gerente'
    ? notifications
    : notifications.filter((n) => n.targetUserId === user?.id)

  const unreadCount = visible.filter((n) => !n.read).length

  const value = {
    notifications: visible,
    unreadCount,
    push,
    markAsRead,
    markAllAsRead,
    clearAll,
    browserNotificationsSupported: browserSupported(),
    browserPermission,
    enableBrowserNotifications,
  }

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications debe usarse dentro de <NotificationsProvider>')
  return ctx
}