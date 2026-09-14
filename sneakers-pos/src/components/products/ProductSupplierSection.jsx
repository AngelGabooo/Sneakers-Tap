import { Plus } from 'lucide-react'
import Card from '../common/Card'
import SelectField from '../common/SelectField'

export default function ProductSupplierSection({ values, onChange, options, onCreateSupplier }) {
  return (
    <Card>
      <header className="mb-5">
        <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
          Proveedor
        </h2>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Asigna el proveedor principal del producto.
        </p>
      </header>

      <SelectField
        id="supplier"
        label="Proveedor"
        value={values.supplier}
        onChange={(e) => onChange('supplier', e.target.value)}
        placeholder="Seleccionar proveedor"
        options={options.suppliers || []}
        rightAction={
          <button
            type="button"
            onClick={onCreateSupplier}
            className="inline-flex items-center gap-1 text-xs font-medium text-brand-blue hover:underline"
          >
            <Plus size={12} strokeWidth={2.4} />
            Crear proveedor
          </button>
        }
      />
    </Card>
  )
}