/**
 * ExportDialog.jsx
 *
 * Export blueprint documents modal.
 * UI architecture only — export backend not yet implemented.
 * Does NOT fake a successful download.
 *
 * Shows:
 *   - Checkboxes for each document type
 *   - Format selector: PDF / Markdown
 *   - Export button with "not yet available" notice
 */

import { useState } from 'react';
import { BLUEPRINT_DOCS } from '../services/workspaceService';

const ExportDialog = ({ isOpen, onClose, docStatuses }) => {
  const [selectedDocs, setSelectedDocs] = useState(
    BLUEPRINT_DOCS.filter(d => docStatuses?.[d.id]?.status === 'ready').map(d => d.id)
  );
  const [format, setFormat] = useState('pdf');

  if (!isOpen) return null;

  const toggleDoc = (id) => {
    setSelectedDocs(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const handleExport = () => {
    // [DEMO] Export functionality not yet implemented on the backend.
    // Phase 3: POST /api/projects/:id/export { docTypes: selectedDocs, format }
    alert('Export functionality will be available in Phase 3 when the Blueprint Engine is implemented.');
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-dialog-title"
    >
      {/* Dialog */}
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden animate-slide-up"
        style={{
          background: '#0D1117',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div>
            <h2 id="export-dialog-title" className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>
              Export Blueprint
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Select documents and format
            </p>
          </div>
          <button
            id="export-dialog-close"
            onClick={onClose}
            className="rounded-lg p-1.5 transition-colors"
            style={{ color: 'rgba(255,255,255,0.35)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
            aria-label="Close export dialog"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-5">
          {/* Document selection */}
          <div>
            <p
              className="bp-mono uppercase mb-3"
              style={{ fontSize: '0.58rem', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.3)' }}
            >
              Documents
            </p>
            <div className="space-y-2">
              {BLUEPRINT_DOCS.map(doc => {
                const status = docStatuses?.[doc.id]?.status || 'not_generated';
                const isReady = status === 'ready';
                const isChecked = selectedDocs.includes(doc.id);

                return (
                  <label
                    key={doc.id}
                    htmlFor={`export-doc-${doc.id}`}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-all"
                    style={{
                      background: isChecked ? 'rgba(59,130,246,0.06)' : 'rgba(255,255,255,0.02)',
                      border: isChecked ? '1px solid rgba(59,130,246,0.15)' : '1px solid rgba(255,255,255,0.05)',
                      opacity: isReady ? 1 : 0.45,
                      cursor: isReady ? 'pointer' : 'not-allowed',
                    }}
                  >
                    <input
                      id={`export-doc-${doc.id}`}
                      type="checkbox"
                      checked={isChecked}
                      disabled={!isReady}
                      onChange={() => isReady && toggleDoc(doc.id)}
                      className="w-3.5 h-3.5 rounded accent-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>
                        {doc.label}
                      </span>
                      {!isReady && (
                        <span className="ml-2 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                          (not generated)
                        </span>
                      )}
                    </div>
                    <span
                      className="bp-mono text-xs"
                      style={{
                        color: isReady ? '#34D399' : 'rgba(255,255,255,0.2)',
                        fontSize: '0.6rem',
                      }}
                    >
                      {isReady ? '✓' : '○'}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Format selection */}
          <div>
            <p
              className="bp-mono uppercase mb-3"
              style={{ fontSize: '0.58rem', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.3)' }}
            >
              Format
            </p>
            <div className="grid grid-cols-2 gap-2">
              {['pdf', 'markdown'].map(f => (
                <button
                  key={f}
                  id={`export-format-${f}`}
                  onClick={() => setFormat(f)}
                  className="py-3 rounded-xl text-xs font-medium transition-all flex flex-col items-center gap-1.5"
                  style={{
                    background: format === f ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)',
                    border: format === f ? '1px solid rgba(59,130,246,0.25)' : '1px solid rgba(255,255,255,0.07)',
                    color: format === f ? '#60A5FA' : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {f === 'pdf' ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <rect x="2" y="1" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M5 5h6M5 8h6M5 11h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <path d="M2 4l4 4-4 4M8 12h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {f === 'pdf' ? 'PDF' : 'Markdown'}
                </button>
              ))}
            </div>
          </div>

          {/* Phase 3 notice */}
          <div
            className="rounded-lg px-3 py-2.5 text-xs"
            style={{
              background: 'rgba(59,130,246,0.06)',
              border: '1px solid rgba(59,130,246,0.12)',
              color: '#93C5FD',
            }}
          >
            <span className="font-semibold">Phase 3 Notice:</span>{' '}
            Export functionality will be connected when the Blueprint Engine is implemented.
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-5 py-4 gap-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
        >
          <button
            onClick={onClose}
            className="text-xs px-4 py-2 rounded-lg font-medium transition-all"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.55)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
          >
            Cancel
          </button>
          <button
            id="export-submit-btn"
            onClick={handleExport}
            disabled={selectedDocs.length === 0}
            className="text-xs px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
            style={{
              background: selectedDocs.length > 0
                ? 'linear-gradient(135deg,#1E40AF,#3B82F6)'
                : 'rgba(255,255,255,0.06)',
              color: selectedDocs.length > 0 ? '#fff' : 'rgba(255,255,255,0.3)',
              border: 'none',
              cursor: selectedDocs.length > 0 ? 'pointer' : 'not-allowed',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M6 1v7M3 6l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M1 10h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            Export {selectedDocs.length > 0 ? `(${selectedDocs.length})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportDialog;
