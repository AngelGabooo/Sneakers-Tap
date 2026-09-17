// public/sw.js
// Service Worker para manejar Web Push

const SW_VERSION = 'v3'
console.log(`🔧 SW ${SW_VERSION} cargando…`)

const APP_ORIGIN = 'https://sneakers-tap.vercel.app'

self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker instalado')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activado')
  event.waitUntil(self.clients.claim())
})

// ⭐ Push recibido
self.addEventListener('push', (event) => {
  console.log('📬 Push recibido:', event)

  let data = {
    title: 'SNEAKERS',
    body: 'Nueva notificación',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    url: APP_ORIGIN + '/',
    view: null,
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
    data: {
      url: APP_ORIGIN + '/',
      view: data.view || null,
    },
    requireInteraction: data.priority === 'critical',
    vibrate: data.priority === 'critical' ? [200, 100, 200] : [100],
    silent: false,
    actions: [
      { action: 'open', title: 'Ver' },
      { action: 'close', title: 'Cerrar' },
    ],
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options),
  )
})

// ⭐ Click en notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'close') return

  const url = APP_ORIGIN + '/'
  const view = event.notification.data?.view || null

  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      })

      // Si ya hay una ventana abierta, enfocarla y avisar
      for (const client of clients) {
        if (client.url.startsWith(APP_ORIGIN)) {
          await client.focus()
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            view,
          })
          return
        }
      }

      // Si no hay ventana, abrir nueva con la vista en query
      const targetUrl = view ? `${url}?view=${view}` : url
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }
    })(),
  )
})

// ⭐ Suscripción renovada
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('🔄 Push subscription cambió, renovando…')

  event.waitUntil(
    (async () => {
      try {
        const newSub = await self.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: event.oldSubscription?.options?.applicationServerKey,
        })

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