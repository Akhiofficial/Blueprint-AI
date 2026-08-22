/**
 * BlueprintHeader.jsx
 *
 * Top header bar for the Blueprint Workspace.
 * Displays: brand logo, breadcrumb, current document name,
 * save state indicator, and Export action button.
 */

import { Link } from 'react-router-dom';

// BlueprintAI grid icon — matches DashboardLayout BpIcon
const BpIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
    <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="#3B82F6" strokeWidth="1.2" />
    <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="#22D3EE" strokeWidth="1.2" opacity="0.8" />
    <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="#22D3EE" strokeWidth="1.2" opacity="0.6" />
    <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="#3B82F6" strokeWidth="1.2" opacity="0.5" />
  </svg>
);

// Save state indicator
const SaveState = ({ saveState }) => {
  if (saveState === 'saved') {
    return (
      <span className="ws-save-saved flex items-center gap-1.5 text-xs">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M2 6l2.5 2.5L10 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Saved
      </span>
    );
  }
  if (saveState === 'saving') {
    return (
      <span className="ws-save-saving flex items-center gap-1.5 text-xs">
        <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
        Saving…
      </span>
    );
  }
  if (saveState === 'unsaved') {
    return (
      <span className="ws-save-unsaved flex items-center gap-1.5 text-xs">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
          <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.4" />
          <path d="M5 3v2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="5" cy="7" r="0.6" fill="currentColor" />
        </svg>
        Unsaved changes
      </span>
    );
  }
  return null;
};

const BlueprintHeader = ({
  projectId,
  projectName,
  activeDocLabel,
  saveState,       // 'saved' | 'saving' | 'unsaved' | null
  onExport,
  onSave,
  isSidebarOpen,
  onToggleSidebar,
}) => {
  return (
    <header
      className="flex items-center justify-between px-4 gap-3 shrink-0"
      style={{
        height: 52,
        background: 'rgba(13,17,23,0.95)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 30,
      }}
    >
      {/* ── Left: Brand + Breadcrumb ── */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile sidebar toggle */}
        <button
          id="ws-sidebar-toggle"
          onClick={onToggleSidebar}
          className="lg:hidden rounded-lg p-1.5 transition-colors"
          style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}
          aria-label="Toggle navigation"
        >
          {isSidebarOpen ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          )}
        </button>

        {/* Brand mark */}
        <div
          className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg shrink-0"
          style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.22)' }}
        >
          <BpIcon size={15} />
        </div>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 min-w-0" aria-label="Breadcrumb">
          <Link
            to="/projects"
            className="hidden sm:block text-xs transition-colors"
            style={{ color: 'rgba(255,255,255,0.22)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.22)'; }}
          >
            Projects
          </Link>
          <span className="hidden sm:block" style={{ color: 'rgba(255,255,255,0.1)', fontSize: '0.65rem' }}>›</span>
          <Link
            to={`/projects/${projectId}`}
            className="text-xs truncate max-w-[120px] sm:max-w-[160px] transition-colors"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
            title={projectName}
          >
            {projectName || '…'}
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: '0.65rem' }}>›</span>
          <span
            className="bp-mono text-xs"
            style={{ color: '#22D3EE', fontSize: '0.62rem', letterSpacing: '0.08em' }}
          >
            Blueprint Workspace
          </span>
          {activeDocLabel && (
            <>
              <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: '0.65rem' }}>›</span>
              <span className="text-xs hidden md:block" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {activeDocLabel}
              </span>
            </>
          )}
        </nav>
      </div>

      {/* ── Right: Save state + actions ── */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Save state */}
        {saveState && <SaveState saveState={saveState} />}

        {/* Save button */}
        {saveState === 'unsaved' && (
          <button
            id="ws-save-btn"
            onClick={onSave}
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.7)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
          >
            Save
          </button>
        )}

        {/* Export button */}
        <button
          id="ws-export-btn"
          onClick={onExport}
          className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5"
          style={{
            background: 'linear-gradient(135deg,#1E40AF 0%,#2563EB 55%,#3B82F6 100%)',
            color: '#fff',
            border: 'none',
            boxShadow: '0 1px 3px rgba(0,0,0,0.4),0 0 12px rgba(59,130,246,0.2)',
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.5),0 0 16px rgba(59,130,246,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.4),0 0 12px rgba(59,130,246,0.2)'; }}
          aria-label="Export blueprint documents"
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
            <path d="M5.5 1v6M2.5 5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M1 9h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          Export
        </button>
      </div>
    </header>
  );
};

export default BlueprintHeader;
