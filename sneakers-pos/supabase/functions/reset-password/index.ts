import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  try {
    // 1. Verificar autenticación del caller
    const authHeader = req.headers.get('Authorization') || ''
    const token = authHeader.replace('Bearer ', '').trim()

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'No autenticado: falta el token' }),
        { status: 401, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      )
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !caller) {
      return new Response(
        JSON.stringify({ error: 'No autenticado: ' + (authError?.message || '') }),
        { status: 401, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      )
    }

    // 2. Verificar que el caller sea admin
    const { data: callerProfile } = await supabaseAdmin
      .from('profiles')
      .select('role_id, role:roles(name)')
      .eq('id', caller.id)
      .single()

    const callerRole = callerProfile?.role?.name
    if (callerRole !== 'Administrador' && callerRole !== 'Gerente') {
      return new Response(
        JSON.stringify({ error: 'Solo admins pueden restablecer contraseñas' }),
        { status: 403, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      )
    }

    // 3. Parsear body
    const { userId, newPassword } = await req.json()

    if (!userId || !newPassword) {
      return new Response(
        JSON.stringify({ error: 'userId y newPassword obligatorios' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      )
    }

    if (newPassword.length < 8) {
      return new Response(
        JSON.stringify({ error: 'La contraseña debe tener al menos 8 caracteres' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      )
    }

    // 4. Actualizar la contraseña
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    })

    if (error) {
      console.error('❌ Error actualizando contraseña:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      )
    }

    console.log(`✅ Contraseña actualizada para: ${data.user?.email}`)

    // 5. Marcar mustChangePassword en profile
    await supabaseAdmin
      .from('profiles')
      .update({ must_change_password: true })
      .eq('id', userId)

    return new Response(
      JSON.stringify({ ok: true, user: data.user }),
      { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    )
  } catch (err: any) {
    console.error('❌ Error inesperado:', err)
    return new Response(
      JSON.stringify({ error: err.message || 'Error desconocido' }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    )
  }
})