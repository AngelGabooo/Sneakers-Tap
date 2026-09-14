import { Calendar, Filter, RotateCcw } from 'lucide-react'
import { PERIOD_OPTIONS } from '../../data/reports'
import Button from '../common/Button'

export default function ReportDetailFilters({
  period, onPeriodChange,
  customFrom, customTo, onCustomFromChange, onCustomToChange,
  onRefresh, onClear,
}) {
  return (
    <div className="rounded-xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-3 mb-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-dark-muted">
          <Calendar size={14} strokeWidth={2.2} />
          <span>Periodo</span>
        </div>

        <select
          value={period}
          onChange={(e) => onPeriodChange?.(e.target.value)}
          className="h-9 px-3 rounded-lg text-sm font-medium bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-brand-black dark:text-dark-text outline-none cursor-pointer"
        >
          {PERIOD_OPTIONS.map((p) => (
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
          </>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <Button variant="ghost" size="sm" icon={RotateCcw} onClick={onClear}>
            Limpiar
          </Button>
        </div>
      </div>
    </div>
  )
}