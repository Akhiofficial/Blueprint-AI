import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../../layouts/DashboardLayout';
import ProjectForm from '../components/ProjectForm';
import { useProjectsContext } from '../projects.context';
import useProjects from '../hooks/useProjects';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { PageSkeleton } from '../../../components/common/Skeleton';
import ErrorState from '../../../components/common/ErrorState';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import useWorkflowStage from '../hooks/useWorkflowStage';

// ── Workflow CTA configuration ────────────────────────────────────────────────
const STAGE_CONFIG = {
  requirements: {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-amber-400',
    iconBorder: 'border-amber-500/30',
    cardBorder: 'border-amber-500/25',
    cardGlow: 'from-amber-500/8 to-orange-500/8',
    badge: 'Step 2 of 4',
    badgeColor: 'rgba(251,191,36,0.7)',
    title: 'Add Requirements',
    description: 'Describe what your software should do. BlueprintAI will use this to generate your full blueprint.',
    btnLabel: 'Add Requirements →',
    btnClass: 'bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-600/20',
    routeSuffix: '/requirements',
  },
  analysis: {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        <line x1="11" y1="8" x2="11" y2="14" />
        <line x1="8" y1="11" x2="14" y2="11" />
      </svg>
    ),
    iconBg: 'bg-violet-500/20',
    iconColor: 'text-violet-400',
    iconBorder: 'border-violet-500/30',
    cardBorder: 'border-violet-500/25',
    cardGlow: 'from-violet-500/8 to-purple-500/8',
    badge: 'Step 3 of 4',
    badgeColor: 'rgba(167,139,250,0.7)',
    title: 'Run AI Analysis',
    description: 'Your requirements are saved. Run AI analysis to extract actors, entities, and functional requirements before generating your blueprint.',
    btnLabel: 'Run Analysis →',
    btnClass: 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/20',
    routeSuffix: '/requirements',
  },
  workspace: {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
    iconBorder: 'border-blue-500/30',
    cardBorder: 'border-blue-500/30',
    cardGlow: 'from-blue-500/10 to-indigo-500/10',
    badge: 'Step 4 of 4',
    badgeColor: 'rgba(96,165,250,0.7)',
    title: 'Blueprint Workspace',
    description: 'Access and visually refine your AI-generated software planning documents including BRD, SRS, Database Schema, and REST APIs.',
    btnLabel: 'Open Workspace →',
    btnClass: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20',
    routeSuffix: '/workspace',
  },
};

// ── Workflow progress steps ────────────────────────────────────────────────────
const PROGRESS_STEPS = [
  { key: 'project', label: 'Project' },
  { key: 'requirements', label: 'Requirements' },
  { key: 'analysis', label: 'Analysis' },
  { key: 'workspace', label: 'Blueprint' },
];

const stageToStep = { requirements: 1, analysis: 2, workspace: 3 };

// ── Smart Workflow CTA Card ────────────────────────────────────────────────────
const WorkflowCTA = ({ projectId, stage }) => {
  if (stage === 'loading') {
    return (
      <div className="relative mb-4">
        <div className="glass p-6 sm:p-8 rounded-2xl border border-white/10 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/5" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-white/5 rounded w-1/3" />
              <div className="h-3 bg-white/5 rounded w-2/3" />
            </div>
            <div className="w-36 h-10 bg-white/5 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const cfg = STAGE_CONFIG[stage] ?? STAGE_CONFIG.workspace;
  const currentStep = stageToStep[stage] ?? 3;

  return (
    <div className="relative group mb-4">
      {/* Glow */}
      <div className={`absolute inset-0 bg-gradient-to-r ${cfg.cardGlow} rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity`} />

      <div className={`glass p-6 sm:p-8 rounded-2xl border ${cfg.cardBorder} relative shadow-lg`}>

        {/* Mini progress stepper */}
        <div className="flex items-center gap-1.5 mb-5">
          {PROGRESS_STEPS.map((step, i) => {
            const isDone    = i < currentStep;
            const isActive  = i === currentStep;
            const isFuture  = i > currentStep;
            return (
              <div key={step.key} className="flex items-center gap-1.5">
                <div className="flex flex-col items-center gap-0.5">
                  <div
                    className="flex items-center justify-center rounded-full text-[0.5rem] font-bold"
                    style={{
                      width: 18, height: 18,
                      background: isDone
                        ? 'rgba(52,211,153,0.2)'
                        : isActive
                          ? 'rgba(59,130,246,0.2)'
                          : 'rgba(255,255,255,0.05)',
                      color: isDone
                        ? '#34D399'
                        : isActive
                          ? '#60A5FA'
                          : 'rgba(255,255,255,0.2)',
                      border: `1px solid ${
                        isDone ? 'rgba(52,211,153,0.3)' :
                        isActive ? 'rgba(59,130,246,0.35)' :
                        'rgba(255,255,255,0.07)'
                      }`,
                    }}
                  >
                    {isDone
                      ? <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      : i + 1
                    }
                  </div>
                  <span
                    className="text-[0.5rem] font-medium hidden sm:block"
                    style={{ color: isDone ? 'rgba(52,211,153,0.6)' : isActive ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)' }}
                  >
                    {step.label}
                  </span>
                </div>
                {i < PROGRESS_STEPS.length - 1 && (
                  <div
                    style={{
                      width: 24, height: 1,
                      background: isDone ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.07)',
                      marginBottom: 10,
                    }}
                  />
                )}
              </div>
            );
          })}

          {/* Stage badge */}
          <span
            className="ml-auto text-[0.55rem] font-mono font-semibold px-2 py-0.5 rounded-full border shrink-0"
            style={{
              color: cfg.badgeColor,
              borderColor: `${cfg.badgeColor}40`,
              background: `${cfg.badgeColor}12`,
            }}
          >
            {cfg.badge}
          </span>
        </div>

        {/* Main content row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className={`p-3 ${cfg.iconBg} rounded-xl ${cfg.iconColor} border ${cfg.iconBorder} shadow-inner shrink-0`}>
              {cfg.icon}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 tracking-tight mb-1">{cfg.title}</h2>
              <p className="text-sm text-slate-400 leading-relaxed max-w-lg">{cfg.description}</p>
            </div>
          </div>

          <Link to={`/projects/${projectId}${cfg.routeSuffix}`} className="shrink-0 w-full sm:w-auto">
            <button className={`w-full sm:w-auto px-6 py-3 ${cfg.btnClass} rounded-xl font-semibold transition-all flex items-center justify-center gap-2`}>
              {cfg.btnLabel}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

const categoryColors = {
  'Web App': 'indigo', Mobile: 'green', API: 'yellow', DevOps: 'slate', 'AI / ML': 'red',
};

const ProjectDetail = () => {
  const { id }    = useParams();
  const { currentProject, loading, error } = useProjectsContext();
  const { handleFetchProjectById, handleUpdateProject, handleDeleteProject } = useProjects();
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const workflowStage = useWorkflowStage(id);

  useEffect(() => {
    handleFetchProjectById(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleUpdate = async (formData) => {
    const success = await handleUpdateProject(id, formData);
    if (success) setIsEditing(false);
  };

  const confirmDelete = () => {
    setShowConfirmDelete(true);
  };

  const handleExecuteDelete = () => {
    handleDeleteProject(id);
    setShowConfirmDelete(false);
  };

  if (loading && !currentProject) return <DashboardLayout><PageSkeleton /></DashboardLayout>;

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

          {error && !currentProject && (
            <ErrorState 
              message={error.message || error} 
              onRetry={() => handleFetchProjectById(id)} 
              className="mb-6"
            />
          )}
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

              {/* Smart Workflow CTA — stage-aware, guides user to correct next step */}
              <WorkflowCTA projectId={id} stage={workflowStage} />

              {/* Metadata */}
              <p className="mt-6 text-xs text-slate-500/70 text-right flex items-center justify-end gap-1.5 font-medium">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                Created {new Date(currentProject.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </>
          )}
        </div>
      )}

      <ConfirmDialog 
        isOpen={showConfirmDelete}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        confirmText="Delete Project"
        onConfirm={handleExecuteDelete}
        onCancel={() => setShowConfirmDelete(false)}
        isPending={loading}
      />
    </DashboardLayout>
  );
};

export default ProjectDetail;
