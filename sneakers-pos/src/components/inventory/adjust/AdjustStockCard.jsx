import { Boxes, AlertTriangle, PackageX, CheckCircle2 } from 'lucide-react'
import Card from '../../common/Card'
import Badge from '../../common/Badge'

function getState(stock, minStock) {
  if (stock === 0) return { label: 'Agotado', variant: 'danger', icon: PackageX, tone: 'danger' }
  if (stock <= minStock) return { label: 'Stock bajo', variant: 'warning', icon: AlertTriangle, tone: 'warning' }
  return { label: 'Stock saludable', variant: 'success', icon: CheckCircle2, tone: 'success' }
}

export default function AdjustStockCard({ variant, minStock = 3, reserved = 0 }) {
  if (!variant) return null

  const stock = Number(variant.stock) || 0
  const available = Math.max(0, stock - reserved)
  const state = getState(stock, minStock)

  const tones = {
    success: { wrap: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300', icon: 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400' },
    warning: { wrap: 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300', icon: 'bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400' },
    danger:  { wrap: 'bg-red-50 dark:bg-red-950/30 text-brand-red', icon: 'bg-red-100 dark:bg-red-950/50 text-brand-red' },
  }
  const tone = tones[state.tone]
  const Icon = state.icon

  return (
    <Card>
      <header className="flex items-start justify-between gap-3 mb-4">
        <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
          Stock actual
        </h2>
        <Badge variant={state.variant}>{state.label}</Badge>
      </header>

      <div className={`rounded-lg p-4 mb-4 ${tone.wrap}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${tone.icon}`}>
            <Icon size={18} strokeWidth={2} />
          </div>
          <div>
            <p className="text-2xl font-bold leading-none">{stock}</p>
            <p className="text-xs opacity-80 mt-1">unidades en existencia</p>
          </div>
        </div>
      </div>

      <ul className="space-y-2 text-sm">
        <Row icon={Boxes}         label="Disponible" value={available} />
        <Row icon={Boxes}         label="Reservado"  value={reserved} />
        <Row icon={AlertTriangle} label="Mínimo"     value={minStock} />
        <Row icon={Boxes}         label="SKU"        value={variant.sku || '—'} mono />
      </ul>
    </Card>
  )
}

function Row({ icon: Icon, label, value, mono = false }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-gray-500 dark:text-dark-muted">
        <Icon size={13} strokeWidth={2} />
        {label}
      </span>
      <span className={`font-medium text-brand-black dark:text-dark-text ${mono ? 'font-mono text-xs' : ''}`}>
        {value}
      </span>
    </li>
  )
}