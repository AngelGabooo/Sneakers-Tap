// supabase/functions/send-push/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'https://esm.sh/web-push@3.6.6'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const VAPID_PUBLIC = Deno.env.get('VAPID_PUBLIC')!
const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE')!
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@sneakers.com'

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE)

serve(async (req) => {
  try {
    const { notification } = await req.json()

    if (!notification) {
      return new Response(JSON.stringify({ error: 'Falta notification' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Obtener todas las suscripciones
    const { data: subs, error } = await supabase
      .from('push_subscriptions')
      .select('*')

    if (error) throw error

    const results = { sent: 0, failed: 0, removed: 0 }

    for (const sub of subs || []) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify({
            title: notification.title || 'SNEAKERS',
            body: notification.description || '',
            url: '/notifications',
            tag: notification.id,
            priority: notification.priority || 'normal',
          }),
        )
        results.sent++
      } catch (err: any) {
        results.failed++
        // Si la suscripción expiró, eliminarla
        if (err.statusCode === 410 || err.statusCode === 404) {
          await supabase.from('push_subscriptions').delete().eq('id', sub.id)
          results.removed++
        } else {
          console.error('Error enviando push:', err.message)
        }
      }
    }

    return new Response(JSON.stringify({ ok: true, ...results }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('Error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})