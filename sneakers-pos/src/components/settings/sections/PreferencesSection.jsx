// src/components/settings/sections/PreferencesSection.jsx
import { Section, Select, Checkbox } from '../Field'
import { LANGUAGES, CURRENCIES, TIMEZONES, DATE_FORMATS, TIME_FORMATS } from '../../../data/settings'

export default function PreferencesSection({ draft, updateSection }) {
  const { preferences } = draft
  const set = (patch) => updateSection('preferences', patch)
  const setNotif = (patch) => set({ notifications: { ...preferences.notifications, ...patch } })

  return (
    <>
      <Section title="Preferencias generales">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="Idioma"         value={preferences.language}   onChange={(e) => set({ language: e.target.value })}   options={LANGUAGES} />
          <Select label="Moneda"         value={preferences.currency}   onChange={(e) => set({ currency: e.target.value })}   options={CURRENCIES} />
          <Select label="Zona horaria"   value={preferences.timezone}   onChange={(e) => set({ timezone: e.target.value })}   options={TIMEZONES} />
          <Select label="Formato de fecha" value={preferences.dateFormat} onChange={(e) => set({ dateFormat: e.target.value })} options={DATE_FORMATS} />
          <Select label="Formato de hora" value={preferences.timeFormat} onChange={(e) => set({ timeFormat: e.target.value })} options={TIME_FORMATS} />
        </div>
      </Section>

      <Section title="Notificaciones">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Checkbox label="Alertas de stock bajo"          checked={preferences.notifications.lowStock}        onChange={(v) => setNotif({ lowStock: v })} />
          <Checkbox label="Productos agotados"             checked={preferences.notifications.outOfStock}       onChange={(v) => setNotif({ outOfStock: v })} />
          <Checkbox label="Diferencias de caja"            checked={preferences.notifications.cashDifferences}  onChange={(v) => setNotif({ cashDifferences: v })} />
          <Checkbox label="Ventas canceladas"              checked={preferences.notifications.cancelledSales}   onChange={(v) => setNotif({ cancelledSales: v })} />
          <Checkbox label="Devoluciones"                   checked={preferences.notifications.returns}          onChange={(v) => setNotif({ returns: v })} />
          <Checkbox label="Eventos importantes de seguridad" checked={preferences.notifications.securityEvents} onChange={(v) => setNotif({ securityEvents: v })} />
        </div>
      </Section>
    </>
  )
}