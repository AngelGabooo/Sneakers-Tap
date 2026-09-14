import { DollarSign } from 'lucide-react'
import Card from '../../common/Card'

export default function CashOpenInitialFund({ value, onChange, error }) {
  return (
    <Card>
      <header className="mb-4">
        <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
          Fondo inicial
        </h2>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Ingresa el efectivo disponible en la caja al comenzar la jornada.
        </p>
      </header>

      <label className="block text-sm font-medium text-brand-black dark:text-dark-text mb-1.5">
        Monto inicial <span className="text-brand-red">*</span>
      </label>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
          <DollarSign size={17} strokeWidth={1.9} />
        </span>
        <input
          type="number"
          min={0}
          step={0.01}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="0.00"
          className={`
            w-full h-12 pl-10 pr-3 rounded-lg text-lg font-semibold
            bg-white dark:bg-dark-card text-brand-black dark:text-dark-text
            border transition-colors outline-none
            ${error
              ? 'border-brand-red focus:border-brand-red focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/40'
              : 'border-gray-200 dark:border-dark-border focus:border-brand-blue focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40'}
          `}
        />
      </div>

      {error && <p className="mt-1.5 text-xs text-brand-red">{error}</p>}

      <p className="mt-3 text-xs text-gray-500 dark:text-dark-muted">
        Este monto no es una venta, es el efectivo con el que comienza la caja.
      </p>
    </Card>
  )
}