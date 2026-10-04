// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '❌ Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env.local'
  )
}

// ⭐ FIX: singleton global para evitar Multiple GoTrueClient instances
//    Esto resuelve el warning que viste en DevTools:
//    "GoTrueClient@sb-... Multiple GoTrueClient instances detected"
let _supabase = globalThis.__supabase_client__

if (!_supabase) {
  _supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storageKey: 'sneakers-auth',
      flowType: 'pkce',
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
        heartbeatIntervalMs: 60000,
      },
    },
  })
  globalThis.__supabase_client__ = _supabase
}

export const supabase = _supabase

// ⭐ Detectar eventos de auth para debug
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