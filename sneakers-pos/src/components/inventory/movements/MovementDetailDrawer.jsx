import { X, ExternalLink, Package, User, FileText } from 'lucide-react'
import Badge from '../../common/Badge'
import Button from '../../common/Button'

const TYPE_META = {
  in:       { label: 'Entrada',    variant: 'success' },
  out:      { label: 'Salida',     variant: 'danger' },
  adjust:   { label: 'Ajuste',     variant: 'info' },
  return:   { label: 'Devolución', variant: 'info' },
  loss:     { label: 'Merma',      variant: 'danger' },
  damage:   { label: 'Daño',       variant: 'danger' },
  transfer: { label: 'Transferencia', variant: 'info' },
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

export default function MovementDetailDrawer({ open, movement, onClose, onViewProduct, onViewDocument }) {
  if (!open || !movement) return null

  const meta = TYPE_META[movement.type] || TYPE_META.adjust

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg h-full flex flex-col bg-white dark:bg-dark-card border-l border-gray-200 dark:border-dark-border shadow-cardHover overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-dark-border shrink-0">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-brand-blue" strokeWidth={2} />
            <h3 className="text-sm font-semibold text-brand-black dark:text-dark-text">
              Detalle del movimiento
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

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Encabezado */}
          <div>
            <p className="text-xs font-mono text-gray-500 dark:text-dark-muted">{movement.id}</p>
            <p className="text-lg font-bold text-brand-black dark:text-dark-text mt-1">
              {movement.productName}
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge variant={meta.variant}>{meta.label}</Badge>
              <span className="text-xs text-gray-500 dark:text-dark-muted">
                {movement.variantLabel}
              </span>
            </div>
          </div>

          {/* Grid de datos */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Fecha" value={new Date(movement.createdAt).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })} />
            <Field label="Ubicación" value={movement.location || '—'} />
            <Field label="SKU" value={movement.sku || '—'} mono />
            <Field label="Talla" value={movement.size || '—'} />
            <Field label="Color" value={movement.color || '—'} />
            <Field label="Motivo" value={REASON_LABELS[movement.reason] || movement.reason || '—'} />
          </div>

          {/* Cambio de stock */}
          <div className="rounded-lg border border-gray-100 dark:border-dark-border p-4">
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-dark-muted mb-2">
              Cambio de stock
            </p>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-[11px] text-gray-500 dark:text-dark-muted">Anterior</p>
                <p className="text-lg font-bold text-brand-black dark:text-dark-text">{movement.stockBefore}</p>
              </div>
              <div className="text-center">
                <p className="text-[11px] text-gray-500 dark:text-dark-muted">Cambio</p>
                <p className={`text-lg font-bold ${Number(movement.quantity) > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-brand-red'}`}>
                  {Number(movement.quantity) > 0 ? '+' : ''}{movement.quantity}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[11px] text-gray-500 dark:text-dark-muted">Resultante</p>
                <p className="text-lg font-bold text-brand-black dark:text-dark-text">{movement.stockAfter}</p>
              </div>
            </div>
          </div>

          {/* Notas */}
          {movement.note && (
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-dark-muted mb-1.5">
                Notas
              </p>
              <p className="text-sm text-brand-black dark:text-dark-text leading-relaxed">
                {movement.note}
              </p>
            </div>
          )}

          {/* Auditoría */}
          <div className="pt-4 border-t border-gray-100 dark:border-dark-border">
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-dark-muted mb-2">
              Registro de auditoría
            </p>
            <ul className="space-y-2">
              <Row icon={User}    label="Creado por" value={`${movement.userName} · ${movement.userRole || ''}`} />
              <Row icon={Package} label="Producto"   value={movement.productName} />
              {movement.documentId && (
                <Row icon={FileText} label="Documento" value={movement.documentId} />
              )}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between gap-2 px-5 py-4 border-t border-gray-100 dark:border-dark-border shrink-0">
          <Button variant="secondary" icon={Package} onClick={() => onViewProduct?.(movement.productId)}>
            Ver producto
          </Button>
          {movement.documentId && (
            <Button variant="primary" icon={ExternalLink} onClick={() => onViewDocument?.(movement)}>
              Ver documento
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, mono = false }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 dark:text-dark-muted">
        {label}
      </p>
      <p className={`text-sm font-medium text-brand-black dark:text-dark-text truncate mt-0.5 ${mono ? 'font-mono text-xs' : ''}`}>
        {value}
      </p>
    </div>
  )
}

function Row({ icon: Icon, label, value }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <Icon size={13} className="text-gray-400 shrink-0" strokeWidth={1.9} />
      <span className="text-gray-500 dark:text-dark-muted">{label}:</span>
      <span className="text-brand-black dark:text-dark-text font-medium truncate">{value}</span>
    </li>
  )
}