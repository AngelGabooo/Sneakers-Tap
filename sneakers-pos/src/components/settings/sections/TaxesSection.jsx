// src/components/settings/sections/TaxesSection.jsx
import { Section, TextInput, Toggle } from '../Field'

export default function TaxesSection({ draft, updateSection }) {
  const { taxes } = draft
  const set = (patch) => updateSection('taxes', patch)

  const example = 2499
  const rate = Number(taxes.rate) || 0
  const base = taxes.pricesIncludeTax ? example / (1 + rate / 100) : example
  const taxAmount = example - base

  return (
    <>
      <Section title="Impuestos">
        <TextInput
          label="Impuesto principal"
          value={taxes.name}
          onChange={(e) => set({ name: e.target.value })}
        />
        <TextInput
          label="Tasa (%)"
          type="number"
          min="0"
          step="0.01"
          className="mt-4"
          value={taxes.rate}
          onChange={(e) => set({ rate: Number(e.target.value) })}
        />
        <div className="mt-4">
          <Toggle
            label="Los precios incluyen impuestos"
            description="Si está activo, el POS considera que el precio ya lleva el impuesto."
            checked={taxes.pricesIncludeTax}
            onChange={(v) => set({ pricesIncludeTax: v })}
          />
        </div>
      </Section>

      <Section title="Vista previa">
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-dark-muted">Precio base</span>
            <span className="font-medium text-brand-black dark:text-dark-text">${base.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-dark-muted">{taxes.name || 'Impuesto'}</span>
            <span className="font-medium text-brand-black dark:text-dark-text">${taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 dark:border-dark-border pt-1.5">
            <span className="font-semibold text-brand-black dark:text-dark-text">Total</span>
            <span className="font-bold text-brand-black dark:text-dark-text">${example.toFixed(2)}</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-dark-muted mt-3">
          Esta configuración se aplica solo a operaciones nuevas. Las ventas históricas conservan el impuesto registrado.
        </p>
      </Section>
    </>
  )
}