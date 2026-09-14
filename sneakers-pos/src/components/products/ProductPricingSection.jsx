import Card from '../common/Card'
import TextField from '../common/TextField'

export default function ProductPricingSection({ values, errors, onChange }) {
  const cost = Number(values.costPrice) || 0
  const sale = Number(values.salePrice) || 0
  const margin = sale > 0 ? (((sale - cost) / sale) * 100).toFixed(1) : '0.0'

  return (
    <Card>
      <header className="mb-5">
        <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
          Precios
        </h2>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Define los precios de venta y costos del producto.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <TextField
          id="costPrice"
          label="Precio de compra"
          type="number"
          value={values.costPrice}
          onChange={(e) => onChange('costPrice', e.target.value)}
          placeholder="0.00"
          error={errors.costPrice}
        />
        <TextField
          id="salePrice"
          label="Precio de venta"
          required
          type="number"
          value={values.salePrice}
          onChange={(e) => onChange('salePrice', e.target.value)}
          placeholder="0.00"
          error={errors.salePrice}
        />
        <TextField
          id="wholesalePrice"
          label="Precio mayorista"
          type="number"
          value={values.wholesalePrice}
          onChange={(e) => onChange('wholesalePrice', e.target.value)}
          placeholder="0.00"
          hint="Precio utilizado para clientes con condiciones de mayoreo."
        />
      </div>

      {/* Margen estimado (informativo) */}
      <div className="mt-4 flex items-center gap-2 text-sm">
        <span className="text-gray-500 dark:text-dark-muted">Margen estimado:</span>
        <span className="font-semibold text-brand-blue">{margin}%</span>
      </div>
    </Card>
  )
}