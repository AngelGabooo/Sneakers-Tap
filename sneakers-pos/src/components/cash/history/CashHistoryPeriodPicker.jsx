import { Calendar } from 'lucide-react'

const PERIODS = [
  { value: 'today',     label: 'Hoy' },
  { value: 'yesterday', label: 'Ayer' },
  { value: '7d',        label: 'Últimos 7 días' },
  { value: '30d',       label: 'Últimos 30 días' },
  { value: 'month',     label: 'Este mes' },
  { value: 'lastMonth', label: 'Mes anterior' },
  { value: 'custom',    label: 'Personalizado' },
]

export default function CashHistoryPeriodPicker({
  period, onPeriodChange,
  customFrom, customTo, onCustomFromChange, onCustomToChange,
  onApplyCustom,
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-5 p-3 rounded-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border">
      <div className="flex items-center gap-2">
        <Calendar size={15} className="text-brand-blue" strokeWidth={2.2} />
        <span className="text-sm font-medium text-brand-black dark:text-dark-text">
          Periodo
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={period}
          onChange={(e) => onPeriodChange?.(e.target.value)}
          className="
            h-9 px-3 rounded-lg text-sm font-medium
            bg-white dark:bg-dark-card
            border border-gray-200 dark:border-dark-border
            text-brand-black dark:text-dark-text
            hover:border-brand-blue focus:border-brand-blue
            outline-none cursor-pointer
          "
        >
          {PERIODS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>

        {period === 'custom' && (
          <>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => onCustomFromChange?.(e.target.value)}
              className="h-9 px-3 rounded-lg text-sm bg-white dark:bg-dark-card text-brand-black dark:text-dark-text border border-gray-200 dark:border-dark-border outline-none"
            />
            <span className="text-gray-400 text-sm">a</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => onCustomToChange?.(e.target.value)}
              className="h-9 px-3 rounded-lg text-sm bg-white dark:bg-dark-card text-brand-black dark:text-dark-text border border-gray-200 dark:border-dark-border outline-none"
            />
            <button
              onClick={onApplyCustom}
              className="h-9 px-3 rounded-lg text-sm font-medium bg-brand-blue text-white hover:bg-brand-blueHover transition-colors"
            >
              Aplicar
            </button>
          </>
        )}
      </div>
    </div>
  )
}