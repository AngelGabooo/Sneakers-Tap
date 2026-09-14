import { Calendar, GitCompare } from 'lucide-react'
import { PERIOD_OPTIONS, COMPARE_OPTIONS } from '../../data/reports'

export default function ReportsFiltersBar({
  period, onPeriodChange,
  compare, onCompareChange,
  compareWith, onCompareWithChange,
  customFrom, customTo, onCustomFromChange, onCustomToChange,
}) {
  return (
    <div className="rounded-xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-3 mb-5 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-dark-muted">
          <Calendar size={14} strokeWidth={2.2} />
          <span>Periodo</span>
        </div>

        <select
          value={period}
          onChange={(e) => onPeriodChange?.(e.target.value)}
          className="h-9 px-3 rounded-lg text-sm font-medium bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-brand-black dark:text-dark-text hover:border-brand-blue focus:border-brand-blue outline-none cursor-pointer"
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

        <span className="w-px h-6 bg-gray-200 dark:bg-dark-border mx-1 hidden sm:block" />

        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={!!compare}
            onChange={(e) => onCompareChange?.(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
          />
          <span className="text-gray-600 dark:text-dark-muted flex items-center gap-1">
            <GitCompare size={13} strokeWidth={2.2} />
            Comparar periodo
          </span>
        </label>

        {compare && (
          <select
            value={compareWith}
            onChange={(e) => onCompareWithChange?.(e.target.value)}
            className="h-9 px-3 rounded-lg text-sm font-medium bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-brand-black dark:text-dark-text outline-none cursor-pointer"
          >
            {COMPARE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  )
}