import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../../layouts/DashboardLayout';
import ProjectCard from '../components/ProjectCard';
import { useProjectsContext } from '../projects.context';
import useProjects from '../hooks/useProjects';
import { useAuthContext } from '../../auth/auth.context';
import { PageSpinner } from '../../../components/common/Spinner';
import ErrorMessage from '../../../components/common/ErrorMessage';
import Button from '../../../components/ui/Button';

const Dashboard = () => {
  const { projects, loading, error } = useProjectsContext();
  const { user } = useAuthContext();
  const { handleFetchProjects, handleDeleteProject } = useProjects();

  useEffect(() => {
    handleFetchProjects();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirmDelete = (id) => {
    if (window.confirm('Delete this project? This cannot be undone.')) {
      handleDeleteProject(id);
    }
  };

  return (
    <DashboardLayout>
      {/* Page header */}
      <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Your Projects
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Welcome back, <span className="text-brand-300">{user?.name}</span>
          </p>
        </div>
        <Link to="/projects/new">
          <Button id="dashboard-new-project">+ New Project</Button>
        </Link>
      </div>

      <ErrorMessage message={error} className="mb-6" />

      {loading ? (
        <PageSpinner />
      ) : projects.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-border py-20 text-center animate-fade-in">
          <span className="text-5xl mb-4">📋</span>
          <h2 className="text-lg font-semibold text-slate-300">No projects yet</h2>
          <p className="mt-2 max-w-xs text-sm text-slate-500">
            Start by describing your software idea — BlueprintAI will turn it into a full set of planning documents.
          </p>
          <Link to="/projects/new" className="mt-6">
            <Button id="empty-state-new-project">Create your first project</Button>
          </Link>
        </div>
      ) : (
        /* Project grid */
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 animate-fade-in">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onDelete={confirmDelete}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
