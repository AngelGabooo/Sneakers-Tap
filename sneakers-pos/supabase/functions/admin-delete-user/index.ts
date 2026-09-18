// supabase/functions/admin-delete-user/index.ts
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

serve(async (req) => {
  try {
    const { userId } = await req.json()

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      )
    }

    // Borrar del auth.users (el profile se borra por cascade)
    const { error } = await supabase.auth.admin.deleteUser(userId)
    if (error) throw error

    // Asegurar que el profile también se borró
    await supabase.from('profiles').delete().eq('id', userId)

    console.log('✅ Usuario eliminado:', userId)

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    )
  } catch (err: any) {
    console.error('❌ Error eliminando usuario:', err)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
})