// src/components/users/UserCreateHeader.jsx
import { ChevronRight, Save, X, UserPlus, UserCog } from 'lucide-react'
import Button from '../common/Button'

export default function UserCreateHeader({
  mode = 'create', // 'create' | 'edit'
  onBack,
  onCancel,
  onSubmit,
  submitting = false,
  disabled = false,
}) {
  const isEdit = mode === 'edit'

  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm mb-5" aria-label="Breadcrumb">
        <button
          type="button"
          onClick={onBack}
          className="text-gray-500 dark:text-dark-muted hover:text-brand-blue transition-colors font-medium"
        >
          Usuarios y empleados
        </button>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-brand-black dark:text-dark-text font-medium">
          {isEdit ? 'Editar empleado' : 'Nuevo empleado'}
        </span>
      </nav>

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
            {isEdit
              ? <UserCog size={20} className="text-brand-blue" strokeWidth={2} />
              : <UserPlus size={20} className="text-brand-blue" strokeWidth={2} />}
          </div>
          <div>
            <h1 className="text-2xl lg:text-[28px] font-bold text-brand-black dark:text-dark-text tracking-tight leading-tight">
              {isEdit ? 'Editar empleado' : 'Nuevo empleado'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-dark-muted mt-1 max-w-xl">
              {isEdit
                ? 'Modifica la información del empleado. Los cambios se aplican inmediatamente.'
                : 'Crea la cuenta de acceso del empleado y define su contraseña inicial. El correo será su nombre de usuario.'}
            </p>
          </div>
        </div>

        {/* Acciones en desktop */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <Button
            variant="secondary"
            icon={X}
            onClick={onCancel}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            icon={Save}
            onClick={onSubmit}
            loading={submitting}
            disabled={disabled}
          >
            {isEdit ? 'Guardar cambios' : 'Crear empleado'}
          </Button>
        </div>
      </div>
    </>
  )
}