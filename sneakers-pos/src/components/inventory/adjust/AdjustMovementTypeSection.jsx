import { ArrowDownToLine, ArrowUpFromLine, SlidersHorizontal } from 'lucide-react'
import Card from '../../common/Card'

const OPTIONS = [
  {
    key: 'in',
    label: 'Entrada',
    description: 'Aumenta las existencias.',
    example: '+10 unidades',
    icon: ArrowDownToLine,
    tone: 'in',
  },
  {
    key: 'out',
    label: 'Salida',
    description: 'Reduce las existencias.',
    example: '-1 unidad',
    icon: ArrowUpFromLine,
    tone: 'out',
  },
  {
    key: 'adjust',
    label: 'Ajuste',
    description: 'Corrige la existencia después de un conteo o revisión.',
    example: '±',
    icon: SlidersHorizontal,
    tone: 'adjust',
  },
]

export default function AdjustMovementTypeSection({ value, onChange, error }) {
  return (
    <Card>
      <header className="mb-4">
        <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
          Tipo de movimiento
        </h2>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Indica cómo debe afectar este registro al inventario.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {OPTIONS.map(({ key, label, description, example, icon: Icon }) => {
          const active = value === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange?.(key)}
              className={`
                flex flex-col items-start gap-2 p-4 rounded-lg border text-left
                transition-colors
                ${active
                  ? 'border-brand-blue bg-blue-50/60 dark:bg-blue-950/30'
                  : 'border-gray-200 dark:border-dark-border hover:border-brand-blue/50'}
              `}
            >
              <div className={`
                w-9 h-9 rounded-lg flex items-center justify-center shrink-0
                ${active
                  ? 'bg-brand-blue text-white'
                  : 'bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-dark-muted'}
              `}>
                <Icon size={17} strokeWidth={2} />
              </div>

              <div className="min-w-0">
                <p className={`text-sm font-semibold ${active ? 'text-brand-blue' : 'text-brand-black dark:text-dark-text'}`}>
                  {label}
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-muted mt-0.5">
                  {description}
                </p>
                <p className={`text-xs font-medium mt-1 ${active ? 'text-brand-blue' : 'text-gray-400 dark:text-dark-muted'}`}>
                  {example}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {error && (
        <p className="mt-2 text-xs text-brand-red">{error}</p>
      )}
    </Card>
  )
}