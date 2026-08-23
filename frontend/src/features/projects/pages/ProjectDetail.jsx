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
      {currentProject && (
        <div className="mx-auto max-w-3xl animate-slide-up">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-slate-500 flex items-center gap-2">
            <Link to="/dashboard" className="hover:text-slate-300 transition-colors flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              Dashboard
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-slate-300 truncate max-w-xs inline-block font-medium">{currentProject?.title}</span>
          </nav>

          <ErrorMessage message={error} className="mb-6" />
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
              <div className="relative group mb-6">
                {/* Decorative background glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-brand-500/10 to-transparent rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
                
                <div className="glass relative p-8 rounded-2xl border-t border-t-brand-500/20 shadow-lg shadow-black/20">
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 flex-wrap mb-3">
                        <h1 className="text-3xl font-extrabold tracking-tight text-white">{currentProject.title}</h1>
                        {currentProject.category && (
                          <Badge color={categoryColors[currentProject.category] || 'slate'}>
                            {currentProject.category}
                          </Badge>
                        )}
                      </div>
                      <p className="text-slate-300/80 leading-relaxed text-lg max-w-3xl">{currentProject.description}</p>
                      
                      {/* Project Metadata Details */}
                      {(currentProject.projectType || currentProject.businessGoal || currentProject.status) && (
                        <div className="mt-6 pt-5 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          {currentProject.projectType && (
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                              </div>
                              <div>
                                <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold block">Project Type</span>
                                <span className="text-slate-200 font-medium">{currentProject.projectType}</span>
                              </div>
                            </div>
                          )}
                          {currentProject.status && (
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                              </div>
                              <div>
                                <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold block">Status</span>
                                <span className="text-slate-200 font-medium capitalize">{currentProject.status}</span>
                              </div>
                            </div>
                          )}
                          {currentProject.businessGoal && (
                            <div className="sm:col-span-2 flex items-start gap-2 mt-2">
                              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 shrink-0 mt-0.5">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                              </div>
                              <div>
                                <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold block">Business Goal</span>
                                <span className="text-slate-300 leading-relaxed block mt-0.5">{currentProject.businessGoal}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button 
                        id="edit-project-btn" 
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all text-sm font-medium"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        Edit
                      </button>
                      <button 
                        id="delete-project-btn" 
                        onClick={confirmDelete} 
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-all text-sm font-medium disabled:opacity-50"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tech stack card */}
              {currentProject.techStack?.length > 0 && (
                <div className="glass p-6 mb-6 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-brand-500/10 transition-colors"></div>
                  <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                    Tech Stack
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {currentProject.techStack.map((t) => (
                      <span
                        key={t}
                        className="rounded-lg bg-brand-500/10 border border-brand-500/20 px-3 py-1.5
                                   text-sm font-medium text-brand-300 shadow-sm"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Workspace card */}
              <div className="relative group mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity"></div>
                <div className="glass p-6 sm:p-8 rounded-2xl border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative shadow-lg shadow-blue-900/10">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400 border border-blue-500/30 shadow-inner">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-100 tracking-tight mb-1">Blueprint Workspace</h2>
                      <p className="text-sm text-slate-400 leading-relaxed max-w-lg">
                        Access and visually refine your AI-generated software planning documents including BRD, SRS, Database Schema, and REST APIs.
                      </p>
                    </div>
                  </div>
                  <Link to={`/projects/${id}/workspace`} className="shrink-0 w-full sm:w-auto">
                    <button className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2">
                      Open Workspace
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </button>
                  </Link>
                </div>
              </div>

              {/* Metadata */}
              <p className="mt-6 text-xs text-slate-500/70 text-right flex items-center justify-end gap-1.5 font-medium">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                Created {new Date(currentProject.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default ProjectDetail;
