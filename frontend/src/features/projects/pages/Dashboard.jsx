import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import DashboardHeader from '../components/DashboardHeader';
import ProjectCard from '../components/ProjectCard';
import EmptyProjectsState from '../components/EmptyProjectsState';
import DashboardSkeleton from '../components/DashboardSkeleton';
import { useProjectsContext } from '../projects.context';
import useProjects from '../hooks/useProjects';
import { useAuthContext } from '../../auth/auth.context';
import ErrorMessage from '../../../components/common/ErrorMessage';
import Button from '../../../components/ui/Button';

// ── Most recent project highlight ─────────────────────────────────────────────
// Shows a lightweight "continue working" strip for the most recently updated project.
const ContinueProject = ({ project }) => {
  if (!project) return null;
  return (
    <div
      className="mb-8 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-slide-up"
      style={{
        background: 'rgba(59,130,246,0.06)',
        border: '1px solid rgba(59,130,246,0.18)',
      }}
    >
      <div className="min-w-0">
        <p
          className="bp-mono uppercase mb-1"
          style={{ fontSize: '0.58rem', letterSpacing: '0.14em', color: 'rgba(34,211,238,0.7)' }}
        >
          Continue where you left off
        </p>
        <p
          className="text-sm font-semibold truncate"
          style={{ color: 'rgba(255,255,255,0.85)' }}
        >
          {project.title}
        </p>
      </div>
      <a
        href={`/projects/${project._id}`}
        id="continue-project-link"
        className="dash-btn inline-flex items-center gap-2 text-xs px-4 py-2 rounded-lg shrink-0"
        style={{ width: 'fit-content' }}
      >
        Continue Workspace
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
          <path d="M2 5h6M5.5 2.5L8 5l-2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </div>
  );
};

// ── Dashboard Page ─────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { projects, loading, error } = useProjectsContext();
  const { user } = useAuthContext();
  const { handleFetchProjects, handleDeleteProject } = useProjects();

  // Search state (client-side filtering — no backend change needed)
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    handleFetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirmDelete = (id) => {
    if (window.confirm('Delete this project? This cannot be undone.')) {
      handleDeleteProject(id);
    }
  };

  // Sort projects by updatedAt descending (most recently touched first)
  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
    [projects]
  );

  // Client-side search filter
  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sortedProjects;
    return sortedProjects.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.techStack?.some((t) => t.toLowerCase().includes(q))
    );
  }, [sortedProjects, searchQuery]);

  // Most recently updated project — shown in the "continue" strip
  const mostRecent = sortedProjects[0] ?? null;

  return (
    <DashboardLayout>
      {/* ── Loading skeleton ── */}
      {loading && <DashboardSkeleton />}

      {/* ── Error state ── */}
      {!loading && error && (
        <div className="animate-fade-in">
          <ErrorMessage message="Unable to load your projects." className="mb-4" />
          <Button
            id="retry-fetch-projects"
            variant="secondary"
            size="sm"
            onClick={handleFetchProjects}
          >
            ↺ Try Again
          </Button>
        </div>
      )}

      {/* ── Main content (loaded, no error) ── */}
      {!loading && !error && (
        <>
          {/* Dashboard header with greeting + CTA */}
          <DashboardHeader
            userName={user?.name}
            projectCount={projects.length}
          />

          {/* Continue strip — only when projects exist */}
          {sortedProjects.length > 0 && (
            <ContinueProject project={mostRecent} />
          )}

          {/* Empty state */}
          {sortedProjects.length === 0 && (
            <div
              className="rounded-2xl animate-fade-in"
              style={{
                border: '1px dashed rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.01)',
              }}
            >
              <EmptyProjectsState />
            </div>
          )}

          {/* Projects section */}
          {sortedProjects.length > 0 && (
            <section aria-label="Your projects">
              {/* Section header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <h2
                  className="text-sm font-semibold"
                  style={{ color: 'rgba(255,255,255,0.6)' }}
                >
                  Your Projects
                  <span
                    className="ml-2 bp-mono"
                    style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)' }}
                  >
                    ({sortedProjects.length})
                  </span>
                </h2>

                {/* Search */}
                <div className="relative sm:w-56">
                  <label htmlFor="project-search" className="sr-only">
                    Search projects
                  </label>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'rgba(255,255,255,0.25)' }}
                  >
                    <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M8 8l2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  <input
                    id="project-search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search projects…"
                    className="w-full rounded-lg py-1.5 pl-8 pr-3 text-xs transition-all duration-150"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.7)',
                      outline: 'none',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.08)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    aria-controls="projects-grid"
                    aria-label="Search your projects"
                  />
                </div>
              </div>

              {/* No search results */}
              {filteredProjects.length === 0 && searchQuery && (
                <p
                  className="text-sm text-center py-12 animate-fade-in"
                  style={{ color: 'rgba(255,255,255,0.25)' }}
                >
                  No projects match &quot;{searchQuery}&quot;
                </p>
              )}

              {/* Projects grid */}
              {filteredProjects.length > 0 && (
                <div
                  id="projects-grid"
                  className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 animate-fade-in"
                >
                  {filteredProjects.map((project) => (
                    <ProjectCard
                      key={project._id}
                      project={project}
                      onDelete={confirmDelete}
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
