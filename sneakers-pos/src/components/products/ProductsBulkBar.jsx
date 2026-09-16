// src/components/products/ProductsBulkBar.jsx
import {
  CheckCircle2, XCircle, FolderInput, Download, Trash2, X,
} from 'lucide-react'
import Button from '../common/Button'

export default function ProductsBulkBar({
  count,
  onClear,
  onActivate,
  onDeactivate,
  onChangeCategory,
  onExport,
  onDelete,
}) {
  if (!count) return null

  return (
    <div className="
      fixed bottom-6 left-1/2 -translate-x-1/2 z-50
      max-w-[calc(100vw-2rem)]
      flex flex-wrap items-center gap-3
      px-4 py-3
      bg-brand-black dark:bg-dark-card
      border border-gray-800 dark:border-dark-border
      rounded-2xl shadow-2xl shadow-black/30
      animate-in slide-in-from-bottom duration-200
    ">
      {/* Contador */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="
          w-7 h-7 rounded-full bg-brand-blue text-white
          flex items-center justify-center
          text-xs font-bold
        ">
          {count}
        </div>
        <span className="text-sm font-semibold text-white whitespace-nowrap">
          {count === 1 ? 'producto' : 'productos'}
        </span>
      </div>

      {/* Separador */}
      <div className="hidden sm:block w-px h-6 bg-white/20" />

      {/* Acciones */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={onActivate}
          className="
            inline-flex items-center gap-1.5 h-8 px-3 rounded-lg
            text-xs font-semibold text-white
            bg-white/10 hover:bg-emerald-500
            transition-colors
          "
        >
          <CheckCircle2 size={13} />
          Activar
        </button>

        <button
          type="button"
          onClick={onDeactivate}
          className="
            inline-flex items-center gap-1.5 h-8 px-3 rounded-lg
            text-xs font-semibold text-white
            bg-white/10 hover:bg-amber-500
            transition-colors
          "
        >
          <XCircle size={13} />
          Desactivar
        </button>

        <button
          type="button"
          onClick={onChangeCategory}
          className="
            hidden sm:inline-flex items-center gap-1.5 h-8 px-3 rounded-lg
            text-xs font-semibold text-white
            bg-white/10 hover:bg-blue-500
            transition-colors
          "
        >
          <FolderInput size={13} />
          Categoría
        </button>

        <button
          type="button"
          onClick={onExport}
          className="
            hidden sm:inline-flex items-center gap-1.5 h-8 px-3 rounded-lg
            text-xs font-semibold text-white
            bg-white/10 hover:bg-gray-600
            transition-colors
          "
        >
          <Download size={13} />
          Exportar
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="
            inline-flex items-center gap-1.5 h-8 px-3 rounded-lg
            text-xs font-semibold text-white
            bg-red-500/20 hover:bg-brand-red
            transition-colors
          "
        >
          <Trash2 size={13} />
          Eliminar
        </button>
      </div>

      {/* Separador */}
      <div className="w-px h-6 bg-white/20" />

      {/* Cerrar */}
      <button
        type="button"
        onClick={onClear}
        className="
          p-1.5 rounded-lg text-white/60 hover:text-white
          hover:bg-white/10 transition-colors
        "
        aria-label="Cancelar selección"
        title="Cancelar selección"
      >
        <X size={15} />
      </button>
    </div>
  )
}