import { useEffect, useState } from 'react'
import { X, ShoppingBag } from 'lucide-react'
import Button from '../../common/Button'

export default function AlertsReponerModal({ open, alert, onClose, onConfirm }) {
  const [quantity, setQuantity] = useState('')

  useEffect(() => {
    if (open && alert) {
      setQuantity(String(alert.restockSuggested || ''))
    }
  }, [open, alert])

  if (!open || !alert) return null

  const qty = Number(quantity) || 0
  const unitPrice = Number(alert.purchasePrice) || 0
  const total = qty * unitPrice

  const handleConfirm = () => {
    if (qty <= 0) return
    onConfirm?.({ ...alert, restockQuantity: qty, restockCost: total })
    onClose?.()
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl overflow-hidden bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-cardHover">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-dark-border">
          <div className="flex items-center gap-2">
            <ShoppingBag size={16} className="text-brand-blue" strokeWidth={2} />
            <h3 className="text-sm font-semibold text-brand-black dark:text-dark-text">
              Preparar reposición
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

        <div className="p-5 space-y-4">
          <div>
            <p className="text-sm font-semibold text-brand-black dark:text-dark-text">
              {alert.productName}
            </p>
            <p className="text-xs text-gray-500 dark:text-dark-muted mt-0.5">
              {alert.label} · {alert.sku}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <Stat label="Stock" value={alert.stock} />
            <Stat label="Mínimo" value={alert.minStock} />
            <Stat label="Sugerido" value={alert.restockSuggested} emphasis />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-black dark:text-dark-text mb-1.5">
              Cantidad a reponer
            </label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full h-11 px-3 rounded-lg text-sm bg-white dark:bg-dark-card text-brand-black dark:text-dark-text border border-gray-200 dark:border-dark-border focus:border-brand-blue focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 outline-none"
            />
          </div>

          {alert.supplier && (
            <div className="rounded-lg border border-gray-100 dark:border-dark-border p-3 text-sm">
              <p className="text-xs text-gray-500 dark:text-dark-muted">Proveedor</p>
              <p className="font-medium text-brand-black dark:text-dark-text">{alert.supplier}</p>
              {unitPrice > 0 && (
                <p className="text-xs text-gray-500 dark:text-dark-muted mt-1">
                  ${unitPrice.toLocaleString('es-MX')} / unidad
                </p>
              )}
            </div>
          )}

          {total > 0 && (
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 p-3">
              <p className="text-xs text-brand-blue dark:text-blue-300">
                Costo estimado:{' '}
                <span className="font-semibold">${total.toLocaleString('es-MX')}</span>
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-dark-border">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleConfirm} disabled={qty <= 0}>
            Agregar a compra
          </Button>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, emphasis = false }) {
  return (
    <div className="rounded-lg border border-gray-100 dark:border-dark-border p-3 text-center">
      <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 dark:text-dark-muted">
        {label}
      </p>
      <p className={`${emphasis ? 'text-xl font-bold text-brand-blue' : 'text-lg font-semibold text-brand-black dark:text-dark-text'} mt-0.5`}>
        {value}
      </p>
    </div>
  )
}