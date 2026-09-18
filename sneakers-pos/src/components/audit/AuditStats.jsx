// src/components/audit/AuditStats.jsx
import { useMemo } from 'react'

export default function AuditStats({ events = [] }) {          // ⭐ default = []
  const stats = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let todayCount = 0
    let criticalCount = 0
    let importantCount = 0
    const byModule = {}

    // ⭐ Guard defensivo por si llega algo raro
    const list = Array.isArray(events) ? events : []

    list.forEach((ev) => {
      if (!ev) return
      const d = new Date(ev.createdAt)
      if (d >= today) todayCount++
      if (ev.level === 'critical') criticalCount++
      if (ev.level === 'important') importantCount++
      const m = ev.module || 'system'
      byModule[m] = (byModule[m] || 0) + 1
    })

    const topModules = Object.entries(byModule)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)

    return { todayCount, criticalCount, importantCount, topModules }
  }, [events])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      <StatCard
        icon="📅"
        label="Hoy"
        value={stats.todayCount}
        color="blue"
      />
      <StatCard
        icon="⚠️"
        label="Importantes"
        value={stats.importantCount}
        color="amber"
      />
      <StatCard
        icon="🚨"
        label="Críticos"
        value={stats.criticalCount}
        color="red"
      />
      <StatCard
        icon="📦"
        label="Total"
        value={Array.isArray(events) ? events.length : 0}
        color="gray"
      />
    </div>
  )
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700',
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