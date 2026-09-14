import { ChevronRight, Save, X } from 'lucide-react'
import Button from '../common/Button'

export default function ProductFormHeader({
  onBack,
  onCancel,
  onSubmit,
  submitting = false,
  isEdit = false,
}) {
  const title = isEdit ? 'Editar producto' : 'Crear producto'
  const subtitle = isEdit
    ? 'Actualiza la información del producto.'
    : 'Agrega un nuevo producto al catálogo de Sneakers.'
  const submitLabel = isEdit ? 'Guardar cambios' : 'Guardar producto'

  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm mb-5">
        <button
          onClick={onBack}
          className="text-gray-500 dark:text-dark-muted hover:text-brand-blue transition-colors font-medium"
        >
          Productos
        </button>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-brand-black dark:text-dark-text font-medium">{title}</span>
      </nav>

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-brand-black dark:text-dark-text tracking-tight">
            {title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-1">
            {subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={X} onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="primary" icon={Save} onClick={onSubmit} loading={submitting}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </>
  )
}