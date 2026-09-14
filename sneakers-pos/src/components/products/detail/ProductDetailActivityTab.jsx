import { useMemo } from 'react'
import {
  Activity, ArrowDownToLine, ArrowUpFromLine, SlidersHorizontal,
  RotateCcw, AlertTriangle, ArrowLeftRight, ExternalLink,
} from 'lucide-react'
import Card from '../../common/Card'
import Button from '../../common/Button'
import EmptyState from '../../common/EmptyState'
import Badge from '../../common/Badge'
import { useMovements } from '../../../context/MovementsContext'

const TYPE_META = {
  in:       { label: 'Entrada',    icon: ArrowDownToLine, variant: 'success', color: 'text-emerald-600 dark:text-emerald-400' },
  out:      { label: 'Salida',     icon: ArrowUpFromLine, variant: 'danger',  color: 'text-brand-red' },
  adjust:   { label: 'Ajuste',     icon: SlidersHorizontal, variant: 'info',  color: 'text-brand-blue' },
  return:   { label: 'Devolución', icon: RotateCcw,       variant: 'info',    color: 'text-brand-blue' },
  loss:     { label: 'Merma',      icon: AlertTriangle,   variant: 'danger',  color: 'text-brand-red' },
  damage:   { label: 'Daño',       icon: AlertTriangle,   variant: 'danger',  color: 'text-brand-red' },
  transfer: { label: 'Transfer.',  icon: ArrowLeftRight,  variant: 'info',    color: 'text-brand-blue' },
}

const REASON_LABELS = {
  reception: 'Recepción de mercancía',
  sale: 'Venta',
  return: 'Devolución',
  physical: 'Conteo físico',
  shrinkage: 'Merma',
  damage: 'Daño',
  correction: 'Corrección',
  transfer: 'Transferencia',
  other: 'Otro',
}

function formatRelative(iso) {
  if (!iso) return ''
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'Hace unos segundos'
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`
  if (diff < 604800) return `Hace ${Math.floor(diff / 86400)} d`
  return ''
}

export default function ProductDetailActivityTab({ productId, onViewAllMovements }) {
  const { movements } = useMovements()

  // Filtra los movimientos del producto
  const productMovements = useMemo(
    () => movements.filter((m) => m.productId === productId).slice(0, 10),
    [movements, productId],
  )

  const hasMovements = productMovements.length > 0

  return (
    <Card>
      <header className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
            Actividad reciente
          </h2>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
            Últimos movimientos de inventario del producto.
          </p>
        </div>
        {hasMovements && (
          <button
            onClick={onViewAllMovements}
            className="inline-flex items-center gap-1 text-xs font-medium text-brand-blue hover:underline shrink-0"
          >
            <ExternalLink size={12} strokeWidth={2.2} />
            Ver historial completo
          </button>
        )}
      </header>

      {!hasMovements ? (
        <EmptyState
          icon={Activity}
          title="Sin actividad reciente"
          description="Los ajustes de inventario, compras y ventas aparecerán aquí."
          action={
            onViewAllMovements && (
              <Button variant="secondary" size="sm" onClick={onViewAllMovements}>
                Ver movimientos
              </Button>
            )
          }
        />
      ) : (
        <ul className="space-y-4">
          {productMovements.map((m) => {
            const meta = TYPE_META[m.type] || TYPE_META.adjust
            const Icon = meta.icon
            const isPositive = Number(m.quantity) > 0
            return (
              <li key={m.id} className="flex items-start gap-3">
                <div className={`
                  w-9 h-9 rounded-lg flex items-center justify-center shrink-0
                  bg-gray-50 dark:bg-dark-surface
                `}>
                  <Icon size={16} className={meta.color} strokeWidth={2} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={meta.variant}>{meta.label}</Badge>
                    <span className={`text-sm font-semibold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-brand-red'}`}>
                      {isPositive ? '+' : ''}{m.quantity}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-dark-muted">
                      {m.stockBefore} → {m.stockAfter}
                    </span>
                  </div>

                  <p className="text-sm text-brand-black dark:text-dark-text mt-1">
                    <span className="font-medium">{m.variantLabel}</span>
                    {' · '}
                    <span className="text-gray-600 dark:text-dark-muted">
                      {REASON_LABELS[m.reason] || m.reason || '—'}
                    </span>
                  </p>

                  <p className="text-xs text-gray-500 dark:text-dark-muted mt-0.5">
                    {m.userName}
                    {' · '}
                    {new Date(m.createdAt).toLocaleString('es-MX', {
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                    {formatRelative(m.createdAt) && ` · ${formatRelative(m.createdAt)}`}
                  </p>

                  {m.note && (
                    <p className="text-xs text-gray-500 dark:text-dark-muted mt-1 italic">
                      "{m.note}"
                    </p>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}