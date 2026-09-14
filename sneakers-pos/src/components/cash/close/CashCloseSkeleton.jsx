import Skeleton from '../../common/Skeleton'

export default function CashCloseSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-8 w-full max-w-md" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
        <div className="space-y-5">
          <Skeleton className="h-56 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}