/**
 * ProjectCardSkeleton + ProjectsPageSkeleton
 *
 * Shimmer skeleton for the Projects page loading state.
 * Matches the proportions of the redesigned ProjectCard.
 */
const SkeletonBlock = ({ width = '100%', height = '0.75rem', style = {} }) => (
  <div
    className="skeleton rounded"
    style={{ width, height, ...style }}
    aria-hidden
  />
);

export const ProjectCardSkeleton = () => (
  <div
    className="rounded-xl p-5 flex flex-col gap-4"
    style={{
      background: '#11161D',
      border: '1px solid rgba(255,255,255,0.06)',
    }}
    aria-hidden
  >
    {/* Header row */}
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 space-y-2">
        <SkeletonBlock width="58%" height="1rem" />
        <SkeletonBlock width="82%" height="0.65rem" />
        <SkeletonBlock width="70%" height="0.65rem" />
      </div>
      <SkeletonBlock width="3.5rem" height="1.25rem" style={{ borderRadius: '999px', flexShrink: 0 }} />
    </div>

    {/* Tech chips */}
    <div className="flex gap-1.5">
      <SkeletonBlock width="2.8rem" height="1.25rem" style={{ borderRadius: '6px' }} />
      <SkeletonBlock width="3.6rem" height="1.25rem" style={{ borderRadius: '6px' }} />
      <SkeletonBlock width="2.2rem" height="1.25rem" style={{ borderRadius: '6px' }} />
    </div>

    {/* Progress */}
    <div className="space-y-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="flex justify-between">
        <SkeletonBlock width="6rem" height="0.55rem" />
        <SkeletonBlock width="2rem" height="0.55rem" />
      </div>
      <SkeletonBlock width="100%" height="2px" style={{ borderRadius: '1px' }} />
      <div className="space-y-1.5 pt-1">
        {[55, 48, 65, 42, 58].map((w, i) => (
          <SkeletonBlock key={i} width={`${w}%`} height="0.55rem" />
        ))}
      </div>
    </div>

    {/* Footer */}
    <div
      className="flex items-center justify-between pt-2"
      style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="space-y-1">
        <SkeletonBlock width="3.5rem" height="1.2rem" style={{ borderRadius: '999px' }} />
        <SkeletonBlock width="5rem" height="0.55rem" />
      </div>
      <div className="flex gap-2">
        <SkeletonBlock width="3.5rem" height="1.75rem" style={{ borderRadius: '6px' }} />
        <SkeletonBlock width="4rem" height="1.75rem" style={{ borderRadius: '6px' }} />
      </div>
    </div>
  </div>
);

/**
 * Full page skeleton — shows header + filters + 6 card placeholders.
 */
const ProjectsPageSkeleton = ({ count = 6 }) => (
  <div className="animate-fade-in" aria-busy="true" aria-label="Loading projects">
    {/* Header skeleton */}
    <div className="mb-8">
      <SkeletonBlock width="5.5rem" height="0.55rem" style={{ marginBottom: '0.75rem' }} />
      <SkeletonBlock width="6rem" height="1.75rem" style={{ marginBottom: '0.5rem' }} />
      <SkeletonBlock width="20rem" height="0.65rem" style={{ maxWidth: '100%' }} />
    </div>

    {/* Search/filter skeleton */}
    <div className="mb-6 space-y-2.5">
      <div className="flex gap-2.5">
        <SkeletonBlock height="2.25rem" style={{ flex: 1, borderRadius: '8px' }} />
        <SkeletonBlock width="8rem" height="2.25rem" style={{ borderRadius: '8px' }} />
      </div>
      <div className="flex gap-2">
        {[3, 3.5, 4, 4.5].map((w, i) => (
          <SkeletonBlock key={i} width={`${w}rem`} height="1.6rem" style={{ borderRadius: '999px' }} />
        ))}
      </div>
    </div>

    {/* Section label */}
    <SkeletonBlock width="7rem" height="0.65rem" style={{ marginBottom: '1.25rem' }} />

    {/* Card grid */}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export default ProjectsPageSkeleton;
