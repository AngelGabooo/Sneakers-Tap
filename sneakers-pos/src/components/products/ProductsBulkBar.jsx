import { CheckCircle2, XCircle, FolderInput, Download, Trash2, X } from 'lucide-react'
import Button from '../common/Button'
import IconButton from '../common/IconButton'

export default function ProductsBulkBar({ count, onClear, onActivate, onDeactivate, onChangeCategory, onExport, onDelete }) {
  if (!count) return null

  return (
    <div className="
      flex flex-wrap items-center gap-2 mb-3 px-3 py-2 rounded-lg
      bg-blue-50 dark:bg-blue-950/30
      border border-blue-100 dark:border-blue-900/50
    ">
      <span className="text-sm font-medium text-brand-blue dark:text-blue-300">
        {count} {count === 1 ? 'producto seleccionado' : 'productos seleccionados'}
      </span>

      <div className="flex flex-wrap items-center gap-2 ml-auto">
        <Button size="sm" variant="secondary" icon={CheckCircle2} onClick={onActivate}>Activar</Button>
        <Button size="sm" variant="secondary" icon={XCircle}      onClick={onDeactivate}>Desactivar</Button>
        <Button size="sm" variant="secondary" icon={FolderInput}  onClick={onChangeCategory}>Cambiar categoría</Button>
        <Button size="sm" variant="secondary" icon={Download}     onClick={onExport}>Exportar</Button>
        <Button size="sm" variant="danger"    icon={Trash2}       onClick={onDelete}>Eliminar</Button>

        <IconButton icon={X} label="Cancelar selección" onClick={onClear} />
      </div>
    </div>
  )
}