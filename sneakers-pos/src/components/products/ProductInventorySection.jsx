import { Info, Boxes, AlertTriangle, Warehouse } from 'lucide-react'
import Card from '../common/Card'
import TextField from '../common/TextField'
import SelectField from '../common/SelectField'

export default function ProductInventorySection({
  values,
  errors,
  onChange,
  options,
  summary, // { totalStock, variantsCount, lowStockCount, outOfStockCount }
}) {
  const totalStock = summary?.totalStock ?? 0
  const variantsCount = summary?.variantsCount ?? 0
  const lowStockCount = summary?.lowStockCount ?? 0
  const outOfStockCount = summary?.outOfStockCount ?? 0

  return (
    <Card>
      <header className="mb-5">
        <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
          Configuración de inventario
        </h2>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Define el stock mínimo y la ubicación. El stock por talla se captura en la sección <strong>Variantes</strong>.
        </p>
      </header>

      {/* Resumen dinámico del inventario */}
      {variantsCount > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <StatBox
            icon={Boxes}
            label="Stock total"
            value={totalStock}
            tone="info"
          />
          <StatBox
            icon={Boxes}
            label="Variantes"
            value={variantsCount}
            tone="info"
          />
          <StatBox
            icon={AlertTriangle}
            label="Stock bajo"
            value={lowStockCount}
            tone={lowStockCount > 0 ? 'warning' : 'info'}
          />
          <StatBox
            icon={Warehouse}
            label="Agotadas"
            value={outOfStockCount}
            tone={outOfStockCount > 0 ? 'danger' : 'info'}
          />
        </div>
      )}

      {/* Configuración */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          id="minStock"
          label="Stock mínimo por variante"
          type="number"
          value={values.minStock}
          onChange={(e) => onChange('minStock', e.target.value)}
          placeholder="3"
          error={errors.minStock}
          hint="Te avisaremos cuando una variante llegue a esta cantidad."
        />

        <SelectField
          id="location"
          label="Ubicación principal"
          value={values.location}
          onChange={(e) => onChange('location', e.target.value)}
          placeholder="Seleccionar ubicación"
          options={options.locations || []}
        />
      </div>

      <div className="mt-4 flex items-start gap-2 text-xs text-gray-500 dark:text-dark-muted">
        <Info size={13} strokeWidth={2} className="mt-0.5 shrink-0" />
        <span>
          Para ajustes manuales de existencias utiliza el módulo de <strong>Inventario</strong>. Los cambios quedarán registrados en el historial de movimientos.
        </span>
      </div>
    </Card>
  )
}

function StatBox({ icon: Icon, label, value, tone = 'info' }) {
  const tones = {
    info:    'text-brand-blue bg-blue-50 dark:bg-blue-950/40',
    warning: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40',
    danger:  'text-brand-red bg-red-50 dark:bg-red-950/40',
  }
  return (
    <div className="rounded-lg border border-gray-100 dark:border-dark-border p-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${tones[tone]}`}>
        <Icon size={16} strokeWidth={2} />
      </div>
      <p className="text-xs text-gray-500 dark:text-dark-muted">{label}</p>
      <p className="text-lg font-bold text-brand-black dark:text-dark-text leading-tight">
        {value}
      </p>
    </div>
  )
}