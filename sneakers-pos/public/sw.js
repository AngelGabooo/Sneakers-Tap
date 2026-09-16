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
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options),
  )
})

// ⭐ Al hacer clic en la notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Si ya hay una ventana abierta, enfocarla
      for (const client of clients) {
        if (client.url.includes(self.location.origin)) {
          client.focus()
          client.navigate(url)
          return
        }
      }
      // Si no, abrir una nueva
      return self.clients.openWindow(url)
    }),
  )
})