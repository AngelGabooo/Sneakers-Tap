import { Plus, Download, Shield } from 'lucide-react'
import Button from '../common/Button'

export default function RolesHeader({ onNew, onExport }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
          <Shield size={20} className="text-brand-blue" strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-brand-black dark:text-dark-text tracking-tight">
            Roles y permisos
          </h1>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-1 max-w-2xl">
            Define qué pueden consultar, crear, modificar y administrar los usuarios dentro de Sneakers.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button variant="secondary" icon={Download} onClick={onExport}>
          Exportar
        </Button>
        <Button variant="primary" icon={Plus} onClick={onNew}>
          Nuevo rol
        </Button>
      </div>
    </div>
  )
}