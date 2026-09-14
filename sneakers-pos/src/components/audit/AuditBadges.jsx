// src/components/audit/AuditBadges.jsx
import { Info, AlertTriangle, ShieldCheck, Shield } from 'lucide-react'
import { getLevelMeta, getResultMeta, getModuleLabel } from '../../data/audit'

const levelStyles = {
  neutral: 'bg-gray-100 text-gray-700 dark:bg-dark-surface dark:text-dark-muted',
  info:    'bg-blue-50 text-brand-blue dark:bg-blue-950/40 dark:text-blue-300',
  danger:  'bg-red-50 text-brand-red dark:bg-red-950/40 dark:text-red-400',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
}

const levelIcons = {
  info:    Info,
  alert:   AlertTriangle,
  shield:  ShieldCheck,
}

export function LevelBadge({ level }) {
  const meta = getLevelMeta(level)
  const Icon = levelIcons[meta.icon] || Info
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold ${levelStyles[meta.variant]}`}>
      <Icon size={12} strokeWidth={2.2} />
      {meta.label}
    </span>
  )
}

export function ResultBadge({ result }) {
  const meta = getResultMeta(result)
  const styles = meta.variant === 'success'
    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
    : 'bg-red-50 text-brand-red dark:bg-red-950/40 dark:text-red-400'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${styles}`}>
      {meta.label}
    </span>
  )
}

export function ModuleBadge({ module }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-700 dark:bg-dark-surface dark:text-dark-muted">
      {getModuleLabel(module)}
    </span>
  )
}