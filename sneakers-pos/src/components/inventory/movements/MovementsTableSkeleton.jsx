import Skeleton from '../../common/Skeleton'

export default function MovementsTableSkeleton({ rows = 6 }) {
  return (
    <div className="p-5 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="w-16 h-3" />
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-1/5" />
          </div>
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-10 rounded-lg" />
        </div>
      ))}
    </div>
  )
}