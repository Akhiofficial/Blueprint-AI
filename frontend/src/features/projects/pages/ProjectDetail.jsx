import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../../layouts/DashboardLayout';
import ProjectForm from '../components/ProjectForm';
import { useProjectsContext } from '../projects.context';
import useProjects from '../hooks/useProjects';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { PageSpinner } from '../../../components/common/Spinner';
import ErrorMessage from '../../../components/common/ErrorMessage';

const categoryColors = {
  'Web App': 'indigo', 'Mobile': 'green', 'API': 'yellow', 'DevOps': 'slate', 'AI / ML': 'red',
};

const ProjectDetail = () => {
  const { id }    = useParams();
  const { currentProject, loading, error } = useProjectsContext();
  const { handleFetchProjectById, handleUpdateProject, handleDeleteProject } = useProjects();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    handleFetchProjectById(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleUpdate = async (formData) => {
    const success = await handleUpdateProject(id, formData);
    if (success) setIsEditing(false);
  };

  const confirmDelete = () => {
    if (window.confirm('Delete this project? This cannot be undone.')) {
      handleDeleteProject(id);
    }
  };

  if (loading && !currentProject) return <DashboardLayout><PageSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-slate-500">
        <Link to="/dashboard" className="hover:text-slate-300 transition-colors">Dashboard</Link>
        <span className="mx-2">›</span>
        <span className="text-slate-300 truncate max-w-xs inline-block">{currentProject?.title}</span>
      </nav>

      <ErrorMessage message={error} className="mb-6" />

      {currentProject && (
        <div className="mx-auto max-w-3xl animate-slide-up">
          {isEditing ? (
            /* ── Edit mode ── */
            <div className="glass p-8">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold text-slate-100">Edit Project</h1>
                <Button
                  id="cancel-edit"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  ✕ Cancel
                </Button>
              </div>
              <ProjectForm
                onSubmit={handleUpdate}
                defaultValues={currentProject}
                isLoading={loading}
                error={error}
                submitLabel="Save changes"
              />
            </div>
          ) : (
            /* ── View mode ── */
            <>
              {/* Header card */}
              <div className="glass p-8 mb-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <h1 className="text-2xl font-bold text-slate-100">{currentProject.title}</h1>
                      {currentProject.category && (
                        <Badge color={categoryColors[currentProject.category] || 'slate'}>
                          {currentProject.category}
                        </Badge>
                      )}
                    </div>
                    <p className="text-slate-400 leading-relaxed">{currentProject.description}</p>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <Button id="edit-project-btn" size="sm" variant="secondary" onClick={() => setIsEditing(true)}>
                      ✎ Edit
                    </Button>
                    <Button id="delete-project-btn" size="sm" variant="danger" onClick={confirmDelete} isLoading={loading}>
                      ✕ Delete
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tech stack card */}
              {currentProject.techStack?.length > 0 && (
                <div className="glass p-6 mb-4">
                  <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Tech Stack</h2>
                  <div className="flex flex-wrap gap-2">
                    {currentProject.techStack.map((t) => (
                      <span
                        key={t}
                        className="rounded-xl bg-brand-500/10 border border-brand-500/25 px-3 py-1
                                   text-sm font-medium text-brand-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* AI placeholder card */}
              <div className="glass p-6 border-dashed border-brand-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🤖</span>
                  <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">AI Documents</h2>
                </div>
                <p className="text-sm text-slate-500">
                  AI-generated planning documents will appear here in Phase 2.
                  (BRD, SRS, User Stories, DB Schema, REST API Docs, Dev Roadmap)
                </p>
              </div>

              {/* Metadata */}
              <p className="mt-4 text-xs text-slate-600 text-right">
                Created {new Date(currentProject.createdAt).toLocaleString('en-IN')}
              </p>
            </>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default ProjectDetail;
