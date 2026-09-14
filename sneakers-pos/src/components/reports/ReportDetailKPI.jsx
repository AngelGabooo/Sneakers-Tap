import Card from '../common/Card'

export default function ReportDetailKPI({ kpis = [] }) {
  if (kpis.length === 0) return null

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-${Math.min(kpis.length, 4)} gap-3 mb-5`}>
      {kpis.map(({ key, label, value, helper, tone }) => (
        <Card key={key} className="!p-4">
          <p className="text-xs text-gray-500 dark:text-dark-muted truncate">{label}</p>
          <p className={`text-xl font-bold mt-1 truncate ${
            tone === 'danger' ? 'text-brand-red'
            : tone === 'warning' ? 'text-amber-600 dark:text-amber-400'
            : tone === 'success' ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-brand-black dark:text-dark-text'
          }`}>
            {value ?? '—'}
          </p>
          {helper && (
            <p className="text-[11px] text-gray-400 dark:text-dark-muted mt-0.5 truncate">
              {helper}
            </p>
          )}
        </Card>
      ))}
    </div>
  )
}