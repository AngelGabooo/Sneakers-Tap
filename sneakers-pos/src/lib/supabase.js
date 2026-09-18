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
    detectSessionInUrl: true,
    storageKey: 'sneakers-auth',          // ⭐ Storage key único
    flowType: 'pkce',                     // ⭐ Mejor seguridad para SPA
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// ⭐ Detectar eventos de auth para debug
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('🔄 Token refrescado')
  }
  if (event === 'SIGNED_OUT') {
    console.log('🚪 Sesión cerrada')
    // Limpiar storages
    try {
      localStorage.removeItem('sneakers-notifications-cache')
    } catch {}
  }
  if (event === 'SIGNED_IN') {
    console.log('✅ Sesión iniciada:', session?.user?.email)
  }
})