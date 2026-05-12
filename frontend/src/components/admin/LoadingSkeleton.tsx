// SkeletonLine — single animated line placeholder
interface SkeletonLineProps {
  width?: string
}

export function SkeletonLine({ width = "w-full" }: SkeletonLineProps) {
  return (
    <div
      className={`h-4 ${width} animate-pulse bg-slate/20 dark:bg-white/10 rounded`}
      aria-hidden="true"
    />
  )
}

// SkeletonCard — card-shaped placeholder
export function SkeletonCard() {
  return (
    <div
      className="bg-white dark:bg-charcoal-light rounded-2xl shadow-elegant p-5 flex flex-col gap-3"
      aria-hidden="true"
    >
      <div className="h-5 w-2/3 animate-pulse bg-slate/20 dark:bg-white/10 rounded" />
      <div className="h-4 w-full animate-pulse bg-slate/20 dark:bg-white/10 rounded" />
      <div className="h-4 w-5/6 animate-pulse bg-slate/20 dark:bg-white/10 rounded" />
      <div className="mt-2 flex items-center justify-between">
        <div className="h-6 w-20 animate-pulse bg-slate/20 dark:bg-white/10 rounded-full" />
        <div className="h-8 w-24 animate-pulse bg-slate/20 dark:bg-white/10 rounded-lg" />
      </div>
    </div>
  )
}

// SkeletonTable — table rows placeholder
interface SkeletonTableProps {
  rows?: number
}

export function SkeletonTable({ rows = 5 }: SkeletonTableProps) {
  return (
    <div className="flex flex-col divide-y divide-slate/10 dark:divide-white/10" aria-hidden="true">
      {/* Header row */}
      <div className="flex items-center gap-4 px-4 py-3">
        <div className="h-4 w-1/4 animate-pulse bg-slate/20 dark:bg-white/10 rounded" />
        <div className="h-4 w-1/6 animate-pulse bg-slate/20 dark:bg-white/10 rounded" />
        <div className="h-4 w-1/6 animate-pulse bg-slate/20 dark:bg-white/10 rounded ml-auto" />
      </div>

      {/* Data rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3.5">
          <div className="h-4 w-1/3 animate-pulse bg-slate/20 dark:bg-white/10 rounded" />
          <div className="h-4 w-1/5 animate-pulse bg-slate/20 dark:bg-white/10 rounded" />
          <div className="h-6 w-16 animate-pulse bg-slate/20 dark:bg-white/10 rounded-full ml-auto" />
        </div>
      ))}
    </div>
  )
}
