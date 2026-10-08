import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../../layouts/DashboardLayout';
import DashboardHeader from '../components/DashboardHeader';
import ProjectCard from '../components/ProjectCard';
import { useProjectsContext } from '../projects.context';
import useProjects from '../hooks/useProjects';
import { useAuthContext } from '../../auth/auth.context';
import ErrorState from '../../../components/common/ErrorState';
import EmptyState from '../../../components/common/EmptyState';
import { PageSkeleton } from '../../../components/common/Skeleton';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

// ── Most recent project highlight ─────────────────────────────────────────────
// Shows a lightweight "continue working" strip for the most recently updated project.
const ContinueProject = ({ project }) => {
  if (!project) return null;
  return (
    <div
      className="mb-8 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-slide-up bg-[#0D1117] border border-blue-500/20 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.5),0_0_16px_-2px_rgba(59,130,246,0.08)]"
    >
      <div className="min-w-0">
        <p className="font-mono uppercase mb-1 text-[0.6rem] tracking-widest font-semibold text-bp-cyan">
          Continue where you left off
        </p>
        <p className="text-sm sm:text-base font-semibold text-white truncate tracking-tight">
          {project.title}
        </p>
      </div>
      <Link
        to={`/projects/${project._id}`}
        id="continue-project-link"
        className="dash-btn inline-flex items-center gap-2 text-xs px-4 py-2 rounded-lg shrink-0 font-medium shadow-sm transition-all duration-150"
        style={{ width: 'fit-content' }}
      >
        Continue Workspace
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M3 8h10M9 4l4 4-4 4" />
        </svg>
      </Link>
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
  
  // Delete confirm state
  const [projectToDelete, setProjectToDelete] = useState(null);

  useEffect(() => {
    handleFetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirmDelete = (id) => {
    setProjectToDelete(id);
  };

  const executeDelete = () => {
    if (projectToDelete) {
      handleDeleteProject(projectToDelete);
      setProjectToDelete(null);
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
      {loading && <PageSkeleton />}

      {/* ── Error state ── */}
      {!loading && error && (
        <ErrorState
          title="Unable to load dashboard"
          message={error.message || "Something went wrong while loading your projects."}
          onRetry={handleFetchProjects}
        />
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
            <div className="animate-fade-in">
              <EmptyState 
                title="No projects yet"
                description="Create your first software project and start building your development blueprint."
                actionText="Create Project"
                actionTo="/projects/new"
              />
            </div>
          )}

          {/* Projects section */}
          {sortedProjects.length > 0 && (
            <section aria-label="Your projects">
              {/* Section header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <h2 className="text-sm font-semibold text-white/90">
                  Your Projects
                  <span className="ml-2 font-mono text-xs text-slate-500 font-normal">
                    ({sortedProjects.length})
                  </span>
                </h2>

                {/* Search */}
                <div className="relative sm:w-60">
                  <label htmlFor="project-search" className="sr-only">
                    Search projects
                  </label>
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input
                    id="project-search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search projects…"
                    className="w-full rounded-lg bg-[#0D1117] border border-white/[0.08] py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 transition-all duration-150 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
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

      <ConfirmDialog 
        isOpen={!!projectToDelete}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        confirmText="Delete Project"
        onConfirm={executeDelete}
        onCancel={() => setProjectToDelete(null)}
        isPending={loading}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
