import Card from '../common/Card'
import TextField from '../common/TextField'
import TextareaField from '../common/TextareaField'

export default function ProductGeneralSection({ values, errors, onChange, options }) {
  return (
    <Card>
      <header className="mb-5">
        <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
          Información general
        </h2>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Información básica del producto
        </p>
      </header>

      <div className="space-y-4">
        <TextField
          id="name"
          label="Nombre del producto"
          required
          value={values.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="Ej. Nike Air Max 270"
          error={errors.name}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            id="category"
            label="Categoría"
            required
            value={values.category}
            onChange={(e) => onChange('category', e.target.value)}
            placeholder="Ej. Tenis, Bolsas, Mochilas, Accesorios"
            error={errors.category}
          />

          <TextField
            id="brand"
            label="Marca"
            required
            value={values.brand}
            onChange={(e) => onChange('brand', e.target.value)}
            placeholder="Ej. Nike, Adidas, Puma, New Balance"
            error={errors.brand}
          />
        </div>

        <TextareaField
          id="description"
          label="Descripción"
          value={values.description}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="Describe las características del producto..."
          rows={4}
        />
      </div>
    </Card>
  )
}