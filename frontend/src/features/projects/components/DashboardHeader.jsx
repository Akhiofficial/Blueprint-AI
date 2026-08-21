import { Link } from 'react-router-dom';
import { getGreeting } from '../utils/dashboardUtils';

/**
 * DashboardHeader
 *
 * The primary header shown at the top of the Dashboard.
 * Greets the authenticated user by name, provides a brief product-oriented
 * subtitle, and presents the primary "Create New Project" CTA.
 *
 * Props:
 *   userName  {string} — First name or full name from auth context.
 *   projectCount {number} — Used to tune subtitle copy.
 */
const DashboardHeader = ({ userName, projectCount = 0 }) => {
  const greeting = getGreeting();
  const firstName = userName?.split(' ')[0] ?? 'there';

  return (
    <header className="mb-10 animate-fade-in">
      {/* Eyebrow */}
      <p
        className="bp-mono uppercase mb-3"
        style={{ fontSize: '0.62rem', letterSpacing: '0.16em', color: '#22D3EE' }}
      >
        BLUEPRINTAI / DASHBOARD
      </p>

      {/* Greeting — white-to-silver gradient matching landing page h1 style */}
      <h1
        className="text-2xl sm:text-3xl font-bold mb-2 tracking-tight"
      >
        <span
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {greeting},{' '}{firstName}.
        </span>
      </h1>

      {/* Subtitle */}
      <p
        className="text-sm leading-relaxed mb-6 max-w-md"
        style={{ color: 'rgba(255,255,255,0.35)' }}
      >
        {projectCount === 0
          ? 'Turn your software idea into a structured development blueprint.'
          : 'Continue where you left off, or start something new.'}
      </p>

      {/* Primary CTA — dash-btn: softer deep-to-bright blue gradient */}
      <Link
        to="/projects/new"
        id="dashboard-create-project-cta"
        className="dash-btn inline-flex items-center gap-2 px-5 py-2.5 text-sm"
        aria-label="Create a new project"
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
          <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        Create New Project
      </Link>
    </header>
  );
};

export default DashboardHeader;
