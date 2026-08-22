/**
 * DocumentActions.jsx
 *
 * Action bar rendered above the document content area.
 * Displays: document title/subtitle, Edit, Regenerate, and per-document Export actions.
 * Also shows a "Regenerate Document" secondary action with a confirmation prompt.
 */

import { useState } from 'react';
import { BLUEPRINT_DOCS } from '../services/workspaceService';

const DocumentActions = ({
  docId,
  docStatus,       // 'ready' | 'generating' | 'not_generated' | 'failed'
  isEditing,
  onEdit,
  onCancelEdit,
  onSave,
  onRegenerate,    // regenerate full document — UI only if backend not implemented
  isSaving,
}) => {
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);

  const docMeta = BLUEPRINT_DOCS.find(d => d.id === docId);
  if (!docMeta) return null;

  const isReady = docStatus === 'ready';

  const handleRegenConfirm = () => {
    setShowRegenConfirm(false);
    onRegenerate?.();
  };

  return (
    <div
      className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 px-6 pt-5 pb-4"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Title block */}
      <div className="min-w-0">
        <div className="flex items-center gap-2.5 flex-wrap mb-0.5">
          <span
            className="bp-mono"
            style={{ fontSize: '0.58rem', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase' }}
          >
            {docMeta.num}
          </span>
          <h2 className="text-xl font-bold tracking-tight text-slate-100">
            {docMeta.label}
          </h2>
        </div>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {docMeta.subtitle}
        </p>
      </div>

      {/* Actions */}
      {isReady && (
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {isEditing ? (
            <>
              {/* In edit mode */}
              <button
                id="ws-doc-cancel-edit"
                onClick={onCancelEdit}
                className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
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
                id="ws-doc-save"
                onClick={onSave}
                disabled={isSaving}
                className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5"
                style={{
                  background: 'linear-gradient(135deg,#1E40AF,#3B82F6)',
                  color: '#fff',
                  border: 'none',
                  opacity: isSaving ? 0.7 : 1,
                }}
              >
                {isSaving ? (
                  <>
                    <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Saving…
                  </>
                ) : 'Save changes'}
              </button>
            </>
          ) : (
            <>
              {/* View mode */}
              <button
                id="ws-doc-edit"
                onClick={onEdit}
                className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.65)',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              >
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
                  <path d="M7.5 1.5l2 2L3 10H1V8L7.5 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                </svg>
                Edit
              </button>

              {/* Regenerate full document — secondary, less prominent */}
              {!showRegenConfirm ? (
                <button
                  id="ws-doc-regen"
                  onClick={() => setShowRegenConfirm(true)}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.35)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.35)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  }}
                  title="Regenerate entire document"
                >
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
                    <path d="M9.5 5.5A4 4 0 1 1 7 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    <path d="M7 0v3h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Regenerate
                </button>
              ) : (
                /* Confirm regen — warns about overwriting edits */
                <div
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs"
                  style={{
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    color: '#F87171',
                  }}
                >
                  <span>Overwrite edited content?</span>
                  <button
                    id="ws-doc-regen-confirm"
                    onClick={handleRegenConfirm}
                    className="font-semibold hover:text-red-300 transition-colors"
                  >
                    Yes, regenerate
                  </button>
                  <button
                    onClick={() => setShowRegenConfirm(false)}
                    style={{ color: 'rgba(255,255,255,0.4)' }}
                    className="hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentActions;
