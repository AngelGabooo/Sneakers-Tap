// public/sw.js
// Service Worker para manejar Web Push

self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker instalado')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activado')
  event.waitUntil(self.clients.claim())
})

// ⭐ Aquí llega la notificación push
self.addEventListener('push', (event) => {
  console.log('📬 Push recibido:', event)

  let data = {
    title: 'SNEAKERS',
    body: 'Nueva notificación',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    url: '/',
    tag: null,
    priority: 'normal',
  }

  try {
    if (event.data) {
      const parsed = event.data.json()
      data = { ...data, ...parsed }
    }
  } catch (err) {
    console.warn('Error parsing push data:', err)
    if (event.data) data.body = event.data.text()
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag || undefined,
    data: { url: data.url || '/' },
    requireInteraction: data.priority === 'critical',
    vibrate: data.priority === 'critical' ? [200, 100, 200] : [100],
    silent: false,
    // ⭐ Acciones rápidas (soportadas en Android/Desktop; iOS las ignora)
    actions: [
      { action: 'open', title: 'Ver' },
      { action: 'close', title: 'Cerrar' },
    ],
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options),
  )
})

// ⭐ Al hacer clic en la notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'close') return

  const url = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin)) {
          client.focus()
          client.navigate(url)
          return
        }
      }
      return self.clients.openWindow(url)
    }),
  )
})

// ⭐ NUEVO: cuando el navegador invalida la suscripción
//    (pasa en Chrome/Android periódicamente y en iOS al reinstalar la PWA)
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('🔄 Push subscription cambió, renovando…')

  event.waitUntil(
    (async () => {
      try {
        // Re-suscribirse con la misma VAPID key que tenía antes
        const newSub = await self.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: event.oldSubscription?.options?.applicationServerKey,
        })

        // Avisar a todas las pestañas abiertas para que actualicen Supabase
        const clients = await self.clients.matchAll({
          type: 'window',
          includeUncontrolled: true,
        })

        for (const client of clients) {
          client.postMessage({
            type: 'PUSH_SUBSCRIPTION_CHANGED',
            subscription: newSub.toJSON(),
          })
        }

        console.log('✅ Suscripción renovada y clientes notificados')
      } catch (err) {
        console.error('❌ Error renovando suscripción:', err)
      }
    })(),
  )
})