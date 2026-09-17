// public/service-worker.js

const CACHE_NAME = 'sneakers-v1'

// ---------------------------------------------------------
// Install / Activate
// ---------------------------------------------------------
self.addEventListener('install', (event) => {
  console.log('🔧 SW installing…')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('✅ SW activated')
  event.waitUntil(self.clients.claim())
})

// ---------------------------------------------------------
// PUSH — recibe notificación desde el servidor
// ---------------------------------------------------------
self.addEventListener('push', (event) => {
  console.log('📩 Push recibido')

  let data = {
    title: 'SNEAKERS',
    body: 'Nueva notificación',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'sneakers-notif',
    priority: 'default',
    data: { url: '/' },
  }

  try {
    if (event.data) {
      const parsed = event.data.json()
      data = { ...data, ...parsed }
    }
  } catch (err) {
    console.warn('⚠️ Error parseando push:', err)
    if (event.data) data.body = event.data.text()
  }

  const options = {
    body: data.body,
    icon: data.icon || '/favicon.ico',
    badge: data.badge || '/favicon.ico',
    tag: data.tag || 'sneakers-notif',
    data: data.data || { url: '/' },
    requireInteraction: data.priority === 'critical',
    vibrate: data.priority === 'critical' ? [200, 100, 200, 100, 200] : [100],
    actions: [
      { action: 'open', title: 'Ver' },
      { action: 'close', title: 'Cerrar' },
    ],
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

// ---------------------------------------------------------
// Click en la notificación → abrir app
// ---------------------------------------------------------
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'close') return

  const targetUrl = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        // Si ya hay una ventana abierta, enfocarla
        for (const client of clients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus()
            return client.navigate(targetUrl)
          }
        }
        // Si no, abrir una nueva
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl)
        }
      }),
  )
})

// ---------------------------------------------------------
// SUSCRIPCIÓN CAMBIÓ — re-suscribir automáticamente
// ---------------------------------------------------------
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('🔄 Push subscription cambió, renovando…')

  event.waitUntil(
    (async () => {
      try {
        // Necesitamos la VAPID public key — la inyectamos al build
        // O la pedimos al servidor. Aquí la tomamos de una variable.
        const res = await fetch('/api/push/vapid-key') // opcional
        const { publicKey } = await res.json()

        const subscription = await self.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        })

        // Enviar la nueva suscripción al servidor
        await fetch('/api/push/resubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription),
        })
      } catch (err) {
        console.error('❌ Error renovando suscripción:', err)
      }
    })(),
  )
})

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}