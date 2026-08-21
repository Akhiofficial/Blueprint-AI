import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../layouts/DashboardLayout';
import ProjectForm from '../components/ProjectForm';
import { useProjectsContext } from '../projects.context';
import useProjects from '../hooks/useProjects';

// ── Workflow step indicator ───────────────────────────────────────────────────
// Subtle, non-checkout-style — shows where the user is in the BlueprintAI flow.
const WORKFLOW_STEPS = [
  { num: '01', label: 'Project' },
  { num: '02', label: 'Requirements' },
  { num: '03', label: 'Analysis' },
  { num: '04', label: 'Blueprint' },
];

const WorkflowIndicator = ({ current = 0 }) => (
  <div className="flex items-center gap-0 mb-8 animate-fade-in" aria-label="Workflow progress">
    {WORKFLOW_STEPS.map((step, i) => {
      const isActive = i === current;
      const isPast   = i < current;
      const isLast   = i === WORKFLOW_STEPS.length - 1;
      return (
        <div key={step.num} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <span
              className="bp-mono"
              style={{
                fontSize: '0.55rem',
                letterSpacing: '0.1em',
                color: isActive ? '#22D3EE' : isPast ? 'rgba(34,211,238,0.4)' : 'rgba(255,255,255,0.15)',
              }}
            >
              {step.num}
            </span>
            <span
              className="text-xs"
              style={{
                fontWeight: isActive ? 500 : 400,
                color: isActive ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.2)',
              }}
            >
              {step.label}
            </span>
            {/* Active underline */}
            <div
              style={{
                height: '1.5px',
                width: '100%',
                background: isActive
                  ? 'linear-gradient(90deg, #3B82F6, #22D3EE)'
                  : 'transparent',
                borderRadius: '1px',
                marginTop: '1px',
              }}
            />
          </div>

          {/* Connector */}
          {!isLast && (
            <div
              style={{
                width: '2rem',
                height: '1px',
                background: i < current
                  ? 'rgba(34,211,238,0.3)'
                  : 'rgba(255,255,255,0.07)',
                margin: '0 0.5rem',
                marginBottom: '0.75rem',
              }}
            />
          )}
        </div>
      );
    })}
  </div>
);

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
