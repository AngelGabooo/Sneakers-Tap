// src/utils/webPush.js
import { supabase } from '../lib/supabase'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

/**
 * Convierte la VAPID key de base64 URL-safe a Uint8Array.
 */
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
 */
export function isPushSupported() {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

/**
 * Registra el Service Worker (sin pedir permiso).
 * ⭐ Esta función es la que falta en tu archivo actual.
 */
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

/**
 * Obtiene la suscripción push existente (si hay).
 */
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
 */
export async function subscribeToPush(userId) {
  if (!isPushSupported()) return { ok: false, reason: 'unsupported' }
  if (!VAPID_PUBLIC_KEY) return { ok: false, reason: 'no-vapid' }

  try {
    // 1. Pedir permiso
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return { ok: false, reason: 'denied' }

    // 2. Registrar SW (o esperar a que esté listo)
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

/**
 * Cancela la suscripción push.
 */
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

/**
 * Devuelve el estado actual del push.
 * - 'unsupported' → navegador no soporta
 * - 'denied'      → permiso denegado
 * - 'default'     → permiso sin pedir
 * - 'granted'     → permiso concedido pero sin suscripción
 * - 'subscribed'  → suscrito y guardado
 */
export async function getPushStatus() {
  if (!isPushSupported()) return 'unsupported'
  if (Notification.permission === 'denied') return 'denied'
  if (Notification.permission === 'default') return 'default'
  const sub = await getExistingSubscription()
  return sub ? 'subscribed' : 'granted'
}