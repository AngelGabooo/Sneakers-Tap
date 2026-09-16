import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization') || ''
    const token = authHeader.replace('Bearer ', '')

    const supabaseUser = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!)
    const { data: { user: caller } } = await supabaseUser.auth.getUser(token)

    if (!caller) {
      return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401 })
    }

    const { email, password, metadata } = await req.json()

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email y password obligatorios' }), { status: 400 })
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY)
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: metadata || {},
    })

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 })
    }

    return new Response(JSON.stringify({ user: data.user }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})