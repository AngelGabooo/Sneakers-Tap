import { X, Package, History, User, ShoppingBag, SlidersHorizontal, ExternalLink } from 'lucide-react'
import Button from '../../common/Button'
import Badge from '../../common/Badge'

const URGENCY = {
  critical: { label: 'Crítica', variant: 'danger' },
  high:     { label: 'Alta',    variant: 'danger' },
  medium:   { label: 'Media',   variant: 'warning' },
  soon:     { label: 'Por agotarse', variant: 'info' },
}

export default function AlertsDetailDrawer({ open, alert, onClose, onViewProduct, onViewMovements, onAdjustStock, onCreatePurchase }) {
  if (!open || !alert) return null

  const urg = URGENCY[alert.urgency] || URGENCY.medium

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg h-full flex flex-col bg-white dark:bg-dark-card border-l border-gray-200 dark:border-dark-border shadow-cardHover overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-dark-border shrink-0">
          <div className="flex items-center gap-2">
            <Package size={16} className="text-brand-blue" strokeWidth={2} />
            <h3 className="text-sm font-semibold text-brand-black dark:text-dark-text">
              Alerta de stock
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

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div>
            <p className="text-lg font-bold text-brand-black dark:text-dark-text">
              {alert.productName}
            </p>
            <p className="text-sm text-gray-600 dark:text-dark-muted mt-0.5">
              {alert.label} · {alert.sku}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={urg.variant}>{urg.label}</Badge>
              <Badge variant={alert.state === 'out' ? 'danger' : 'warning'}>
                {alert.state === 'out' ? 'Agotado' : 'Stock bajo'}
              </Badge>
            </div>
          </div>

          <div className="rounded-lg border border-gray-100 dark:border-dark-border p-4">
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-dark-muted mb-2">
              Inventario
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Field label="Stock actual" value={alert.stock} />
              <Field label="Mínimo"       value={alert.minStock} />
              <Field label="Faltante"     value={alert.missing} tone="danger" />
              <Field label="Reposición sugerida" value={alert.restockSuggested} emphasis />
            </div>
          </div>

          {alert.supplier && (
            <div className="rounded-lg border border-gray-100 dark:border-dark-border p-4">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-dark-muted mb-2 flex items-center gap-1.5">
                <User size={12} strokeWidth={2} /> Proveedor
              </p>
              <p className="text-sm font-medium text-brand-black dark:text-dark-text">
                {alert.supplier}
              </p>
              {alert.purchasePrice && (
                <p className="text-xs text-gray-500 dark:text-dark-muted mt-1">
                  Precio de compra: ${Number(alert.purchasePrice).toLocaleString('es-MX')}
                </p>
              )}
            </div>
          )}

          <div className="rounded-lg border border-gray-100 dark:border-dark-border p-4">
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-dark-muted mb-2 flex items-center gap-1.5">
              <History size={12} strokeWidth={2} /> Historial reciente
            </p>
            <p className="text-sm text-gray-500 dark:text-dark-muted">
              Sin movimientos recientes registrados.
            </p>
            <button
              onClick={() => onViewMovements?.(alert)}
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-blue hover:underline"
            >
              <ExternalLink size={11} strokeWidth={2.2} />
              Ver todos los movimientos
            </button>
          </div>
        </div>

        <div className="flex justify-between gap-2 px-5 py-4 border-t border-gray-100 dark:border-dark-border shrink-0">
          <Button variant="secondary" icon={SlidersHorizontal} onClick={() => onAdjustStock?.(alert)}>
            Ajustar
          </Button>
          <Button variant="primary" icon={ShoppingBag} onClick={() => onCreatePurchase?.(alert)}>
            Crear compra
          </Button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, tone = 'neutral', emphasis = false }) {
  const tones = {
    danger: 'text-brand-red',
    neutral: 'text-brand-black dark:text-dark-text',
  }
  return (
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 dark:text-dark-muted">
        {label}
      </p>
      <p className={`${emphasis ? 'text-lg font-bold' : 'text-sm font-semibold'} ${tones[tone]} mt-0.5`}>
        {value}
      </p>
    </div>
  )
}