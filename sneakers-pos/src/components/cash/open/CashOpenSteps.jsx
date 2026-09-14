const STEPS = [
  { key: 'cash',        label: 'Caja' },
  { key: 'fund',        label: 'Fondo inicial' },
  { key: 'confirm',     label: 'Confirmar' },
]

export default function CashOpenSteps({ current = 'cash' }) {
  const idx = STEPS.findIndex((s) => s.key === current)

  return (
    <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1 -mx-1 px-1">
      {STEPS.map((step, i) => {
        const isActive = i === idx
        const isDone = i < idx
        return (
          <div key={step.key} className="flex items-center gap-2 shrink-0">
            <div
              className={`
                flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold
                ${isActive
                  ? 'bg-brand-blue text-white'
                  : isDone
                    ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                    : 'bg-gray-100 dark:bg-dark-surface text-gray-400 dark:text-dark-muted'}
              `}
            >
              {i + 1}
            </div>
            <span
              className={`
                text-sm font-medium
                ${isActive ? 'text-brand-blue' : 'text-gray-500 dark:text-dark-muted'}
              `}
            >
              {step.label}
            </span>
            {i < STEPS.length - 1 && (
              <span className="text-gray-300 dark:text-dark-border mx-1">→</span>
            )}
          </div>
        )
      })}
    </div>
  )
}