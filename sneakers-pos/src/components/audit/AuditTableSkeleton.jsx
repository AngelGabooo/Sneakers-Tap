// src/components/audit/AuditTableSkeleton.jsx
export default function AuditTableSkeleton({ rows = 6 }) {
  return (
    <div className="p-4 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 animate-pulse">
          <div className="h-3 w-24 bg-gray-100 dark:bg-dark-surface rounded" />
          <div className="h-3 w-32 bg-gray-100 dark:bg-dark-surface rounded" />
          <div className="h-3 w-20 bg-gray-100 dark:bg-dark-surface rounded" />
          <div className="h-3 w-40 bg-gray-100 dark:bg-dark-surface rounded flex-1" />
          <div className="h-3 w-16 bg-gray-100 dark:bg-dark-surface rounded" />
        </div>
      ))}
    </div>
  )
}