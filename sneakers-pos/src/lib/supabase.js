// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '❌ Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env.local'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // ⭐ FIX: en producción SPA no necesitamos detectar sesión en URL.
    //    Esto evita refresh innecesario en cada navegación/recarga.
    detectSessionInUrl: false,
    storageKey: 'sneakers-auth',
    flowType: 'pkce',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
      // ⭐ FIX: heartbeat más espaciado (default 30s → 60s)
      //    Reduce ~50% los logs de Realtime.
      heartbeatIntervalMs: 60000,
    },
  },
})

// ⭐ Detectar eventos de auth para debug
//    (los console.log en producción no afectan al bundle final)
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('🔄 Token refrescado')
  }
  if (event === 'SIGNED_OUT') {
    console.log('🚪 Sesión cerrada')
    try {
      localStorage.removeItem('sneakers-notifications-cache')
    } catch {}
  }
  if (event === 'SIGNED_IN') {
    console.log('✅ Sesión iniciada:', session?.user?.email)
  }
})