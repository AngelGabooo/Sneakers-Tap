// public/sw.js
// Service Worker Web Push — compatible Android + iOS 16.4+ (PWA)
// v4: soporte iOS (Safari + PWA instalada)

const SW_VERSION = 'v4'
console.log(`🔧 SW ${SW_VERSION} cargando…`)

const APP_ORIGIN = 'https://sneakers-tap.vercel.app'

// ⭐ Iconos PWA (los crearemos en el paso 3)
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
    priority: 'normal',
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

  // ⚠️ iOS IGNORA: actions, vibrate, requireInteraction, silent.
  //    Los omitimos para que Safari no tire warnings.
  //    En Android no cambia nada — siguen funcionando sin ellos.
  const options = {
    body: data.body || ' ',
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    data: {
      url: data.url || (APP_ORIGIN + '/'),
      view: data.view || null,
      notifId: data.notifId || null,
    },
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

// -------------------- Click en notificación --------------------

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  // En iOS no hay actions, así que event.action siempre es ''
  if (event.action === 'close') return

  const url = event.notification.data?.url || (APP_ORIGIN + '/')
  const view = event.notification.data?.view || null
  const notifId = event.notification.data?.notifId || null

  event.waitUntil(
    (async () => {
      const clientsList = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      })

      // Si ya hay una ventana abierta, enfocarla y avisar
      for (const client of clientsList) {
        if (client.url.startsWith(APP_ORIGIN)) {
          await client.focus()
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            view,
            notifId,
          })
          return
        }
      }

      // Si no, abrir nueva con la vista en query
      const targetUrl = view ? `${url}?view=${view}` : url
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }
    })(),
  )
})

// -------------------- Suscripción renovada (iOS rota la sub) --------------------

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