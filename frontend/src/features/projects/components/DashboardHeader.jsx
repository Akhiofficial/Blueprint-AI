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
    <header className="mb-8 animate-fade-in">
      {/* Greeting */}
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1.5">
        {greeting},{' '}{firstName}.
      </h1>

      {/* Subtitle */}
      <p className="text-sm leading-relaxed text-slate-400 mb-5 max-w-lg font-normal">
        {projectCount === 0
          ? 'Turn your software idea into a structured development blueprint.'
          : 'Continue where you left off, or start something new.'}
      </p>

      {/* Primary CTA — BlueprintAI blue action */}
      <Link
        to="/projects/new"
        id="dashboard-create-project-cta"
        className="dash-btn inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg shadow-sm"
        aria-label="Create a new project"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Create New Project
      </Link>
    </header>
  );
};

export default DashboardHeader;
