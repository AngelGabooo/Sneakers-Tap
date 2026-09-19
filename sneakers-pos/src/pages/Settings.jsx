// src/pages/Settings.jsx
import { useState } from 'react'
import { Save, X, RotateCcw } from 'lucide-react'                 // ⭐ RotateCcw añadido
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/common/Button'
import SettingsTabs from '../components/settings/SettingsTabs'
import StoreSection from '../components/settings/sections/StoreSection'
import TicketSection from '../components/settings/sections/TicketSection'
import SalesSection from '../components/settings/sections/SalesSection'
import TaxesSection from '../components/settings/sections/TaxesSection'
import BranchesSection from '../components/settings/sections/BranchesSection'
import PreferencesSection from '../components/settings/sections/PreferencesSection'
import { useSettings } from '../context/SettingsContext'
import { useView } from '../context/ViewContext'
import { supabase } from '../lib/supabase'                        // ⭐ NUEVO

export default function Settings() {
  const { activeView, navigate } = useView()
  const {
    draft, loading, saving, isDirty,
    updateSection, updateDraft, discard, save,
  } = useSettings()

  const [tab, setTab] = useState('store')
  const [resetting, setResetting] = useState(false)               // ⭐ NUEVO

  const handleSave = async () => {
    const result = await save()
    if (result.ok) {
      console.log('✅ Configuración guardada')
    } else {
      console.error('❌ Error al guardar:', result.error)
    }
  }

  const handleDiscard = () => {
    if (!isDirty) return
    if (window.confirm('Se perderán los cambios realizados. ¿Continuar?')) {
      discard()
    }
  }

  // ⭐ NUEVO: Reset local del dispositivo
  const handleResetLocal = async () => {
    const confirmed = window.confirm(
      '⚠️ RESET LOCAL DEL DISPOSITIVO\n\n' +
      'Esto borrará:\n' +
      '• Todos los datos locales (ventas, productos, cajas, etc.)\n' +
      '• La sesión actual\n' +
      '• El cache de notificaciones\n\n' +
      'Los datos se volverán a sincronizar desde Supabase al iniciar sesión.\n\n' +
      '¿Continuar?'
    )
    if (!confirmed) return

    setResetting(true)
    try {
      // 1. Cerrar sesión
      console.log('🔓 Cerrando sesión…')
      await supabase.auth.signOut()

      // 2. Limpiar localStorage y sessionStorage (excepto lo mínimo)
      console.log('🧹 Limpiando storages…')
      const keysToKeep = []
      Object.keys(localStorage).forEach((key) => {
        if (keysToKeep.includes(key)) return
        localStorage.removeItem(key)
      })
      sessionStorage.clear()

      // 3. Borrar IndexedDB
      console.log('🗄️ Borrando IndexedDB…')
      const dbs = await indexedDB.databases()
      for (const db of dbs) {
        if (db.name?.startsWith('sneakers')) {
          console.log('  → Borrando:', db.name)
          indexedDB.deleteDatabase(db.name)
        }
      }

      // 4. Recargar
      console.log('✅ Reset completo. Recargando…')
      setTimeout(() => {
        window.location.href = '/'
        window.location.reload()
      }, 500)
    } catch (err) {
      console.error('❌ Error en reset:', err)
      setResetting(false)
      alert('Error al resetear: ' + err.message)
    }
  }

  if (loading) {
    return (
      <DashboardLayout activeKey="settings" onNavigate={navigate}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-gray-200 dark:bg-dark-border" />
          <div className="h-64 rounded-xl bg-gray-200 dark:bg-dark-border" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeKey={activeView || 'settings'} onNavigate={navigate}>
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 dark:text-dark-muted mb-3">
        Configuración <span className="mx-1">/</span>
        <span className="text-brand-black dark:text-dark-text font-medium">
          Configuración de la tienda
        </span>
      </nav>

      {/* Encabezado */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-brand-black dark:text-dark-text tracking-tight">
            Configuración de la tienda
          </h1>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-1 max-w-2xl">
            Administra los datos generales de SNEAKERS y configura la información que se utiliza en tus tickets y comprobantes de venta.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Button
            variant="secondary"
            icon={X}
            onClick={handleDiscard}
            disabled={!isDirty || saving}
          >
            Descartar cambios
          </Button>
          <Button
            variant="primary"
            icon={Save}
            onClick={handleSave}
            disabled={!isDirty || saving}
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </div>

      {/* Barra de cambios sin guardar */}
      {isDirty && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Tienes cambios sin guardar.
          </p>
        </div>
      )}

      {/* Tabs */}
      <SettingsTabs active={tab} onChange={setTab} />

      {/* Contenido */}
      <div className="mt-5">
        {tab === 'store' && (
          <StoreSection draft={draft} updateSection={updateSection} />
        )}
        {tab === 'ticket' && (
          <TicketSection draft={draft} updateSection={updateSection} />
        )}
   
      </div>

      {/* ⭐ Zona peligrosa: Reset local */}
      <div className="mt-10 pt-6 border-t border-gray-200 dark:border-dark-border">
        <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-950/40 flex items-center justify-center shrink-0">
              <RotateCcw size={18} className="text-brand-red" strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-brand-black dark:text-dark-text">
                Zona peligrosa
              </h3>
              <p className="text-xs text-gray-600 dark:text-dark-muted mt-1">
                Realiza un reset local de este dispositivo. Los datos se sincronizarán
                automáticamente desde el servidor al volver a iniciar sesión.
              </p>
              <p className="text-[11px] text-red-600 dark:text-red-400 mt-2 font-medium">
                ⚠️ Úsalo si los datos no coinciden con otros dispositivos o si la app se comporta raro.
              </p>

              <button
                type="button"
                onClick={handleResetLocal}
                disabled={resetting}
                className="
                  mt-3 inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg
                  text-xs font-bold
                  bg-brand-red text-white hover:bg-red-700
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors
                "
              >
                <RotateCcw size={13} strokeWidth={2.4} className={resetting ? 'animate-spin' : ''} />
                {resetting ? 'Reseteando…' : 'Reset local del dispositivo'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}