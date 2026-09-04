/**
 * RequirementsSidebar.jsx
 * Right sidebar containing writing tips, generation scope list, and main action CTA button.
 */

import { Link } from 'react-router-dom';
import SectionLabel from './SectionLabel';

const CARD_STYLE = {
  background: '#11161D',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '12px',
  boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 8px 40px rgba(0,0,0,0.4)',
};

const RequirementsSidebar = ({ projectId, mode, file, isSubmitting, handleSubmit }) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Tips card */}
      <div style={CARD_STYLE} className="p-5">
        <SectionLabel>Writing tips</SectionLabel>
        <ul className="space-y-3 mt-1">
          {[
            { icon: '👥', text: 'Describe your target users and their roles' },
            { icon: '⚙️', text: 'List key features and functionality' },
            { icon: '🔄', text: 'Outline core user workflows' },
            { icon: '🚫', text: 'Note any constraints or assumptions' },
            { icon: '📊', text: 'Mention performance or scale requirements' },
          ].map(({ icon, text }) => (
            <li key={text} className="flex gap-2.5">
              <span style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>{icon}</span>
              <span
                className="text-xs leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                {text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* What BlueprintAI generates */}
      <div style={CARD_STYLE} className="p-5">
        <SectionLabel>Will generate</SectionLabel>
        <div className="space-y-2 mt-1">
          {['BRD', 'SRS', 'User Stories', 'REST API Design', 'Database Schema'].map((doc) => (
            <div key={doc} className="flex items-center gap-2">
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: 'rgba(34,211,238,0.4)',
                  flexShrink: 0,
                }}
              />
              <span
                className="text-xs"
                style={{ color: 'rgba(255,255,255,0.28)' }}
              >
                {doc}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA card */}
      <div style={CARD_STYLE} className="p-5 flex flex-col gap-3">
        {/* Analyze button */}
        <button
          id="analyze-requirements-btn"
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full inline-flex items-center justify-center gap-2 text-sm px-4 py-3 transition-all duration-150"
          style={{
            background: isSubmitting
              ? 'rgba(59,130,246,0.4)'
              : 'linear-gradient(135deg,#1E40AF 0%,#2563EB 55%,#3B82F6 100%)',
            borderRadius: '8px',
            color: '#fff',
            fontWeight: 500,
            border: 'none',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            boxShadow: isSubmitting ? 'none' : '0 1px 3px rgba(0,0,0,0.4),0 0 16px rgba(59,130,246,0.18)',
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.5),0 0 24px rgba(59,130,246,0.28)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.4),0 0 16px rgba(59,130,246,0.18)';
            e.currentTarget.style.transform = 'none';
          }}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span
                className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"
                aria-hidden
              />
              {mode === 'upload' ? 'Uploading…' : 'Saving…'}
            </>
          ) : (
            <>
              {mode === 'upload' && file ? 'Upload & Extract Text' : 'Analyze Requirements'}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path
                  d="M2 6h8M6.5 3L9.5 6l-3 3"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </>
          )}
        </button>

        {/* Back link */}
        <Link
          to={`/projects/${projectId}`}
          className="text-center text-xs transition-colors duration-150"
          style={{ color: 'rgba(255,255,255,0.25)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; }}
        >
          ← Back to project
        </Link>

        {/* Phase 2 note for the analyze button */}
        <p
          className="bp-mono text-center"
          style={{ fontSize: '0.57rem', letterSpacing: '0.04em', color: 'rgba(255,255,255,0.14)' }}
        >
          AI analysis is the next step
        </p>
      </div>
    </div>
  );
};

export default RequirementsSidebar;
