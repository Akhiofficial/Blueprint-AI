import React from 'react';

/**
 * VersionPreviewBanner
 *
 * Warning banner displayed at the top of DocumentViewer when the user
 * is previewing an older document version snapshot.
 */
export const VersionPreviewBanner = ({
  previewVersion,
  isRestoring,
  onClearPreview,
  onRestore,
}) => {
  if (!previewVersion) return null;

  return (
    <div 
      className="flex items-center justify-between px-6 py-3"
      style={{
        background: 'rgba(245, 158, 11, 0.1)',
        borderBottom: '1px solid rgba(245, 158, 11, 0.2)',
      }}
    >
      <div className="flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: '#F59E0B' }}>
          <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM8 4v4.5l3 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-sm font-medium" style={{ color: '#FCD34D' }}>
          Viewing version {previewVersion.versionNumber}
        </span>
        <span className="text-xs" style={{ color: 'rgba(252, 211, 77, 0.7)' }}>
          — This is a previous version of this document.
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onClearPreview}
          className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
          style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
        >
          Back to Current
        </button>
        <button
          onClick={() => onRestore(previewVersion.versionNumber)}
          disabled={isRestoring}
          className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
          style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#FCD34D', opacity: isRestoring ? 0.6 : 1 }}
          onMouseEnter={e => { if (!isRestoring) e.currentTarget.style.background = 'rgba(245, 158, 11, 0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245, 158, 11, 0.2)'; }}
        >
          {isRestoring ? (
            <>
              <span className="w-3 h-3 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin" />
              Restoring…
            </>
          ) : (
            'Restore Version'
          )}
        </button>
      </div>
    </div>
  );
};

export default VersionPreviewBanner;
