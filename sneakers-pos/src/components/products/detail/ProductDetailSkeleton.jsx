import Skeleton from '../../common/Skeleton'

export default function ProductDetailSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-4 w-40" />
      <div className="flex flex-col lg:flex-row gap-6">
        <Skeleton className="w-full lg:w-64 aspect-square rounded-xl" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <div className="grid grid-cols-3 gap-4 mt-6">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  )
}