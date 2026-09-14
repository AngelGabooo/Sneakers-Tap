import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import Button from '../../common/Button'
import Checkbox from '../../common/Checkbox'

export default function VariantsStockActionsModal({
  open,
  onClose,
  variants = [],
  onConfirm,
}) {
  const [mode, setMode] = useState('add') // 'add' | 'set'
  const [quantities, setQuantities] = useState({}) // { [variantId]: number }

  if (!open) return null

  const handleChange = (id, value) => {
    setQuantities((q) => ({ ...q, [id]: value }))
  }

  const handleApplyToAll = (value) => {
    const v = value
    const next = {}
    variants.forEach((variant) => { next[variant.id] = v })
    setQuantities(next)
  }

  const handleConfirm = () => {
    const updates = Object.entries(quantities)
      .filter(([, q]) => Number(q) > 0 || mode === 'set')
      .map(([id, q]) => ({
        id,
        mode,
        quantity: Number(q) || 0,
      }))
    onConfirm?.(updates)
    setQuantities({})
    onClose?.()
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl overflow-hidden bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-cardHover">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-dark-border shrink-0">
          <div className="flex items-center gap-2">
            <Plus size={16} className="text-brand-blue" strokeWidth={2} />
            <h3 className="text-sm font-semibold text-brand-black dark:text-dark-text">
              Ajustar stock
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-brand-black dark:hover:text-dark-text transition-colors"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modo */}
        <div className="px-5 py-3 border-b border-gray-100 dark:border-dark-border flex flex-wrap items-center gap-3">
          <span className="text-xs text-gray-500 dark:text-dark-muted">Modo:</span>
          <div className="inline-flex rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card p-0.5">
            <button
              onClick={() => setMode('add')}
              className={`h-8 px-3 rounded-md text-xs font-medium transition-colors ${mode === 'add' ? 'bg-brand-blue text-white' : 'text-gray-600 dark:text-dark-muted hover:text-brand-blue'}`}
            >
              Sumar al stock
            </button>
            <button
              onClick={() => setMode('set')}
              className={`h-8 px-3 rounded-md text-xs font-medium transition-colors ${mode === 'set' ? 'bg-brand-blue text-white' : 'text-gray-600 dark:text-dark-muted hover:text-brand-blue'}`}
            >
              Establecer stock
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <input
              type="number"
              min={1}
              placeholder="Aplicar a todos"
              onChange={(e) => handleApplyToAll(e.target.value)}
              className="w-32 h-8 px-2 rounded-md text-xs bg-white dark:bg-dark-card text-brand-black dark:text-dark-text border border-gray-200 dark:border-dark-border focus:border-brand-blue outline-none"
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2">
          {variants.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-dark-muted text-center py-6">
              No hay variantes.
            </p>
          ) : (
            variants.map((v) => (
              <div
                key={v.id}
                className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 dark:border-dark-border"
              >
                <span className="text-sm font-medium text-brand-black dark:text-dark-text w-32 truncate">
                  {v.label}
                </span>
                <span className="text-xs text-gray-500 dark:text-dark-muted flex-1 truncate font-mono">
                  {v.sku}
                </span>
                <span className="text-xs text-gray-500 dark:text-dark-muted whitespace-nowrap">
                  Actual: {v.stock}
                </span>
                <input
                  type="number"
                  min={0}
                  value={quantities[v.id] ?? ''}
                  onChange={(e) => handleChange(v.id, e.target.value)}
                  placeholder="0"
                  className="w-20 h-8 px-2 rounded-md text-xs text-center font-semibold bg-white dark:bg-dark-card text-brand-black dark:text-dark-text border border-gray-200 dark:border-dark-border focus:border-brand-blue outline-none"
                />
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-dark-border shrink-0">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleConfirm} disabled={variants.length === 0}>
            Aplicar cambios
          </Button>
        </div>
      </div>
    </div>
  )
}