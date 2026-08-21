import { Link } from 'react-router-dom';

/**
 * ProjectsEmptyState
 *
 * Empty state for the Projects page — shown when no projects exist,
 * or when search/filter yields no results.
 *
 * Props:
 *   isFiltered {boolean} — true when no results from search/filter
 *   onClear    {Function} — clears active filters
 */
const ProjectsEmptyState = ({ isFiltered = false, onClear }) => (
  <div
    className="flex flex-col items-center justify-center text-center rounded-2xl animate-fade-in"
    style={{
      paddingTop: '5rem',
      paddingBottom: '5.5rem',
      border: '1px dashed rgba(255,255,255,0.08)',
      background: 'rgba(255,255,255,0.008)',
    }}
  >
    {/* Icon */}
    <div
      className="flex items-center justify-center mb-6 rounded-xl"
      style={{
        width: 52,
        height: 52,
        background: 'rgba(59,130,246,0.07)',
        border: '1px solid rgba(59,130,246,0.18)',
      }}
    >
      {isFiltered ? (
        /* Search / no-results icon */
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
          <circle cx="9" cy="9" r="6" stroke="#3B82F6" strokeWidth="1.4" />
          <path d="M14 14l4 4" stroke="#3B82F6" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M7 9h4M9 7v4" stroke="#22D3EE" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
        </svg>
      ) : (
        /* Blueprint grid icon */
        <svg width="22" height="22" viewBox="0 0 16 16" fill="none" aria-hidden>
          <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="#3B82F6" strokeWidth="1.2" />
          <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="#22D3EE" strokeWidth="1.2" opacity="0.8" />
          <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="#22D3EE" strokeWidth="1.2" opacity="0.6" />
          <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="#3B82F6" strokeWidth="1.2" opacity="0.5" />
        </svg>
      )}
    </div>

    {/* Eyebrow */}
    <p
      className="bp-mono uppercase mb-3"
      style={{ fontSize: '0.62rem', letterSpacing: '0.16em', color: '#22D3EE' }}
    >
      {isFiltered ? 'NO RESULTS' : 'BLUEPRINTAI'}
    </p>

    {/* Heading — gradient text */}
    <h2 className="text-xl font-semibold mb-2">
      <span
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.5) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {isFiltered ? 'No projects match your filters.' : 'Your workspace is empty.'}
      </span>
    </h2>

    <p
      className="text-sm leading-relaxed mb-4 max-w-sm"
      style={{ color: 'rgba(255,255,255,0.28)' }}
    >
      {isFiltered
        ? 'Try adjusting your search term or clearing the active filters.'
        : 'Start with a software idea or requirement document and turn it into a structured development blueprint.'}
    </p>

    {!isFiltered && (
      <p
        className="bp-mono mb-8"
        style={{ fontSize: '0.64rem', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.18)' }}
      >
        BRD · SRS · User Stories · REST API · Database Schema
      </p>
    )}

    {isFiltered ? (
      <button
        onClick={onClear}
        className="dash-btn inline-flex items-center gap-2 px-5 py-2.5 text-sm"
        id="clear-filters-btn"
      >
        Clear Filters
      </button>
    ) : (
      <Link
        to="/projects/new"
        id="empty-state-create-project"
        className="dash-btn inline-flex items-center gap-2 px-6 py-3 text-sm"
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
          <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        Create New Project
      </Link>
    )}
  </div>
);

export default ProjectsEmptyState;
