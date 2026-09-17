// public/sw.js
// Service Worker Web Push — Android + iOS 16.4+ (PWA)
// v5: sonido custom (Android), deep links a ventas, mejor manejo de datos

const SW_VERSION = 'v5'
console.log(`🔧 SW ${SW_VERSION} cargando…`)

const APP_ORIGIN = 'https://sneakers-tap.vercel.app'

const ICON = '/icon-192.png'
const BADGE = '/icon-192.png'

// -------------------- Install / Activate --------------------

self.addEventListener('install', () => {
  console.log('🔧 Service Worker instalado')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activado')
  event.waitUntil(self.clients.claim())
})

// -------------------- Push recibido --------------------

self.addEventListener('push', (event) => {
  console.log('📬 Push recibido')

  let data = {
    title: 'SNEAKERS',
    body: 'Nueva notificación',
    icon: ICON,
    badge: BADGE,
    tag: 'sneakers-notif',
    url: APP_ORIGIN + '/',
    view: null,
    notifId: null,
    saleId: null,
    sessionId: null,
    productId: null,
    priority: 'normal',
    sound: null,
  }

  try {
    if (event.data) {
      const parsed = event.data.json()
      data = { ...data, ...parsed }
    }
  } catch (err) {
    console.warn('⚠️ Error parsing push data:', err)
    if (event.data) data.body = event.data.text()
  }

  const options = {
    body: data.body || ' ',
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    data: {
      url: data.url || (APP_ORIGIN + '/'),
      view: data.view || null,
      notifId: data.notifId || null,
      saleId: data.saleId || null,
      sessionId: data.sessionId || null,
      productId: data.productId || null,
      priority: data.priority || 'normal',
    },
    // ⭐ Sonido custom — Android lo respeta, iOS lo ignora.
    //    Guard: solo añadimos si no es null para no romper iOS.
    ...(data.sound ? { sound: data.sound } : {}),
    // ⭐ requireInteraction solo si es crítico (Android). iOS lo ignora.
    ...(data.priority === 'critical' ? { requireInteraction: true } : {}),
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

// -------------------- Click en notificación --------------------

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'close') return

  const url = event.notification.data?.url || (APP_ORIGIN + '/')
  const view = event.notification.data?.view || null
  const notifId = event.notification.data?.notifId || null
  // ⭐ Deep link IDs
  const saleId = event.notification.data?.saleId || null
  const sessionId = event.notification.data?.sessionId || null
  const productId = event.notification.data?.productId || null

  event.waitUntil(
    (async () => {
      const clientsList = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      })

      // Si ya hay ventana abierta, enfocarla y avisar
      for (const client of clientsList) {
        if (client.url.startsWith(APP_ORIGIN)) {
          await client.focus()
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            view,
            notifId,
            saleId,
            sessionId,
            productId,
          })
          return
        }
      }

      // Si no, abrir nueva. Los deep links van en query params
      // para que la app los lea al arrancar.
      const params = new URLSearchParams()
      if (view) params.set('view', view)
      if (saleId) params.set('saleId', saleId)
      if (sessionId) params.set('sessionId', sessionId)
      if (productId) params.set('productId', productId)

      const qs = params.toString()
      const targetUrl = qs ? `${url}?${qs}` : url

      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }
    })(),
  )
})

// -------------------- Suscripción renovada --------------------

self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('🔄 Push subscription cambió, renovando…')

  event.waitUntil(
    (async () => {
      try {
        const vapidKey = await getVapidKeyFromIDB()

        if (!vapidKey) {
          console.warn('⚠️ No hay VAPID key cacheada, no se puede re-suscribir')
          return
        }

        const newSub = await self.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        })

        const clientsList = await self.clients.matchAll({
          type: 'window',
          includeUncontrolled: true,
        })

        for (const client of clientsList) {
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

// -------------------- Helpers --------------------

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

async function getVapidKeyFromIDB() {
  return new Promise((resolve) => {
    const req = indexedDB.open('sneakers-push', 1)
    req.onerror = () => resolve(null)
    req.onsuccess = () => {
      const db = req.result
      if (!db.objectStoreNames.contains('keys')) return resolve(null)
      const tx = db.transaction('keys', 'readonly')
      const getReq = tx.objectStore('keys').get('vapidPublic')
      getReq.onsuccess = () => resolve(getReq.result?.value || null)
      getReq.onerror = () => resolve(null)
    }
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains('keys')) {
        db.createObjectStore('keys', { keyPath: 'key' })
      }
    }
  })
}