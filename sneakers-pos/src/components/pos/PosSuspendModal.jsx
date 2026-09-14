import { useEffect, useState } from 'react'
import { X, Save } from 'lucide-react'
import Button from '../common/Button'

export default function PosSuspendModal({ open, onClose, onConfirm }) {
  const [reference, setReference] = useState('')

  useEffect(() => {
    if (open) setReference('')
  }, [open])

  if (!open) return null

  const handleConfirm = () => {
    onConfirm?.({ reference: reference.trim() || 'Venta suspendida' })
    onClose?.()
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-xl overflow-hidden bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-cardHover">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-dark-border">
          <div className="flex items-center gap-2">
            <Save size={15} className="text-brand-blue" strokeWidth={2} />
            <h3 className="text-sm font-semibold text-brand-black dark:text-dark-text">
              Suspender esta venta
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

        <div className="p-5">
          <label className="block text-sm font-medium text-brand-black dark:text-dark-text mb-1.5">
            Nombre o referencia <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Ej. Cliente probándose productos"
            className="w-full h-11 px-3 rounded-lg text-sm bg-white dark:bg-dark-card text-brand-black dark:text-dark-text border border-gray-200 dark:border-dark-border focus:border-brand-blue focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 outline-none"
          />
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-dark-border">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleConfirm}>Suspender venta</Button>
        </div>
      </div>
    </div>
  )
}