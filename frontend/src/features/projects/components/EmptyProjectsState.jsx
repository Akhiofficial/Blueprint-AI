import { Link } from 'react-router-dom';

/**
 * EmptyProjectsState
 *
 * Shown on the Dashboard when the authenticated user has no projects yet.
 * Product-focused: explains what BlueprintAI produces, not generic empty-state copy.
 */
const EmptyProjectsState = () => (
  <div
    className="relative flex flex-col items-center justify-center text-center animate-fade-in"
    style={{ paddingTop: '4rem', paddingBottom: '5rem' }}
  >
    {/* Blueprint grid icon */}
    <div
      className="flex items-center justify-center mb-6 rounded-xl"
      style={{
        width: 52,
        height: 52,
        background: 'rgba(59,130,246,0.08)',
        border: '1px solid rgba(59,130,246,0.2)',
      }}
    >
      <svg width="22" height="22" viewBox="0 0 16 16" fill="none" aria-hidden>
        <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="#3B82F6" strokeWidth="1.2" />
        <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="#22D3EE" strokeWidth="1.2" opacity="0.8" />
        <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="#22D3EE" strokeWidth="1.2" opacity="0.6" />
        <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="#3B82F6" strokeWidth="1.2" opacity="0.5" />
      </svg>
    </div>

    <p
      className="bp-mono uppercase mb-3"
      style={{ fontSize: '0.62rem', letterSpacing: '0.16em', color: '#22D3EE' }}
    >
      BLUEPRINTAI
    </p>

    <h2
      className="text-xl font-semibold mb-2"
      style={{ color: 'rgba(255,255,255,0.85)' }}
    >
      Your blueprint workspace starts here.
    </h2>

    <p
      className="text-sm leading-relaxed mb-3 max-w-sm"
      style={{ color: 'rgba(255,255,255,0.3)' }}
    >
      Create your first software project and turn your idea into a
      full set of planning documents.
    </p>

    {/* Artifact list — product-focused */}
    <p
      className="bp-mono mb-8"
      style={{ fontSize: '0.65rem', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.2)' }}
    >
      BRD · SRS · User Stories · REST API · Database Schema
    </p>

    <Link
      to="/projects/new"
      id="empty-state-cta"
      className="dash-btn inline-flex items-center gap-2 px-6 py-3 text-sm"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden
      >
        <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      Create Your First Project
    </Link>
  </div>
);

export default EmptyProjectsState;
