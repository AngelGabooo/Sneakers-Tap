import { Package, MapPin, AlertTriangle, PackageX, CheckCircle2 } from 'lucide-react'
import Card from '../../common/Card'
import Badge from '../../common/Badge'

function getState(stock, minStock) {
  if (stock === 0) return { label: 'Agotado', variant: 'danger', icon: PackageX }
  if (stock <= minStock) return { label: 'Stock bajo', variant: 'warning', icon: AlertTriangle }
  return { label: 'Stock saludable', variant: 'success', icon: CheckCircle2 }
}

export default function AdjustSummaryPanel({
  product, variant, location,
  type, quantity, adjustMode,
  minStock = 3,
}) {
  if (!product || !variant) {
    return (
      <Card>
        <h3 className="text-base font-semibold text-brand-black dark:text-dark-text mb-2">
          Resumen del ajuste
        </h3>
        <p className="text-sm text-gray-500 dark:text-dark-muted">
          Selecciona un producto y una variante para ver el resumen.
        </p>
      </Card>
    )
  }

  const stock = Number(variant.stock) || 0
  const q = Number(quantity) || 0

  let delta = 0
  if (type === 'in') delta = q
  else if (type === 'out') delta = -q
  else if (type === 'adjust') delta = adjustMode === 'new' ? q - stock : q

  const next = Math.max(0, stock + delta)
  const state = getState(next, minStock)

  const warning =
    next === 0
      ? { text: 'Este ajuste dejará la variante agotada.', tone: 'danger' }
      : next < minStock
        ? { text: `Este ajuste dejará el producto con stock bajo. El nuevo stock será ${next} y el mínimo es ${minStock}.`, tone: 'warning' }
        : null

  return (
    <Card>
      <h3 className="text-base font-semibold text-brand-black dark:text-dark-text mb-4">
        Resumen del ajuste
      </h3>

      <div className="space-y-2 pb-4 border-b border-gray-100 dark:border-dark-border">
        <Row label="Producto"  value={product.name} />
        <Row label="Variante"  value={variant.label} />
        <Row label="SKU"       value={variant.sku || product.sku || '—'} mono />
        {location && <Row label="Ubicación" value={location} />}
      </div>

      <div className="py-4 border-b border-gray-100 dark:border-dark-border">
        <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-dark-muted mb-3">
          Cambio de inventario
        </p>
        <div className="flex items-center justify-between">
          <StepBox label="Actual" value={stock} />
          <span className="text-gray-300 dark:text-dark-muted text-lg">→</span>
          <StepBox
            label="Movimiento"
            value={`${delta >= 0 ? '+' : ''}${delta}`}
            tone={delta > 0 ? 'success' : delta < 0 ? 'danger' : 'neutral'}
          />
          <span className="text-gray-300 dark:text-dark-muted text-lg">→</span>
          <StepBox label="Nuevo" value={next} emphasis />
        </div>
      </div>

      <div className="py-4 border-b border-gray-100 dark:border-dark-border">
        <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-dark-muted mb-2">
          Estado después del ajuste
        </p>
        <Badge variant={state.variant}>{state.label}</Badge>
      </div>

      {warning && (
        <div className={`
          mt-4 flex items-start gap-2 p-2.5 rounded-lg text-xs
          ${warning.tone === 'danger'
            ? 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-brand-red'
            : 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300'}
        `}>
          <AlertTriangle size={13} strokeWidth={2.2} className="mt-0.5 shrink-0" />
          <span>{warning.text}</span>
        </div>
      )}
    </Card>
  )
}

function Row({ label, value, mono = false }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-gray-500 dark:text-dark-muted shrink-0">{label}</span>
      <span className={`font-medium text-brand-black dark:text-dark-text text-right truncate ${mono ? 'font-mono text-xs' : ''}`}>
        {value}
      </span>
    </div>
  )
}

function StepBox({ label, value, tone = 'neutral', emphasis = false }) {
  const tones = {
    success: 'text-emerald-600 dark:text-emerald-400',
    danger:  'text-brand-red',
    neutral: 'text-brand-black dark:text-dark-text',
  }
  return (
    <div className="text-center min-w-0">
      <p className="text-[11px] text-gray-500 dark:text-dark-muted">{label}</p>
      <p className={`${emphasis ? 'text-2xl font-bold' : 'text-lg font-semibold'} ${tones[tone]} mt-0.5`}>
        {value}
      </p>
    </div>
  )
}