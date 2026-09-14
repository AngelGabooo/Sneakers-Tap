import { useEffect, useState } from 'react'
import { X, SlidersHorizontal } from 'lucide-react'
import Button from '../common/Button'
import TextField from '../common/TextField'
import SelectField from '../common/SelectField'

const MOTIVOS = [
  { value: 'reception',  label: 'Recepción de mercancía' },
  { value: 'physical',   label: 'Conteo físico' },
  { value: 'shrinkage',  label: 'Merma' },
  { value: 'damage',     label: 'Daño' },
  { value: 'correction', label: 'Corrección de inventario' },
  { value: 'return',     label: 'Devolución' },
  { value: 'other',      label: 'Otro' },
]

const TIPOS = [
  { value: 'in',    label: 'Entrada' },
  { value: 'out',   label: 'Salida' },
  { value: 'set',   label: 'Ajuste (establecer)' },
]

export default function InventoryStockAdjustModal({ open, onClose, row, onConfirm }) {
  const [tipo, setTipo] = useState('in')
  const [cantidad, setCantidad] = useState('')
  const [motivo, setMotivo] = useState('reception')
  const [notas, setNotas] = useState('')

  // Reset al abrir con una nueva fila
  useEffect(() => {
    if (open) {
      setTipo('in')
      setCantidad('')
      setMotivo('reception')
      setNotas('')
    }
  }, [open, row?.id])

  if (!open || !row) return null

  const stockActual = Number(row.stock) || 0
  const cant = Number(cantidad) || 0

  const stockResultante =
    tipo === 'in'  ? stockActual + cant :
    tipo === 'out' ? Math.max(0, stockActual - cant) :
    cant // 'set'

  const handleConfirm = () => {
    if (cant <= 0 && tipo !== 'set') return
    onConfirm?.({
      rowId: row.id,
      productId: row.productId,
      variantId: row.variantId,
      tipo,
      cantidad: cant,
      motivo,
      notas,
      stockAnterior: stockActual,
      stockResultante,
    })
    onClose?.()
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-xl overflow-hidden bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-cardHover">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-dark-border shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-brand-blue" strokeWidth={2} />
            <h3 className="text-sm font-semibold text-brand-black dark:text-dark-text">
              Ajustar inventario
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
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Contexto */}
          <div className="rounded-lg border border-gray-100 dark:border-dark-border p-3 space-y-1.5">
            <p className="text-xs text-gray-500 dark:text-dark-muted">Producto</p>
            <p className="text-sm font-semibold text-brand-black dark:text-dark-text">
              {row.productName}
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-dark-muted">
              <span>Variante: <strong className="text-brand-black dark:text-dark-text">{row.label}</strong></span>
              <span>·</span>
              <span>SKU: <span className="font-mono">{row.sku}</span></span>
            </div>
            <div className="pt-2 mt-2 border-t border-gray-100 dark:border-dark-border text-xs">
              <span className="text-gray-500 dark:text-dark-muted">Stock actual: </span>
              <span className="font-semibold text-brand-black dark:text-dark-text">{stockActual}</span>
            </div>
          </div>

          {/* Tipo */}
          <SelectField
            id="tipo"
            label="Tipo de movimiento"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            options={TIPOS}
          />

          {/* Cantidad */}
          <TextField
            id="cantidad"
            label={tipo === 'set' ? 'Nuevo stock' : 'Cantidad'}
            type="number"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            placeholder="0"
          />

          {/* Motivo */}
          <SelectField
            id="motivo"
            label="Motivo"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            options={MOTIVOS}
          />

          {/* Notas */}
          <div>
            <label htmlFor="notas" className="block text-sm font-medium text-brand-black dark:text-dark-text mb-1.5">
              Notas <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              id="notas"
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Detalles adicionales del ajuste..."
              className="
                w-full rounded-lg text-sm p-3 resize-none
                bg-white dark:bg-dark-card text-brand-black dark:text-dark-text
                border border-gray-200 dark:border-dark-border
                focus:border-brand-blue focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40
                outline-none
              "
            />
          </div>

          {/* Preview del resultado */}
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 p-3">
            <p className="text-xs text-brand-blue dark:text-blue-300">
              Stock resultante:{' '}
              <span className="font-semibold">{stockResultante} unidades</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-dark-border shrink-0">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleConfirm}>Guardar ajuste</Button>
        </div>
      </div>
    </div>
  )
}