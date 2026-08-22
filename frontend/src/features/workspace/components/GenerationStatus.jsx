/**
 * GenerationStatus.jsx
 *
 * Full-workspace generation progress overlay shown when the Blueprint Engine
 * is running (status === 'generating' for any document).
 *
 * Displays a staged checklist — does NOT show fake percentages.
 * When generation is completed it fades out automatically.
 *
 * Phase 3: connect to real generation status API.
 */

const STAGES = [
  { id: 'requirements', label: 'Understanding requirements' },
  { id: 'context',      label: 'Building project context' },
  { id: 'brd',         label: 'Generating BRD' },
  { id: 'srs',         label: 'Generating SRS' },
  { id: 'stories',     label: 'Generating User Stories' },
  { id: 'api',         label: 'Generating REST API design' },
  { id: 'db',          label: 'Generating Database Schema' },
];

const StageIcon = ({ state }) => {
  if (state === 'done') {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-label="Complete">
        <circle cx="7" cy="7" r="6" fill="rgba(16,185,129,0.1)" stroke="#10B981" strokeWidth="1.2" />
        <path d="M4 7l2 2.5L10 4.5" stroke="#10B981" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (state === 'active') {
    return (
      <span
        className="w-3.5 h-3.5 rounded-full border-2 border-blue-400/30 border-t-blue-400 animate-spin"
        aria-label="In progress"
      />
    );
  }
  // pending
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-label="Pending">
      <circle cx="7" cy="7" r="5.5" stroke="rgba(255,255,255,0.15)" strokeWidth="1.2" strokeDasharray="2.5 2" />
    </svg>
  );
};

const GenerationStatus = ({ currentStageIndex = 0 }) => {
  return (
    <div
      className="flex flex-col items-center justify-center h-full py-20 px-8 ws-enter-up"
      style={{ minHeight: 400 }}
    >
      {/* Animated icon */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
        style={{
          background: 'rgba(59,130,246,0.08)',
          border: '1px solid rgba(59,130,246,0.2)',
          boxShadow: '0 0 30px rgba(59,130,246,0.12)',
        }}
      >
        <span className="w-6 h-6 rounded-full border-2 border-blue-400/30 border-t-blue-400 animate-spin" />
      </div>

      <h2 className="text-lg font-bold mb-1" style={{ color: 'rgba(255,255,255,0.9)' }}>
        Generating Blueprint
      </h2>
      <p className="text-sm mb-8 text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>
        BlueprintAI is analyzing your requirements and building structured documentation.
      </p>

      {/* Stage checklist */}
      <div
        className="w-full max-w-sm space-y-3 rounded-2xl px-5 py-5"
        style={{
          background: '#11161D',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {STAGES.map((stage, idx) => {
          const state =
            idx < currentStageIndex ? 'done'
            : idx === currentStageIndex ? 'active'
            : 'pending';

          return (
            <div
              key={stage.id}
              className="flex items-center gap-3 transition-all duration-300"
              style={{ opacity: state === 'pending' ? 0.35 : 1 }}
            >
              <StageIcon state={state} />
              <span
                className="text-sm"
                style={{
                  color: state === 'done' ? 'rgba(255,255,255,0.55)'
                       : state === 'active' ? 'rgba(255,255,255,0.95)'
                       : 'rgba(255,255,255,0.35)',
                  fontWeight: state === 'active' ? 500 : 400,
                }}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>

      <p className="mt-5 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
        Phase 3: connected to real generation events via polling or WebSocket.
      </p>
    </div>
  );
};

export default GenerationStatus;
