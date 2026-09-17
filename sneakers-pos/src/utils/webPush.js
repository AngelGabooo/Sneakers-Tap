// src/utils/webPush.js
import { supabase } from '../lib/supabase'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

// ⭐ NUEVO: detección iOS
function isIOS() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

// ⭐ NUEVO: ¿corre como PWA instalada?
function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

// -------------------- (SIN CAMBIOS) --------------------
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

/**
 * ¿El navegador soporta Web Push?
 * ⭐ AHORA: en iOS, solo si está instalada como PWA.
 */
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

/**
 * ⭐ NUEVO: ¿Estamos en iOS pero NO instalada como PWA?
 * Útil para mostrar mensaje específico en la UI.
 */
export function needsIOSInstall() {
  return isIOS() && !isStandalone()
}

// -------------------- (SIN CAMBIOS) --------------------
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

/**
 * Suscribe al usuario a Web Push.
 * ⭐ Ahora guarda la VAPID key en IndexedDB para el SW (iOS).
 */
export async function subscribeToPush(userId) {
  if (!isPushSupported()) {
    if (needsIOSInstall()) return { ok: false, reason: 'ios-needs-install' }
    return { ok: false, reason: 'unsupported' }
  }
  if (!VAPID_PUBLIC_KEY) return { ok: false, reason: 'no-vapid' }

  try {
    // ⭐ NUEVO: guardar VAPID en IndexedDB para que el SW pueda re-suscribir
    await saveVapidKeyToIDB(VAPID_PUBLIC_KEY)

    // 1. Pedir permiso
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return { ok: false, reason: 'denied' }

    // 2. Registrar SW (o esperar)
    let registration = await navigator.serviceWorker.getRegistration()
    if (!registration) {
      registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
    }
    await navigator.serviceWorker.ready

    // 3. Suscribirse al push
    let subscription = await registration.pushManager.getSubscription()
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })
    }

    const subJson = subscription.toJSON()

    // 4. Guardar en Supabase
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

    console.log('✅ Suscrito a Web Push')
    return { ok: true }
  } catch (err) {
    console.error('❌ Error suscribiendo:', err)
    return { ok: false, reason: err.message }
  }
}

// ⭐ NUEVO helper
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

// -------------------- (SIN CAMBIOS) --------------------
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

// -------------------- (SIN CAMBIOS) --------------------
export function listenForSubscriptionChanges(userId) {
  if (typeof navigator === 'undefined') return () => {}
  if (!('serviceWorker' in navigator)) return () => {}

  const handler = async (event) => {
    if (event.data?.type !== 'PUSH_SUBSCRIPTION_CHANGED') return

    const sub = event.data.subscription
    console.log('🔄 SW renovó la suscripción, guardando en Supabase…')

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
      console.log('✅ Suscripción renovada guardada en Supabase')
    }
  }

  navigator.serviceWorker.addEventListener('message', handler)
  return () => navigator.serviceWorker.removeEventListener('message', handler)
}