import { X, Check } from 'lucide-react'
import Button from '../../common/Button'

export default function CashCloseHeader({ onCancel, onSubmit, submitting, disabled }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-brand-black dark:text-dark-text tracking-tight">
          Cierre de caja
        </h1>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-1">
          Realiza el conteo final, concilia los valores y cierra la sesión de caja.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="secondary" icon={X} onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          icon={Check}
          onClick={onSubmit}
          loading={submitting}
          disabled={disabled || submitting}
        >
          {submitting ? 'Cerrando caja...' : 'Cerrar caja'}
        </Button>
      </div>
    </div>
  )
}