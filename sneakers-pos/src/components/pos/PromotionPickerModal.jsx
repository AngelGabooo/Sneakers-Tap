// src/components/pos/PromotionPickerModal.jsx
import { useEffect, useMemo, useState } from 'react'
import { X, Tag, Check } from 'lucide-react'
import Button from '../common/Button'
import { findApplicablePromotions } from '../../context/PromotionsContext'

const fmt = (n) => `$${Number(n || 0).toLocaleString('es-MX')}`

export default function PromotionPickerModal({
  open,
  items = [],
  promotions = [],
  customer = null,
  onClose,
  onApply,     // (promotionId | null) => void
  currentPromotionId = null,
  submitting = false,
}) {
  const [selected, setSelected] = useState(currentPromotionId)

  useEffect(() => {
    if (open) setSelected(currentPromotionId)
  }, [open, currentPromotionId])

  const applicable = useMemo(
    () => findApplicablePromotions(items, promotions, customer),
    [items, promotions, customer],
  )

  if (!open) return null

  const handleConfirm = () => {
    onApply?.(selected)
  }

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-xl overflow-hidden bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-dark-border">
          <div className="flex items-center gap-2">
            <Tag size={16} className="text-brand-blue" strokeWidth={2} />
            <h3 className="text-sm font-semibold text-brand-black dark:text-dark-text">
              Aplicar promoción
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-gray-400 hover:text-brand-black dark:hover:text-dark-text transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {applicable.length === 0 ? (
            <div className="text-center py-8">
              <Tag size={28} className="mx-auto mb-3 text-gray-300" strokeWidth={1.5} />
              <p className="text-sm font-semibold text-brand-black dark:text-dark-text">
                Sin promociones aplicables
              </p>
              <p className="text-xs text-gray-500 dark:text-dark-muted mt-1">
                Ningún producto del carrito califica para las promos activas.
              </p>
            </div>
          ) : (
            <>
              {/* Opción "sin promo" */}
              <button
                type="button"
                onClick={() => setSelected(null)}
                className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${
                  selected === null
                    ? 'border-brand-blue bg-blue-50 dark:bg-blue-950/30'
                    : 'border-gray-200 dark:border-dark-border hover:border-brand-blue'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                  selected === null ? 'border-brand-blue bg-brand-blue' : 'border-gray-300 dark:border-dark-border'
                }`}>
                  {selected === null && <Check size={11} className="text-white" strokeWidth={3} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-brand-black dark:text-dark-text">
                    Sin promoción
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-dark-muted">
                    Cobrar precio normal
                  </p>
                </div>
              </button>

              {/* Promos aplicables */}
              {applicable.map(({ promotion, discount, detail }) => {
                const isSelected = selected === promotion.id
                return (
                  <button
                    key={promotion.id}
                    type="button"
                    onClick={() => setSelected(promotion.id)}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${
                      isSelected
                        ? 'border-brand-blue bg-blue-50 dark:bg-blue-950/30'
                        : 'border-gray-200 dark:border-dark-border hover:border-brand-blue'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected ? 'border-brand-blue bg-brand-blue' : 'border-gray-300 dark:border-dark-border'
                    }`}>
                      {isSelected && <Check size={11} className="text-white" strokeWidth={3} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center justify-center h-6 min-w-[40px] px-2 rounded-md bg-brand-blue text-white text-xs font-bold">
                          {promotion.buy_qty}x{promotion.pay_qty}
                        </span>
                        <p className="text-sm font-semibold text-brand-black dark:text-dark-text">
                          {promotion.name}
                        </p>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-dark-muted mt-1">
                        Aplica a {detail.eligibleCount} {detail.eligibleCount === 1 ? 'unidad' : 'unidades'} · {detail.groups} {detail.groups === 1 ? 'grupo' : 'grupos'}
                      </p>
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                        Ahorro: {fmt(discount)}
                      </p>
                    </div>
                  </button>
                )
              })}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-dark-border">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={submitting || applicable.length === 0}
          >
            {selected ? 'Aplicar promoción' : 'Sin promoción'}
          </Button>
        </div>
      </div>
    </div>
  )
}