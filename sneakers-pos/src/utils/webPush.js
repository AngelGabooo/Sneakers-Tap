// src/utils/webPush.js
import { supabase } from '../lib/supabase'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

// ⭐ FIX: guard global para evitar upserts repetidos
let lastUpsertAt = 0
let lastUpsertEndpoint = null
const UPSERT_COOLDOWN_MS = 5 * 60 * 1000

function isIOS() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function isPushSupported() {
  const hasAPIs =
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window

  if (!hasAPIs) return false
  if (isIOS() && !isStandalone()) return false
  return true
}

export function needsIOSInstall() {
  return isIOS() && !isStandalone()
}

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    })
    console.log('🔧 Service Worker registrado:', registration.scope)
    return registration
  } catch (err) {
    console.warn('⚠️ Error registrando Service Worker:', err)
    return null
  }
}

export async function getExistingSubscription() {
  if (!isPushSupported()) return null
  try {
    const registration = await navigator.serviceWorker.getRegistration()
    if (!registration) return null
    return await registration.pushManager.getSubscription()
  } catch {
    return null
  }
}

export async function subscribeToPush(userId) {
  if (!isPushSupported()) {
    if (needsIOSInstall()) return { ok: false, reason: 'ios-needs-install' }
    return { ok: false, reason: 'unsupported' }
  }
  if (!VAPID_PUBLIC_KEY) return { ok: false, reason: 'no-vapid' }

  try {
    await saveVapidKeyToIDB(VAPID_PUBLIC_KEY)

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return { ok: false, reason: 'denied' }

    let registration = await navigator.serviceWorker.getRegistration()
    if (!registration) {
      registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
    }
    await navigator.serviceWorker.ready

    let subscription = await registration.pushManager.getSubscription()
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })
    }

    const subJson = subscription.toJSON()

    // ⭐ FIX: guard contra upserts repetidos.
    //    Si el endpoint es el mismo y lo hicimos hace <5 min, no re-hacemos el upsert.
    const now = Date.now()
    if (
      subJson.endpoint === lastUpsertEndpoint &&
      now - lastUpsertAt < UPSERT_COOLDOWN_MS
    ) {
      console.log('⏭️ Upsert push_subscriptions omitido (cooldown)')
      return { ok: true, cached: true }
    }

    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          user_id: userId,
          endpoint: subJson.endpoint,
          p256dh: subJson.keys.p256dh,
          auth: subJson.keys.auth,
          user_agent: navigator.userAgent,
        },
        { onConflict: 'endpoint' },
      )

    if (error) throw error

    lastUpsertAt = now
    lastUpsertEndpoint = subJson.endpoint

    console.log('✅ Suscrito a Web Push')
    return { ok: true }
  } catch (err) {
    console.error('❌ Error suscribiendo:', err)
    return { ok: false, reason: err.message }
  }
}

function saveVapidKeyToIDB(vapidPublic) {
  return new Promise((resolve) => {
    const req = indexedDB.open('sneakers-push', 1)
    req.onerror = () => resolve(false)
    req.onsuccess = () => {
      const db = req.result
      if (!db.objectStoreNames.contains('keys')) {
        db.close()
        return resolve(false)
      }
      const tx = db.transaction('keys', 'readwrite')
      tx.objectStore('keys').put({ key: 'vapidPublic', value: vapidPublic })
      tx.oncomplete = () => resolve(true)
      tx.onerror = () => resolve(false)
    }
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains('keys')) {
        db.createObjectStore('keys', { keyPath: 'key' })
      }
    }
  })
}

export async function unsubscribeFromPush() {
  if (!isPushSupported()) return { ok: false, reason: 'unsupported' }
  try {
    const subscription = await getExistingSubscription()
    if (subscription) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', subscription.endpoint)
      await subscription.unsubscribe()
    }
    return { ok: true }
  } catch (err) {
    return { ok: false, reason: err.message }
  }
}

export async function getPushStatus() {
  if (!isPushSupported()) {
    return needsIOSInstall() ? 'ios-needs-install' : 'unsupported'
  }
  if (Notification.permission === 'denied') return 'denied'
  if (Notification.permission === 'default') return 'default'
  const sub = await getExistingSubscription()
  return sub ? 'subscribed' : 'granted'
}

export function listenForSubscriptionChanges(userId) {
  if (typeof navigator === 'undefined') return () => {}
  if (!('serviceWorker' in navigator)) return () => {}

  const handler = async (event) => {
    if (event.data?.type !== 'PUSH_SUBSCRIPTION_CHANGED') return

    const sub = event.data.subscription
    console.log('🔄 SW renovó la suscripción, guardando en Supabase…')

    // ⭐ FIX: guard contra upserts repetidos en este handler también.
    const now = Date.now()
    if (
      sub.endpoint === lastUpsertEndpoint &&
      now - lastUpsertAt < UPSERT_COOLDOWN_MS
    ) {
      console.log('⏭️ Upsert (SW change) omitido (cooldown)')
      return
    }

    const { error } = await supabase.from('push_subscriptions').upsert(
      {
        user_id: userId,
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
        user_agent: navigator.userAgent,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'endpoint' },
    )

    if (error) {
      console.error('❌ Error guardando suscripción renovada:', error)
    } else {
      lastUpsertAt = now
      lastUpsertEndpoint = sub.endpoint
      console.log('✅ Suscripción renovada guardada en Supabase')
    }
  }

  navigator.serviceWorker.addEventListener('message', handler)
  return () => navigator.serviceWorker.removeEventListener('message', handler)
}