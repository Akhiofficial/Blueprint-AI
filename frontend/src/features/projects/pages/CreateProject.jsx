import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../layouts/DashboardLayout';
import ProjectForm from '../components/ProjectForm';
import { useProjectsContext } from '../projects.context';
import useProjects from '../hooks/useProjects';

import WorkflowIndicator from '../../../components/common/WorkflowIndicator';

// ── Create Project Page ───────────────────────────────────────────────────────
const CreateProject = () => {
  const { loading, error } = useProjectsContext();
  const { handleCreateProject } = useProjects();
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl animate-fade-in">

        {/* ── Workflow indicator ── */}
        <WorkflowIndicator current={0} />

        {/* ── Page header ── */}
        <header className="mb-7">
          {/* Eyebrow */}
          <p
            className="bp-mono uppercase mb-3"
            style={{ fontSize: '0.62rem', letterSpacing: '0.16em', color: '#22D3EE' }}
          >
            BLUEPRINTAI / NEW PROJECT
          </p>

          {/* Title — white → silver gradient */}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            <span
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.55) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Create a new blueprint.
            </span>
          </h1>

          <p
            className="text-sm leading-relaxed max-w-md"
            style={{ color: 'rgba(255,255,255,0.32)' }}
          >
            Tell us about the software you're planning to build. BlueprintAI will use this
            to generate your full planning documents.
          </p>
        </header>

        {/* ── Form card ── */}
        <div
          className="rounded-2xl p-6 sm:p-8 animate-slide-up"
          style={{
            background: '#11161D',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 8px 40px rgba(0,0,0,0.45)',
          }}
        >
          <ProjectForm
            onSubmit={handleCreateProject}
            isLoading={loading}
            error={error}
            submitLabel="Create Project"
            onCancel={() => navigate('/projects')}
          />
        </div>

        {/* ── Subtle footnote ── */}
        <p
          className="mt-5 text-center bp-mono"
          style={{ fontSize: '0.6rem', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.14)' }}
        >
          BRD · SRS · USER STORIES · REST API · DATABASE SCHEMA
        </p>
      </div>
    </DashboardLayout>
  );
};

export default CreateProject;
