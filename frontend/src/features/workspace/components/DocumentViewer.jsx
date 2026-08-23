/**
 * DocumentViewer.jsx
 *
 * Center panel orchestrator in the Blueprint Workspace.
 * Responsibilities:
 *   1. Render the DocumentActions bar at the top.
 *   2. Route to the correct specialized renderer based on docType.
 *   3. Handle all document states: loading, empty, error, generating, view, edit.
 *   4. Manage inline section-level regeneration state (UI only — Phase 3 connects to API).
 *   5. Manage edit mode state per section.
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchDocument, saveDocument } from '../services/workspaceService';
import DocumentActions from './DocumentActions';
import ProseDocumentView from './ProseDocumentView';
import UserStoryView from './UserStoryView';
import ApiDocumentView from './ApiDocumentView';
import DatabaseView from './DatabaseView';
import GenerationStatus from './GenerationStatus';

// ─── Skeleton loader ──────────────────────────────────────────────────────────

const DocumentSkeleton = () => (
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

// ─── Error state ──────────────────────────────────────────────────────────────

const DocError = ({ onRetry }) => (
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

// ─── Empty state ──────────────────────────────────────────────────────────────

const DocEmpty = ({ docId, docLabel }) => (
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
      This document hasn't been generated yet. Generate it from your analyzed requirements.
    </p>
    <button
      id={`generate-${docId}-btn`}
      className="text-xs px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-1.5"
      style={{
        background: 'rgba(59,130,246,0.1)',
        border: '1px solid rgba(59,130,246,0.2)',
        color: '#60A5FA',
        cursor: 'not-allowed',
        opacity: 0.7,
      }}
      title="Individual generation available in Phase 3"
      disabled
    >
      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
        <path d="M5.5 1v4M3 4l2.5 2.5L8 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M1 9h9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
      Generate {docLabel}
    </button>
    <p className="mt-2 text-xs" style={{ color: 'rgba(255,255,255,0.18)' }}>
      Individual generation available in Phase 3
    </p>
  </div>
);

// ─── Route document type to correct renderer ──────────────────────────────────

const DocRenderer = ({ docType, document, isEditing, onFieldChange, regenSectionId, onRegenSection }) => {
  switch (docType) {
    case 'BRD':
    case 'SRS':
      return (
        <ProseDocumentView
          document={document}
          isEditing={isEditing}
          onFieldChange={onFieldChange}
          regenSectionId={regenSectionId}
          onRegenSection={onRegenSection}
        />
      );
    case 'UserStories':
      return (
        <UserStoryView
          document={document}
          regenStoryId={regenSectionId}
          onRegenStory={onRegenSection}
        />
      );
    case 'APISpec':
      return <ApiDocumentView document={document} />;
    case 'DBSchema':
      return <DatabaseView document={document} />;
    default:
      return (
        <p className="px-6 py-10 text-sm text-slate-500">
          Unknown document type: {docType}
        </p>
      );
  }
};

// ─── Main Component ───────────────────────────────────────────────────────────

const DocumentViewer = ({
  projectId,
  activeDocId,
  docStatuses,
  onDocumentLoaded,   // callback to inform parent of loaded doc (for header/context)
  onSaveStateChange,  // callback: 'saved' | 'saving' | 'unsaved' | null
  externalDocUpdate,  // When the chat panel updates the doc
  previewVersion,     // { versionNumber, createdAt, changes }
  onClearPreview,     // callback to clear preview
  triggerSave,        // Trigger save from parent
}) => {
  const [loadState, setLoadState]       = useState('idle'); // idle | loading | ready | error | empty
  const [document, setDocument]         = useState(null);
  const [isEditing, setIsEditing]       = useState(false);
  const [isSaving, setIsSaving]         = useState(false);
  const [regenSectionId, setRegenSectionId] = useState(null);
  const [editChanges, setEditChanges]   = useState({});

  // ── Load document when active doc changes ──
  const loadDocument = useCallback(async () => {
    if (!activeDocId || !projectId) return;

    setLoadState('loading');
    setDocument(null);
    setIsEditing(false);
    setEditChanges({});
    onSaveStateChange?.(null);

    try {
      const doc = await fetchDocument(projectId, activeDocId);
      setDocument(doc);
      setLoadState('ready');
      onDocumentLoaded?.(doc);
    } catch (err) {
      if (err.message === 'NOT_GENERATED') {
        setLoadState('empty');
      } else {
        setLoadState('error');
      }
    }
  }, [activeDocId, projectId]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  // ── Sync external updates (e.g. from ChatPanel) ──
  useEffect(() => {
    if (externalDocUpdate && document && externalDocUpdate.type === document.type) {
      setDocument(externalDocUpdate);
    }
  }, [externalDocUpdate]);

  // ── Editing handlers ──
  const handleEdit = () => {
    setIsEditing(true);
    onSaveStateChange?.('unsaved');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditChanges({});
    onSaveStateChange?.(null);
  };

  const handleFieldChange = (sectionId, value) => {
    setEditChanges(prev => ({ ...prev, [sectionId]: value }));
  };

  const handleSave = async () => {
    if (!document) return;
    setIsSaving(true);
    onSaveStateChange?.('saving');
    try {
      const updated = await saveDocument(projectId, activeDocId, { ...document, editChanges });
      setDocument(updated);
      setIsEditing(false);
      setEditChanges({});
      onSaveStateChange?.('saved');
      onDocumentLoaded?.(updated);
      // Auto-clear saved state after 3s
      setTimeout(() => onSaveStateChange?.(null), 3000);
    } catch {
      onSaveStateChange?.('unsaved');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Trigger save from parent ──
  useEffect(() => {
    if (triggerSave > 0) {
      handleSave();
    }
  }, [triggerSave]);

  // ── Section regeneration (UI only — Phase 3 connects to API) ──
  const handleRegenSection = async (sectionId) => {
    // [DEMO] Phase 3: replace with api.post(`/api/projects/${projectId}/documents/${activeDocId}/sections/${sectionId}/regenerate`)
    setRegenSectionId(sectionId);
    await new Promise(r => setTimeout(r, 2000));
    setRegenSectionId(null);
  };

  // ── Document status ──
  const docStatus = docStatuses?.[activeDocId]?.status || 'not_generated';

  // ── Generating state ──
  if (docStatus === 'generating') {
    return <GenerationStatus currentStageIndex={2} />;
  }

  return (
    <div className="flex flex-col h-full min-h-0 relative">
      {/* Actions bar (hidden in preview mode) */}
      {!previewVersion && (
        <DocumentActions
          docId={activeDocId}
          docStatus={docStatus}
          isEditing={isEditing}
          onEdit={handleEdit}
          onCancelEdit={handleCancelEdit}
          onSave={handleSave}
          onRegenerate={loadDocument}
          isSaving={isSaving}
        />
      )}

      {/* Preview Banner */}
      {previewVersion && (
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
              onClick={() => {
                window.alert('Restore functionality pending backend support in Phase 3.');
              }}
              className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#FCD34D' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245, 158, 11, 0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245, 158, 11, 0.2)'; }}
            >
              Restore Version
            </button>
          </div>
        </div>
      )}

      {/* Document content area */}
      <div className={`flex-1 overflow-y-auto ws-panel ${previewVersion ? 'opacity-80' : ''}`}>
        {loadState === 'loading' && <DocumentSkeleton />}
        {loadState === 'error'   && <DocError onRetry={loadDocument} />}
        {loadState === 'empty'   && <DocEmpty docId={activeDocId} docLabel={activeDocId} />}

        {loadState === 'ready' && document && (
          <DocRenderer
            docType={activeDocId}
            document={document}
            isEditing={isEditing}
            onFieldChange={handleFieldChange}
            regenSectionId={regenSectionId}
            onRegenSection={handleRegenSection}
          />
        )}
      </div>
    </div>
  );
};

export default DocumentViewer;
