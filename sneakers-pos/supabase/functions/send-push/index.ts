// supabase/functions/send-push/index.ts
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'https://esm.sh/web-push@3.6.7'

const VAPID_PUBLIC = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@sneakers.com'

const APP_ORIGIN = 'https://sneakers-tap.vercel.app'

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE)

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

// ⭐ Mapeo: tipo de notificación → vista interna de la app
const VIEW_BY_TYPE: Record<string, string> = {
  sale:       'sales-history',
  cancel:     'sales-history',
  return:     'sales-history',
  cash_open:  'cash-current',
  cash_close: 'cash-history',
  inventory:  'inventory-movements',
  product:    'products',
  wholesale:  'wholesale',
  user:       'users',
  role:       'roles',
  settings:   'settings',
  audit:      'audit',
}

serve(async (req) => {
  try {
    const { notification_id } = await req.json()

    if (!notification_id) {
      return new Response(
        JSON.stringify({ error: 'notification_id requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      )
    }

    // 1. Leer la notificación
    const { data: notif, error: notifError } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', notification_id)
      .single()

    if (notifError || !notif) {
      console.error('❌ Notif no encontrada:', notifError)
      return new Response(
        JSON.stringify({ error: 'Notif no encontrada' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      )
    }

    // 2. Leer TODAS las suscripciones
    const { data: subs, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('*')

    if (subsError) {
      console.error('❌ Error leyendo suscripciones:', subsError)
      return new Response(
        JSON.stringify({ error: subsError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      )
    }

    if (!subs || subs.length === 0) {
      console.log('ℹ️ No hay suscripciones')
      return new Response(
        JSON.stringify({ sent: 0, reason: 'no-subs' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      )
    }

    // 3. Determinar vista destino
    const targetView = VIEW_BY_TYPE[notif.type] || 'dashboard'

    // 4. Armar payload
    const payload = JSON.stringify({
      title: notif.title,
      body: notif.description,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: notif.id,
      priority: notif.priority,
      url: `${APP_ORIGIN}/`,
      view: targetView,
      notifId: notif.id,
    })

    // 5. Enviar a cada suscripción
    let sent = 0
    const errors: any[] = []

    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payload,
        )
        sent++
        console.log(`✅ Push enviado a ${sub.user_agent?.slice(0, 40) || sub.user_id}`)
      } catch (err: any) {
        console.error(`❌ Error push a ${sub.user_id}:`, err.message)
        errors.push({
          user_id: sub.user_id,
          endpoint: sub.endpoint.slice(0, 40),
          error: err.message,
          statusCode: err.statusCode,
        })

        // Si la suscripción caducó, borrarla
        if (err.statusCode === 410 || err.statusCode === 404) {
          console.log(`🗑️ Borrando suscripción caducada de ${sub.user_id}`)
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('id', sub.id)
        }
      }
    }

    return new Response(
      JSON.stringify({ sent, total: subs.length, errors }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    )
  } catch (err: any) {
    console.error('❌ Error general:', err)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
})