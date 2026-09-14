import { X, Download, UserCheck, UserX, Mail } from 'lucide-react'
import Button from '../common/Button'

export default function UsersBulkBar({
  count = 0,
  onClear,
  onExport,
  onActivate,
  onDeactivate,
  onInvite,
}) {
  if (count === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-3 mb-3 px-4 py-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
      <span className="text-sm font-medium text-brand-blue dark:text-blue-300">
        {count} seleccionado{count !== 1 ? 's' : ''}
      </span>

      <div className="flex flex-wrap items-center gap-2 ml-auto">
        <Button variant="ghost" size="sm" icon={Download} onClick={onExport}>Exportar</Button>
        <Button variant="ghost" size="sm" icon={UserCheck} onClick={onActivate}>Activar</Button>
        <Button variant="ghost" size="sm" icon={UserX} onClick={onDeactivate}>Desactivar</Button>
        <Button variant="ghost" size="sm" icon={Mail} onClick={onInvite}>Enviar invitación</Button>
        <button
          type="button"
          onClick={onClear}
          className="p-1.5 rounded-md text-gray-500 hover:text-brand-black dark:hover:text-dark-text hover:bg-white/60 dark:hover:bg-dark-surface transition-colors"
          aria-label="Limpiar selección"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}