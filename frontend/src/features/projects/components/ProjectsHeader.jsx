import { Link } from 'react-router-dom';

/**
 * ProjectsHeader
 *
 * Page header for the /projects management hub.
 * Gradient text treatment matches the Dashboard greeting style.
 */
const ProjectsHeader = ({ count }) => (
  <header className="mb-8 animate-fade-in">
    {/* Eyebrow */}
    <p
      className="bp-mono uppercase mb-3"
      style={{ fontSize: '0.62rem', letterSpacing: '0.16em', color: '#22D3EE' }}
    >
      BLUEPRINTAI / PROJECTS
    </p>

    {/* Title — white → silver gradient */}
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          <span
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.55) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Projects
          </span>
        </h1>
        <p
          className="text-sm leading-relaxed max-w-md"
          style={{ color: 'rgba(255,255,255,0.32)' }}
        >
          Manage your software projects and continue building their development blueprints.
        </p>
      </div>

      {/* Primary CTA */}
      <Link
        to="/projects/new"
        id="projects-page-new-project-cta"
        className="dash-btn inline-flex items-center gap-2 px-5 py-2.5 text-sm shrink-0 self-start sm:self-auto"
        aria-label="Create a new project"
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
          <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        New Project
      </Link>
    </div>
  </header>
);

export default ProjectsHeader;
