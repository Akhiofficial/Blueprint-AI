import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import ProjectsHeader from '../components/ProjectsHeader';
import ProjectFilters from '../components/ProjectFilters';
import ProjectCard from '../components/ProjectCard';
import { useProjectsContext } from '../projects.context';
import useProjects from '../hooks/useProjects';
import ErrorState from '../../../components/common/ErrorState';
import EmptyState from '../../../components/common/EmptyState';
import { PageSkeleton } from '../../../components/common/Skeleton';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

// ── Section label ────────────────────────────────────────────────────────────
const SectionLabel = ({ children, count }) => (
  <div className="flex items-center justify-between mb-4">
    <h2
      className="text-xs font-medium"
      style={{ color: 'rgba(255,255,255,0.4)' }}
    >
      <span
        style={{
          background: 'linear-gradient(90deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.35) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {children}
      </span>
      {count !== undefined && (
        <span
          className="ml-2 bp-mono not-italic"
          style={{
            fontSize: '0.6rem',
            color: 'rgba(255,255,255,0.2)',
            WebkitTextFillColor: 'rgba(255,255,255,0.2)',
          }}
        >
          ({count})
        </span>
      )}
    </h2>
  </div>
);

// ── Helpers ──────────────────────────────────────────────────────────────────
const sortProjects = (projects, sortKey) => {
  const arr = [...projects];
  switch (sortKey) {
    case 'created': return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    case 'name':    return arr.sort((a, b) => a.title.localeCompare(b.title));
    case 'updated':
    default:        return arr.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }
};

// ── Projects Page ────────────────────────────────────────────────────────────
const ProjectsPage = () => {
  const { projects, loading, error } = useProjectsContext();
  const { handleFetchProjects, handleDeleteProject } = useProjects();

  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState('all');
  const [sort, setSort]       = useState('updated');

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

  const clearFilters = () => {
    setSearch('');
    setStatus('all');
    setSort('updated');
  };

  // Apply sort first, then filter (so sort order is stable across filter changes)
  const sorted = useMemo(() => sortProjects(projects, sort), [projects, sort]);

  const filtered = useMemo(() => {
    let result = sorted;

    // Status filter
    if (status !== 'all') {
      result = result.filter((p) => p.status === status);
    }

    // Search filter: title, description, category, tech stack
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.projectType?.toLowerCase().includes(q) ||
          p.techStack?.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [sorted, search, status]);

  const hasActiveFilters = search.trim() !== '' || status !== 'all';
  const showEmpty        = !loading && !error && projects.length === 0;
  const showFiltered     = !loading && !error && projects.length > 0 && filtered.length === 0;
  const showGrid         = !loading && !error && filtered.length > 0;

  return (
    <DashboardLayout>
      {/* ── Loading state ── */}
      {loading && <PageSkeleton />}

      {/* ── Error state ── */}
      {!loading && error && (
        <ErrorState
          title="Unable to load projects"
          message={error.message || "Something went wrong while loading your projects."}
          onRetry={handleFetchProjects}
        />
      )}

      {/* ── Main content ── */}
      {!loading && !error && (
        <>
          {/* Page header */}
          <ProjectsHeader count={projects.length} />

          {/* Search + filter + sort — show when projects exist OR when filtering */}
          {projects.length > 0 && (
            <ProjectFilters
              search={search}   onSearch={setSearch}
              status={status}   onStatus={setStatus}
              sort={sort}       onSort={setSort}
              total={projects.length}
              filtered={filtered.length}
            />
          )}

          {/* ── Empty workspace (no projects at all) ── */}
          {showEmpty && (
            <EmptyState 
              title="No projects found"
              description="You haven't created any projects yet."
              actionText="Create Project"
              actionTo="/projects/new"
            />
          )}

          {/* ── No filter results ── */}
          {showFiltered && (
            <EmptyState 
              title="No matching projects"
              description="No projects match your current filters."
              actionText="Clear Filters"
              onAction={clearFilters}
            />
          )}

          {/* ── Project grid ── */}
          {showGrid && (
            <section aria-label="Your projects">
              {/* Section label — gradient text */}
              <SectionLabel count={filtered.length}>
                {hasActiveFilters ? 'Filtered Results' : 'Your Projects'}
              </SectionLabel>

              <div
                id="projects-grid"
                className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
              >
                {filtered.map((project, idx) => (
                  <div
                    key={project._id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${idx * 40}ms`, animationFillMode: 'both' }}
                  >
                    <ProjectCard
                      project={project}
                      onDelete={confirmDelete}
                    />
                  </div>
                ))}
              </div>
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

export default ProjectsPage;
