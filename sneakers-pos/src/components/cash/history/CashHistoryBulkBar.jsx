import { Download, X } from 'lucide-react'
import Button from '../../common/Button'
import IconButton from '../../common/IconButton'

export default function CashHistoryBulkBar({ count, onClear, onExport }) {
  if (!count) return null

  return (
    <div className="
      flex flex-wrap items-center gap-2 mb-3 px-3 py-2 rounded-lg
      bg-blue-50 dark:bg-blue-950/30
      border border-blue-100 dark:border-blue-900/50
    ">
      <span className="text-sm font-medium text-brand-blue dark:text-blue-300">
        {count} {count === 1 ? 'sesión seleccionada' : 'sesiones seleccionadas'}
      </span>

      <div className="flex flex-wrap items-center gap-2 ml-auto">
        <Button size="sm" variant="secondary" icon={Download} onClick={onExport}>
          Exportar
        </Button>
        <IconButton icon={X} label="Cancelar selección" onClick={onClear} />
      </div>
    </div>
  )
}