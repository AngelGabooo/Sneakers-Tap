// src/components/settings/sections/SalesSection.jsx
import { Section, Toggle, TextInput } from '../Field'

export default function SalesSection({ draft, updateSection }) {
  const { sales } = draft
  const set = (patch) => updateSection('sales', patch)

  return (
    <>
      <Section title="Confirmación">
        <Toggle
          label="Solicitar confirmación antes de cancelar una venta"
          checked={sales.confirmCancel}
          onChange={(v) => set({ confirmCancel: v })}
        />
        <Toggle
          label="Solicitar confirmación antes de eliminar un producto del carrito"
          checked={sales.confirmRemoveItem}
          onChange={(v) => set({ confirmRemoveItem: v })}
        />
      </Section>

      <Section title="Stock">
        <Toggle
          label="Permitir vender productos sin stock"
          description="Si está desactivado, el POS no permitirá vender variantes con stock 0."
          checked={sales.allowSaleWithoutStock}
          onChange={(v) => set({ allowSaleWithoutStock: v })}
        />
      </Section>

      <Section title="Precios">
        <Toggle
          label="Permitir modificar precios desde el POS"
          description="Requiere permiso configurado en Roles y permisos."
          checked={sales.allowPriceEdit}
          onChange={(v) => set({ allowPriceEdit: v })}
        />
      </Section>

      <Section title="Descuentos">
        <TextInput
          label="Descuento máximo predeterminado (%)"
          type="number"
          min="0"
          max="100"
          value={sales.maxDiscount}
          onChange={(e) => set({ maxDiscount: Number(e.target.value) })}
        />
        <p className="text-xs text-gray-500 dark:text-dark-muted mt-2">
          Los permisos para autorizar descuentos superiores se administran desde Roles y permisos.
        </p>
      </Section>
    </>
  )
}