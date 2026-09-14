export default function AuditTableSkeleton({ rows = 6 }) {
  return (
    <div className="animate-pulse divide-y divide-gray-100 dark:divide-dark-border">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4">
          <div className="w-20 h-3.5 rounded bg-gray-200 dark:bg-dark-border" />
          <div className="w-32 h-3.5 rounded bg-gray-200 dark:bg-dark-border" />
          <div className="w-24 h-3.5 rounded bg-gray-200 dark:bg-dark-border" />
          <div className="hidden md:block w-20 h-3.5 rounded bg-gray-200 dark:bg-dark-border" />
          <div className="flex-1 h-3.5 rounded bg-gray-200 dark:bg-dark-border" />
          <div className="w-16 h-6 rounded-md bg-gray-200 dark:bg-dark-border" />
        </div>
      ))}
    </div>
  )
}