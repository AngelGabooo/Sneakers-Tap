import Card from '../common/Card'
import RadioGroup from '../common/RadioGroup'

const STATUS_OPTIONS = [
  { value: 'active',   label: 'Activo',   description: 'El producto estará disponible para ventas.' },
  { value: 'draft',    label: 'Borrador', description: 'El producto se guardará pero no estará disponible para venta.' },
  { value: 'inactive', label: 'Inactivo', description: 'El producto no aparecerá en el punto de venta.' },
]

export default function ProductStatusPanel({ value, onChange }) {
  return (
    <Card>
      <header className="mb-4">
        <h2 className="text-base font-semibold text-brand-black dark:text-dark-text">
          Estado del producto
        </h2>
      </header>

      <RadioGroup
        name="status"
        value={value}
        onChange={onChange}
        options={STATUS_OPTIONS}
      />
    </Card>
  )
}