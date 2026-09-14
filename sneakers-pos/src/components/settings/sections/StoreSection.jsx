// src/components/settings/sections/StoreSection.jsx
import { Upload, Trash2 } from 'lucide-react'
import { Section, TextInput, TextArea, Grid2, Grid3, Checkbox } from '../Field'

export default function StoreSection({ draft, updateSection }) {
  const { store } = draft

  const setStore = (patch) => updateSection('store', patch)
  const setAddress = (patch) => setStore({ address: { ...store.address, ...patch } })
  const setContact = (patch) => setStore({ contact: { ...store.contact, ...patch } })

  return (
    <>
      <Section
        title="Información general"
        description="Datos principales de la tienda que aparecerán en documentos y tickets."
      >
        <Grid2>
          <TextInput
            label="Nombre comercial"
            required
            value={store.commercialName}
            onChange={(e) => setStore({ commercialName: e.target.value })}
            placeholder="SNEAKERS"
          />
          <TextInput
            label="Razón social"
            value={store.legalName}
            onChange={(e) => setStore({ legalName: e.target.value })}
            placeholder="SNEAKERS MX S.A. de C.V."
          />
          <TextInput
            label="RFC"
            value={store.rfc}
            onChange={(e) => setStore({ rfc: e.target.value.toUpperCase() })}
            placeholder="SME260101AB1"
          />
          <TextInput
            label="Teléfono"
            value={store.phone}
            onChange={(e) => setStore({ phone: e.target.value })}
            placeholder="+52 962 123 4567"
          />
          <TextInput
            label="Correo electrónico"
            type="email"
            value={store.email}
            onChange={(e) => setStore({ email: e.target.value })}
            placeholder="contacto@sneakers.mx"
          />
          <TextInput
            label="Sitio web"
            value={store.website}
            onChange={(e) => setStore({ website: e.target.value })}
            placeholder="sneakers.mx"
          />
        </Grid2>
        <TextArea
          label="Descripción"
          className="mt-4"
          value={store.description}
          onChange={(e) => setStore({ description: e.target.value })}
          placeholder="Tienda especializada en sneakers, ropa, accesorios y productos urbanos."
        />
      </Section>

      <Section title="Logotipo" description="Se reutilizará en tickets, comprobantes y reportes.">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="
            w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 dark:border-dark-border
            flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-dark-card shrink-0
          ">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
            ) : (
              <Upload size={20} className="text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 dark:text-dark-muted mb-2">
              Formatos permitidos: PNG, JPG, SVG · Tamaño recomendado: 800 × 800 px
            </p>
            <div className="flex flex-wrap gap-2">
              <label className="
                inline-flex items-center gap-2 h-9 px-3 rounded-lg text-sm font-medium cursor-pointer
                bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border
                text-gray-700 dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-card
              ">
                <Upload size={14} />
                Cambiar logotipo
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const url = URL.createObjectURL(file)
                      setStore({ logoUrl: url })
                    }
                  }}
                />
              </label>
              {store.logoUrl && (
                <button
                  type="button"
                  onClick={() => setStore({ logoUrl: null })}
                  className="
                    inline-flex items-center gap-2 h-9 px-3 rounded-lg text-sm font-medium
                    border border-gray-200 dark:border-dark-border
                    text-brand-red hover:bg-red-50 dark:hover:bg-red-950/30
                  "
                >
                  <Trash2 size={14} />
                  Eliminar
                </button>
              )}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Dirección principal">
        <Grid3>
          <TextInput
            label="Calle"
            value={store.address.street}
            onChange={(e) => setAddress({ street: e.target.value })}
          />
          <TextInput
            label="Número exterior"
            value={store.address.exteriorNumber}
            onChange={(e) => setAddress({ exteriorNumber: e.target.value })}
          />
          <TextInput
            label="Número interior"
            value={store.address.interiorNumber}
            onChange={(e) => setAddress({ interiorNumber: e.target.value })}
          />
          <TextInput
            label="Colonia"
            value={store.address.neighborhood}
            onChange={(e) => setAddress({ neighborhood: e.target.value })}
          />
          <TextInput
            label="Ciudad"
            value={store.address.city}
            onChange={(e) => setAddress({ city: e.target.value })}
          />
          <TextInput
            label="Estado"
            value={store.address.state}
            onChange={(e) => setAddress({ state: e.target.value })}
          />
          <TextInput
            label="Código postal"
            value={store.address.postalCode}
            onChange={(e) => setAddress({ postalCode: e.target.value })}
          />
          <TextInput
            label="País"
            value={store.address.country}
            onChange={(e) => setAddress({ country: e.target.value })}
          />
        </Grid3>
        <div className="mt-4">
          <Checkbox
            label="Usar esta dirección en los tickets"
            checked={store.address.useOnTicket}
            onChange={(v) => setAddress({ useOnTicket: v })}
          />
        </div>
      </Section>

      <Section title="Información de contacto" description="Se mostrará al cliente en el ticket.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          <Checkbox label="Mostrar teléfono"   checked={store.contact.showPhone}   onChange={(v) => setContact({ showPhone: v })} />
          <Checkbox label="Mostrar correo"     checked={store.contact.showEmail}   onChange={(v) => setContact({ showEmail: v })} />
          <Checkbox label="Mostrar sitio web"  checked={store.contact.showWebsite} onChange={(v) => setContact({ showWebsite: v })} />
          <Checkbox label="Mostrar dirección"  checked={store.contact.showAddress} onChange={(v) => setContact({ showAddress: v })} />
          <Checkbox label="Mostrar redes"      checked={store.contact.showSocial}  onChange={(v) => setContact({ showSocial: v })} />
        </div>
        <Grid3>
          <TextInput label="Instagram" value={store.contact.instagram} onChange={(e) => setContact({ instagram: e.target.value })} placeholder="@sneakers.mx" />
          <TextInput label="Facebook"  value={store.contact.facebook}  onChange={(e) => setContact({ facebook: e.target.value })}  placeholder="SNEAKERS MX" />
          <TextInput label="WhatsApp"  value={store.contact.whatsapp}  onChange={(e) => setContact({ whatsapp: e.target.value })}  placeholder="+52 962 123 4567" />
        </Grid3>
      </Section>
    </>
  )
}