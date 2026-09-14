// src/pages/Settings.jsx
import { useState } from 'react'
import { Save, X } from 'lucide-react'
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

export default function Settings() {
  const { activeView, navigate } = useView()
  const {
    draft, loading, saving, isDirty,
    updateSection, updateDraft, discard, save,
  } = useSettings()

  const [tab, setTab] = useState('store')

  const handleSave = async () => {
    const result = await save()
    if (result.ok) {
      // TODO: toast "Configuración guardada correctamente"
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

        <div className="flex items-center gap-2 shrink-0">
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
        {tab === 'sales' && (
          <SalesSection draft={draft} updateSection={updateSection} />
        )}
        {tab === 'taxes' && (
          <TaxesSection draft={draft} updateSection={updateSection} />
        )}
        {tab === 'branches' && (
          <BranchesSection draft={draft} updateDraft={updateDraft} />
        )}
        {tab === 'preferences' && (
          <PreferencesSection draft={draft} updateSection={updateSection} />
        )}
      </div>
    </DashboardLayout>
  )
}