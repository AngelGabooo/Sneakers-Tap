// src/components/audit/AuditStats.jsx

/**
 * Muestra 4 tarjetas de stats:
 *   - Hoy (eventos de hoy)
 *   - Importantes
 *   - Críticos
 *   - Total
 *
 * Recibe `stats` ya calculado desde el AuditContext.
 */
export default function AuditStats({ stats = {} }) {
  const todayCount      = stats.todayCount      ?? stats.today      ?? 0
  const importantCount  = stats.importantCount  ?? stats.important  ?? 0
  const criticalCount   = stats.criticalCount   ?? stats.critical   ?? 0
  const totalCount      = stats.total           ?? 0

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      <StatCard
        icon="📅"
        label="Hoy"
        value={todayCount}
        color="blue"
      />
      <StatCard
        icon="⚠️"
        label="Importantes"
        value={importantCount}
        color="amber"
      />
      <StatCard
        icon="🚨"
        label="Críticos"
        value={criticalCount}
        color="red"
      />
      <StatCard
        icon="📦"
        label="Total"
        value={totalCount}
        color="gray"
      />
    </div>
  )
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    blue:  'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:border-blue-900/50 dark:text-blue-300',
    amber: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-300',
    red:   'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-300',
    gray:  'bg-gray-50 border-gray-200 text-gray-700 dark:bg-dark-surface dark:border-dark-border dark:text-dark-text',
  }
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-1">
        <span>{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  )
}