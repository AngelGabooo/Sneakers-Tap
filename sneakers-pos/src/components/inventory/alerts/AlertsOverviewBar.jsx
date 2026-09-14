import Card from '../../common/Card'

export default function AlertsOverviewBar({ stats }) {
  const out = Number(stats?.outOfStock) || 0
  const low = Number(stats?.lowStock) || 0
  const soon = Number(stats?.soon) || 0
  const total = out + low + soon

  if (total === 0) return null

  const pctOut = (out / total) * 100
  const pctLow = (low / total) * 100
  const pctSoon = (soon / total) * 100

  return (
    <Card className="mb-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-base font-semibold text-brand-black dark:text-dark-text">
            {total} alertas requieren atención
          </p>
          <p className="text-xs text-gray-500 dark:text-dark-muted mt-0.5">
            {out} críticos · {low} bajos · {soon} por agotarse
          </p>
        </div>
      </div>

      <div className="flex h-2 rounded-full overflow-hidden bg-gray-100 dark:bg-dark-surface">
        {pctOut > 0 && <div className="bg-brand-red" style={{ width: `${pctOut}%` }} />}
        {pctLow > 0 && <div className="bg-amber-500" style={{ width: `${pctLow}%` }} />}
        {pctSoon > 0 && <div className="bg-brand-blue" style={{ width: `${pctSoon}%` }} />}
      </div>

      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-dark-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-brand-red" /> Agotados ({out})
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500" /> Stock bajo ({low})
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-brand-blue" /> Por agotarse ({soon})
        </span>
      </div>
    </Card>
  )
}