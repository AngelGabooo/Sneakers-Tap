// src/components/audit/AuditBadges.jsx
import { getLevelMeta, getResultMeta, getModuleLabel } from '../../data/audit'

const TONES = {
  info:     'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900',
  success:  'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900',
  warning:  'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
  danger:   'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900',
  neutral:  'bg-gray-50 text-gray-700 border-gray-200 dark:bg-dark-surface dark:text-dark-muted dark:border-dark-border',
}

function Badge({ tone = 'neutral', children }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-medium ${TONES[tone] || TONES.neutral}`}>
      {children}
    </span>
  )
}

export function LevelBadge({ level }) {
  const meta = getLevelMeta(level)
  return <Badge tone={meta.variant}>{meta.label}</Badge>
}

export function ResultBadge({ result }) {
  const meta = getResultMeta(result)
  return <Badge tone={meta.variant}>{meta.label}</Badge>
}

export function ModuleBadge({ module }) {
  return <Badge tone="info">{getModuleLabel(module)}</Badge>
}