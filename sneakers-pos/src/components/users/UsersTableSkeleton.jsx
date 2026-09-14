export default function UsersTableSkeleton({ rows = 6 }) {
  return (
    <div className="animate-pulse divide-y divide-gray-100 dark:divide-dark-border">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4">
          <div className="w-4 h-4 rounded bg-gray-200 dark:bg-dark-border shrink-0" />
          <div className="flex items-center gap-3 min-w-[200px]">
            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-dark-border shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3.5 w-28 rounded bg-gray-200 dark:bg-dark-border" />
              <div className="h-3 w-16 rounded bg-gray-100 dark:bg-dark-border/60" />
            </div>
          </div>
          <div className="hidden md:block space-y-1.5 flex-1 max-w-[160px]">
            <div className="h-3.5 w-24 rounded bg-gray-200 dark:bg-dark-border" />
            <div className="h-3 w-32 rounded bg-gray-100 dark:bg-dark-border/60" />
          </div>
          <div className="hidden lg:block h-6 w-20 rounded-md bg-gray-200 dark:bg-dark-border" />
          <div className="hidden lg:block h-3.5 w-24 rounded bg-gray-200 dark:bg-dark-border" />
          <div className="hidden xl:block h-3.5 w-20 rounded bg-gray-200 dark:bg-dark-border" />
          <div className="h-6 w-16 rounded-md bg-gray-200 dark:bg-dark-border" />
          <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-dark-border ml-auto" />
        </div>
      ))}
    </div>
  )
}