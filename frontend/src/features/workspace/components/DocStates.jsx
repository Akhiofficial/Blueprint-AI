import React from 'react';

/**
 * Skeleton loader for document content area
 */
export const DocumentSkeleton = () => (
  <div className="px-6 py-5 space-y-5 animate-pulse">
    <div className="skeleton h-5 rounded-lg w-1/3" />
    <div className="skeleton h-3.5 rounded-lg w-full" />
    <div className="skeleton h-3.5 rounded-lg w-5/6" />
    <div className="skeleton h-3.5 rounded-lg w-4/5" />
    <div className="mt-6 skeleton h-5 rounded-lg w-1/4" />
    <div className="skeleton h-3.5 rounded-lg w-full" />
    <div className="skeleton h-3.5 rounded-lg w-3/4" />
    <div className="mt-6 skeleton h-28 rounded-xl w-full" />
  </div>
);

/**
 * Error state with retry button
 */
export const DocError = ({ onRetry }) => (
  <div className="flex flex-col items-center justify-center py-20 px-8 text-center ws-enter-up">
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
        <path d="M10 7v4M10 13.5h.01" stroke="#F87171" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M3 17L10 3l7 14H3z" stroke="#F87171" strokeWidth="1.3" strokeLinejoin="round" />
      </svg>
    </div>
    <h3 className="text-sm font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.75)' }}>
      Unable to load document
    </h3>
    <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.35)' }}>
      There was a problem loading this blueprint document.
    </p>
    <button
      id="doc-retry-btn"
      onClick={onRetry}
      className="text-xs px-4 py-2 rounded-lg font-medium transition-all"
      style={{
        background: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.12)',
        color: 'rgba(255,255,255,0.65)',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.11)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
    >
      ↺ Try Again
    </button>
  </div>
);

/**
 * Empty / Not Generated state with generator action
 */
export const DocEmpty = ({ docId, docLabel, onGenerate, isGenerating, error }) => {
  const canGenerate = !!onGenerate;

  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center ws-enter-up">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.12)' }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
          <rect x="3" y="3" width="14" height="14" rx="3" stroke="rgba(255,255,255,0.25)" strokeWidth="1.3" strokeDasharray="3 2" />
          <path d="M10 8v4M8 10h4" stroke="rgba(255,255,255,0.3)" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </div>
      <h3 className="text-sm font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
        {docLabel} not generated yet
      </h3>
      <p className="text-xs mb-5 max-w-xs" style={{ color: 'rgba(255,255,255,0.3)', lineHeight: 1.65 }}>
        Generate your {docLabel} from your requirements and prerequisite documents.
      </p>

      {error && (
        <div
          className="mb-5 px-4 py-2.5 rounded-lg text-xs max-w-md text-left"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#FCA5A5' }}
        >
          <div className="font-semibold mb-0.5">Generation Failed</div>
          <div>{error}</div>
        </div>
      )}

      <button
        id={`generate-${docId}-btn`}
        onClick={canGenerate ? onGenerate : undefined}
        disabled={!canGenerate || isGenerating}
        className="text-xs px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-1.5"
        style={{
          background: canGenerate ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.06)',
          border: canGenerate ? '1px solid rgba(59,130,246,0.35)' : '1px solid rgba(59,130,246,0.12)',
          color: canGenerate ? '#60A5FA' : 'rgba(96,165,250,0.45)',
          cursor: canGenerate ? 'pointer' : 'not-allowed',
          opacity: isGenerating ? 0.7 : 1,
        }}
        onMouseEnter={e => { if (canGenerate && !isGenerating) e.currentTarget.style.background = 'rgba(59,130,246,0.22)'; }}
        onMouseLeave={e => { if (canGenerate) e.currentTarget.style.background = 'rgba(59,130,246,0.15)'; }}
      >
        {isGenerating ? (
          <>
            <span className="w-3 h-3 rounded-full border-2 border-blue-400/30 border-t-blue-400 animate-spin" />
            Generating…
          </>
        ) : (
          <>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
              <path d="M5.5 1v4M3 4l2.5 2.5L8 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M1 9h9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            Generate {docLabel}
          </>
        )}
      </button>
    </div>
  );
};
