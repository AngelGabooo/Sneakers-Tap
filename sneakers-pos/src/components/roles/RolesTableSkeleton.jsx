export default function RolesTableSkeleton({ rows = 6 }) {
  return (
    <div className="animate-pulse divide-y divide-gray-100 dark:divide-dark-border">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4">
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-32 rounded bg-gray-200 dark:bg-dark-border" />
            <div className="h-3 w-48 rounded bg-gray-100 dark:bg-dark-border/60" />
          </div>
          <div className="h-3.5 w-12 rounded bg-gray-200 dark:bg-dark-border" />
          <div className="h-3.5 w-16 rounded bg-gray-200 dark:bg-dark-border" />
          <div className="h-3.5 w-24 rounded bg-gray-200 dark:bg-dark-border" />
          <div className="h-6 w-20 rounded-md bg-gray-200 dark:bg-dark-border" />
          <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-dark-border" />
        </div>
      ))}
    </div>
  )
}