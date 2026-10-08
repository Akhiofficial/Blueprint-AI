/**
 * UnsavedChangesDialog.jsx
 *
 * Three-action confirmation dialog shown when the user tries to switch
 * workspace documents while the current document has unsaved edits.
 *
 * Actions:
 *   Cancel          — stay on current document, keep draft
 *   Discard & Switch — discard draft, switch immediately
 *   Save & Switch    — save first, then switch (disabled while saving)
 *
 * Reuses the project's existing visual design language (glass card, dark theme).
 */

import { useEffect } from 'react';

const UnsavedChangesDialog = ({
  isOpen,
  fromDocLabel,
  toDocLabel,
  isSaving,
  onCancel,
  onDiscard,
  onSaveAndSwitch,
}) => {
  // Keyboard shortcuts: Escape -> Cancel
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape' && !isSaving) onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, isSaving, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="unsaved-dialog-title"
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: '#111827',
          border: '1px solid rgba(255,255,255,0.09)',
        }}
      >
        {/* Header */}
        <div className="p-6">
          {/* Warning icon */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          <h3
            id="unsaved-dialog-title"
            className="text-lg font-semibold mb-2 text-white"
          >
            Unsaved Changes
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {fromDocLabel ? (
              <>You have unsaved changes in <span className="font-semibold text-white">{fromDocLabel}</span>.</>
            ) : (
              'You have unsaved changes in this document.'
            )}
            {toDocLabel ? (
              <> If you switch to <span className="font-semibold text-white">{toDocLabel}</span> now, your changes will be discarded.</>
            ) : (
              ' If you switch documents now, your changes will be discarded.'
            )}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2.5 px-6 py-4 bg-surface-bg/50 border-t border-surface-border">
          {/* Save & Switch - primary action */}
          <button
            id="unsaved-dialog-save-switch"
            onClick={onSaveAndSwitch}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer"
            style={{
              background: isSaving
                ? 'rgba(59,130,246,0.4)'
                : 'linear-gradient(135deg,#1E40AF,#3B82F6)',
              color: '#fff',
              border: 'none',
              opacity: isSaving ? 0.8 : 1,
            }}
          >
            {isSaving ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Saving &amp; Switching…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                Save &amp; Switch
              </>
            )}
          </button>

          {/* Discard & Switch - destructive */}
          <button
            id="unsaved-dialog-discard"
            onClick={onDiscard}
            disabled={isSaving}
            className="w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#F87171',
            }}
            onMouseEnter={e => {
              if (!isSaving) {
                e.currentTarget.style.background = 'rgba(239,68,68,0.16)';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
            }}
          >
            Discard &amp; Switch
          </button>

          {/* Cancel - stay here */}
          <button
            id="unsaved-dialog-cancel"
            onClick={onCancel}
            disabled={isSaving}
            className="w-full px-4 py-2.5 rounded-lg text-sm font-medium text-surface-text bg-surface-card border border-surface-border hover:bg-surface-border transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnsavedChangesDialog;
