/**
 * DashboardSkeleton
 *
 * Professional loading state for the Dashboard — uses pulsing skeleton shapes
 * instead of a centered spinner, so the layout feels stable while data loads.
 */

const SkeletonLine = ({ width = '100%', height = '0.75rem', className = '' }) => (
  <div
    className={`skeleton rounded ${className}`}
    style={{ width, height }}
    aria-hidden
  />
);

const SkeletonCard = () => (
  <div
    className="rounded-xl p-5 flex flex-col gap-4"
    style={{
      background: '#11161D',
      border: '1px solid rgba(255,255,255,0.06)',
    }}
    aria-hidden
  >
    {/* Card header */}
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 space-y-2">
        <SkeletonLine width="60%" height="1rem" />
        <SkeletonLine width="85%" height="0.7rem" />
      </div>
      <SkeletonLine width="3.5rem" height="1.25rem" className="rounded-full shrink-0" />
    </div>

    {/* Tech chips */}
    <div className="flex gap-2">
      <SkeletonLine width="3rem" height="1.25rem" className="rounded-md" />
      <SkeletonLine width="4rem" height="1.25rem" className="rounded-md" />
      <SkeletonLine width="2.5rem" height="1.25rem" className="rounded-md" />
    </div>

    {/* Progress section */}
    <div className="space-y-2">
      <SkeletonLine width="40%" height="0.6rem" />
      <SkeletonLine width="100%" height="2px" />
      <div className="space-y-1.5 pt-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <SkeletonLine key={i} width={`${50 + i * 6}%`} height="0.6rem" />
        ))}
      </div>
    </div>

    {/* Footer */}
    <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      <SkeletonLine width="5rem" height="0.6rem" />
      <SkeletonLine width="6.5rem" height="1.75rem" className="rounded-lg" />
    </div>
  </div>
);

const DashboardSkeleton = () => (
  <div className="animate-fade-in" aria-busy="true" aria-label="Loading projects">
    {/* Header skeleton */}
    <div className="mb-10">
      <SkeletonLine width="6rem" height="0.6rem" className="mb-3" />
      <SkeletonLine width="14rem" height="1.75rem" className="mb-2" />
      <SkeletonLine width="22rem" height="0.75rem" className="mb-6 max-w-full" />
      <SkeletonLine width="8.5rem" height="2.5rem" className="rounded-lg" />
    </div>

    {/* Cards grid */}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  </div>
);

export default DashboardSkeleton;
