// src/components/dashboard/StatCard.jsx
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import Card from '../common/Card'

export default function StatCard({
  icon: Icon,
  title,
  value,
  delta,
  deltaPositive,
  compareLabel,
  attention,
}) {
  const hasValue = value !== null && value !== undefined
  const hasDelta = delta !== null && delta !== undefined
  const isPositive = deltaPositive !== false

  return (
    <Card className="hover:shadow-cardHover transition-shadow">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
          {Icon && <Icon size={20} className="text-brand-blue" strokeWidth={1.9} />}
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-500 dark:text-dark-muted">{title}</p>

      <p className="mt-1 text-2xl lg:text-[28px] font-bold text-brand-black dark:text-dark-text tracking-tight">
        {hasValue ? value : '—'}
      </p>

      <div className="mt-2 flex items-center gap-2 text-xs">
        {hasDelta && (
          <span
            className={`inline-flex items-center gap-0.5 font-medium ${
              isPositive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-brand-red'
            }`}
          >
            {isPositive ? (
              <ArrowUpRight size={13} strokeWidth={2.4} />
            ) : (
              <ArrowDownRight size={13} strokeWidth={2.4} />
            )}
            {delta}
          </span>
        )}
        {compareLabel && (
          <span className="text-gray-500 dark:text-dark-muted">{compareLabel}</span>
        )}
        {attention && (
          <span className="font-medium text-amber-600 dark:text-amber-400">{attention}</span>
        )}
      </div>
    </Card>
  )
}