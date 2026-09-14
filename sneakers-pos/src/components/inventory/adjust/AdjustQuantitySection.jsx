import { useState } from 'react'
import { Calculator, Info } from 'lucide-react'
import Card from '../../common/Card'
import TextField from '../../common/TextField'

/**
 * Sección de cantidad / nueva existencia.
 * Cambia su UI según el tipo de movimiento.
 */
export default function AdjustQuantitySection({
  type,
  stock,
  quantity,
  adjustMode, // 'new' | 'diff'
  onChangeQuantity,
  onChangeAdjustMode,
  error,
}) {
  return (
    <Card>
      <header className="mb-4">
        <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
          Cantidad
        </h2>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          {type === 'in' && '¿Cuántas unidades vas a ingresar?'}
          {type === 'out' && '¿Cuántas unidades vas a retirar?'}
          {type === 'adjust' && '¿Cómo quieres corregir el stock?'}
        </p>
      </header>

      {type === 'adjust' && (
        <div className="flex items-center gap-2 mb-4">
          <button
            type="button"
            onClick={() => onChangeAdjustMode?.('new')}
            className={`
              h-9 px-3 rounded-lg text-sm font-medium border transition-colors
              ${adjustMode === 'new'
                ? 'bg-brand-blue text-white border-brand-blue'
                : 'bg-white dark:bg-dark-card text-gray-700 dark:text-dark-muted border-gray-200 dark:border-dark-border hover:border-brand-blue hover:text-brand-blue'}
            `}
          >
            Nueva existencia
          </button>
          <button
            type="button"
            onClick={() => onChangeAdjustMode?.('diff')}
            className={`
              h-9 px-3 rounded-lg text-sm font-medium border transition-colors
              ${adjustMode === 'diff'
                ? 'bg-brand-blue text-white border-brand-blue'
                : 'bg-white dark:bg-dark-card text-gray-700 dark:text-dark-muted border-gray-200 dark:border-dark-border hover:border-brand-blue hover:text-brand-blue'}
            `}
          >
            Diferencia
          </button>
        </div>
      )}

      <TextField
        id="quantity"
        label={
          type === 'in' ? 'Cantidad a ingresar'
          : type === 'out' ? 'Cantidad a retirar'
          : adjustMode === 'new' ? 'Nueva existencia'
          : 'Diferencia'
        }
        type="number"
        value={quantity}
        onChange={(e) => onChangeQuantity?.(e.target.value)}
        placeholder={type === 'out' ? 'Ej. 1' : 'Ej. 10'}
        error={error}
        icon={Calculator}
      />

      {/* Preview del resultado */}
      <ResultPreview type={type} stock={stock} quantity={quantity} adjustMode={adjustMode} />

      {type === 'out' && Number(quantity) > Number(stock) && (
        <div className="
          flex items-start gap-2 mt-3 p-2.5 rounded-lg
          bg-red-50 dark:bg-red-950/30
          border border-red-200 dark:border-red-900/50
          text-brand-red text-xs
        ">
          <Info size={13} strokeWidth={2.2} className="mt-0.5 shrink-0" />
          <span>No puedes retirar más unidades que el stock disponible.</span>
        </div>
      )}
    </Card>
  )
}

function ResultPreview({ type, stock, quantity, adjustMode }) {
  const s = Number(stock) || 0
  const q = Number(quantity) || 0

  let delta = 0
  if (type === 'in') delta = q
  else if (type === 'out') delta = -q
  else if (type === 'adjust') {
    delta = adjustMode === 'new' ? q - s : q
  }

  const next = Math.max(0, s + delta)

  return (
    <div className="mt-4 rounded-lg border border-gray-100 dark:border-dark-border p-3">
      <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-dark-muted mb-2">
        Vista previa
      </p>
      <div className="flex items-center justify-between">
        <MiniStat label="Stock actual" value={s} />
        <Arrow />
        <MiniStat
          label="Movimiento"
          value={`${delta >= 0 ? '+' : ''}${delta}`}
          tone={delta > 0 ? 'success' : delta < 0 ? 'danger' : 'neutral'}
        />
        <Arrow />
        <MiniStat label="Nuevo stock" value={next} emphasis />
      </div>
    </div>
  )
}

function MiniStat({ label, value, tone = 'neutral', emphasis = false }) {
  const tones = {
    success: 'text-emerald-600 dark:text-emerald-400',
    danger:  'text-brand-red',
    neutral: 'text-brand-black dark:text-dark-text',
  }
  return (
    <div className="text-center">
      <p className="text-[11px] text-gray-500 dark:text-dark-muted">{label}</p>
      <p className={`${emphasis ? 'text-lg font-bold' : 'text-sm font-semibold'} ${tones[tone]} mt-0.5`}>
        {value}
      </p>
    </div>
  )
}

function Arrow() {
  return <span className="text-gray-300 dark:text-dark-muted text-lg">→</span>
}