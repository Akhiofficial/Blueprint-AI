import { Link } from 'react-router-dom';
import DashboardLayout from '../../../layouts/DashboardLayout';
import ProjectForm from '../components/ProjectForm';
import { useProjectsContext } from '../projects.context';
import useProjects from '../hooks/useProjects';

const CreateProject = () => {
  const { loading, error } = useProjectsContext();
  const { handleCreateProject } = useProjects();

  return (
    <DashboardLayout>
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-slate-500">
        <Link to="/dashboard" className="hover:text-slate-300 transition-colors">Dashboard</Link>
        <span className="mx-2">›</span>
        <span className="text-slate-300">New Project</span>
      </nav>

      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-100">Create a new project</h1>
          <p className="mt-1 text-sm text-slate-500">
            Describe your idea — in Phase 2, BlueprintAI will generate your full planning documents automatically.
          </p>
        </div>

        <div className="glass p-8 animate-slide-up">
          <ProjectForm
            onSubmit={handleCreateProject}
            isLoading={loading}
            error={error}
            submitLabel="Create Project →"
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateProject;
