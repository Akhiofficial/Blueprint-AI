/**
 * BlueprintSidebar.jsx
 *
 * Left navigation panel for the Blueprint Workspace.
 * Shows 5 numbered blueprint artifact items with status dots.
 *
 * Status indicators:
 *   ✓ ready         — document generated and available
 *   ● generating    — AI generation currently running
 *   ◐ in_progress   — partially generated / draft
 *   ○ not_generated — document not yet created
 *   ✕ failed        — generation failed
 */

import { BLUEPRINT_DOCS } from '../services/workspaceService';

// Status dot component
const StatusDot = ({ status }) => {
  if (status === 'ready') {
    return (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-label="Complete" title="Complete">
        <circle cx="6" cy="6" r="5" stroke="#34D399" strokeWidth="1.2" fill="rgba(16,185,129,0.08)" />
        <path d="M3.5 6l1.8 1.8L8.5 4.5" stroke="#34D399" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (status === 'generating') {
    return (
      <span
        className="w-3 h-3 rounded-full border-2 border-blue-400/30 border-t-blue-400 animate-spin"
        aria-label="Generating"
        title="Generating"
      />
    );
  }
  if (status === 'failed') {
    return (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-label="Failed" title="Failed">
        <circle cx="6" cy="6" r="5" stroke="#F87171" strokeWidth="1.2" fill="rgba(239,68,68,0.08)" />
        <path d="M4 4l4 4M8 4l-4 4" stroke="#F87171" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    );
  }
  // not_generated (default)
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-label="Not generated" title="Not generated">
      <circle cx="6" cy="6" r="4.5" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" strokeDasharray="2 2" />
    </svg>
  );
};

const StatusLabel = ({ status }) => {
  const labels = {
    ready: { text: 'Ready', color: '#34D399' },
    generating: { text: 'Generating', color: '#60A5FA' },
    failed: { text: 'Failed', color: '#F87171' },
    not_generated: { text: 'Not generated', color: 'rgba(255,255,255,0.2)' },
  };
  const cfg = labels[status] || labels.not_generated;
  return (
    <span style={{ fontSize: '0.58rem', color: cfg.color, fontFamily: 'inherit' }}>
      {cfg.text}
    </span>
  );
};

const BlueprintSidebar = ({
  activeDocId,
  docStatuses,   // { BRD: { status }, SRS: { status }, ... }
  onSelectDoc,
  isOpen,        // mobile drawer open state
  onClose,
  width = 220,
}) => {
  const handleSelect = (docId) => {
    onSelectDoc(docId);
    onClose?.();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0 lg:z-auto
          ws-enter-left
        `}
        style={{
          width: width,
          background: '#0D1117',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          paddingTop: 0,
        }}
        aria-label="Blueprint navigation"
      >
        {/* Header */}
        <div
          className="px-4 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p
            className="bp-mono uppercase"
            style={{ fontSize: '0.58rem', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.25)' }}
          >
            Blueprint Artifacts
          </p>
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-gray-400 hover:text-white cursor-pointer"
            aria-label="Close sidebar"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {BLUEPRINT_DOCS.map((doc) => {
            const isActive = activeDocId === doc.id;
            const statusInfo = docStatuses?.[doc.id] || { status: 'not_generated' };

            return (
              <button
                key={doc.id}
                id={`ws-nav-${doc.id.toLowerCase()}`}
                onClick={() => handleSelect(doc.id)}
                className={`ws-nav-item w-full text-left ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Number */}
                <span
                  className="bp-mono shrink-0"
                  style={{
                    fontSize: '0.55rem',
                    letterSpacing: '0.1em',
                    color: isActive ? '#22D3EE' : 'rgba(255,255,255,0.18)',
                    width: 18,
                  }}
                >
                  {doc.num}
                </span>

                {/* Label block */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-xs font-medium leading-tight truncate"
                    style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.65)' }}
                  >
                    {doc.label}
                  </p>
                  <StatusLabel status={statusInfo.status} />
                </div>

                {/* Status dot */}
                <span className="shrink-0">
                  <StatusDot status={statusInfo.status} />
                </span>
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div
          className="px-4 py-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.18)', lineHeight: 1.5 }}>
            Select a document to view, edit, or regenerate.
          </p>
        </div>
      </aside>
    </>
  );
};

export default BlueprintSidebar;
