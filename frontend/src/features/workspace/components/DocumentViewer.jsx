/**
 * DocumentViewer.jsx
 *
 * Center panel orchestrator in the Blueprint Workspace.
 * Responsibilities:
 *   1. Render the DocumentActions bar at the top (or preview banner during version view).
 *   2. Coordinate loading, saving, editing, version preview, and restoration.
 *   3. Delegate state views (loading, error, empty) to DocStates.
 *   4. Delegate document rendering to DocRenderer.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchDocument,
  saveDocument,
  generateDocument,
  restoreDocumentVersion,
  normalizeVersionContent,
  BLUEPRINT_DOCS,
} from '../services/workspaceService';
import DocumentActions from './DocumentActions';
import VersionPreviewBanner from './VersionPreviewBanner';
import DocRenderer from './DocRenderer';
import { DocumentSkeleton, DocError, DocEmpty } from './DocStates';
import GenerationStatus from './GenerationStatus';

const STAGE_INDEX_MAP = {
  BRD: 2,
  SRS: 3,
  UserStories: 4,
  APISpec: 5,
  DBSchema: 6,
};

const DocumentViewer = ({
  projectId,
  activeDocId,
  docStatuses,
  onDocumentLoaded,   // callback to inform parent of loaded doc (for header/context)
  onSaveStateChange,  // callback: 'saved' | 'saving' | 'unsaved' | null
  onDocumentSaved,    // callback when document is saved (for history refresh)
  externalDocUpdate,  // When the chat panel updates the doc
  previewVersion,     // { versionNumber, createdAt, changes }
  onClearPreview,     // callback to clear preview
  triggerSave,        // Trigger save from parent
  onDocumentGenerated,// callback when a document finishes generating
  refreshKey,         // Trigger reload from parent (e.g. after version restore)
}) => {
  const [loadState, setLoadState]       = useState('idle'); // idle | loading | ready | error | empty
  const [document, setDocument]         = useState(null);
  const [isEditing, setIsEditing]       = useState(false);
  const [isSaving, setIsSaving]         = useState(false);
  const [isRestoring, setIsRestoring]   = useState(false);
  const [regenSectionId, setRegenSectionId] = useState(null);
  const [editChanges, setEditChanges]   = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError]         = useState(null);

  const editChangesRef = useRef({});
  const isDirtyRef = useRef(false);

  // ── Load document when active doc changes ──
  const loadDocument = useCallback(async () => {
    if (!activeDocId || !projectId) return;

    setLoadState('loading');
    setDocument(null);
    setIsEditing(false);
    setEditChanges({});
    editChangesRef.current = {};
    isDirtyRef.current = false;
    onSaveStateChange?.(null);

    try {
      const doc = await fetchDocument(projectId, activeDocId);
      setDocument(doc);
      setLoadState('ready');
      onDocumentLoaded?.(doc);
    } catch (err) {
      if (
        err?.message === 'NOT_GENERATED' ||
        err?.isNotGenerated ||
        err?.status === 404 ||
        err?.response?.status === 404 ||
        (typeof err?.message === 'string' && err.message.includes('No completed'))
      ) {
        setLoadState('empty');
      } else {
        setLoadState('error');
      }
    }
  }, [activeDocId, projectId, onDocumentLoaded, onSaveStateChange]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  // ── Reload when parent triggers a refresh (e.g. restore from panel) ──
  useEffect(() => {
    if (refreshKey > 0) {
      loadDocument();
    }
  }, [refreshKey, loadDocument]);

  // ── Sync external updates (e.g. from ChatPanel) ──
  useEffect(() => {
    if (externalDocUpdate && document && externalDocUpdate.type === document.type) {
      setDocument(externalDocUpdate);
    }
  }, [externalDocUpdate, document]);

  // ── Editing handlers ──
  const handleEdit = () => {
    setIsEditing(true);
    isDirtyRef.current = false;
    onSaveStateChange?.('unsaved');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditChanges({});
    editChangesRef.current = {};
    isDirtyRef.current = false;
    onSaveStateChange?.(null);
  };

  const markDirty = useCallback(() => {
    if (!isDirtyRef.current) {
      isDirtyRef.current = true;
      onSaveStateChange?.('unsaved');
    }
  }, [onSaveStateChange]);

  const handleFieldChange = (sectionId, value) => {
    editChangesRef.current[sectionId] = value;
    setEditChanges(prev => ({ ...prev, [sectionId]: value }));
    markDirty();
  };

  const handleStoriesChange = useCallback((stories) => {
    editChangesRef.current.stories = stories;
    markDirty();
  }, [markDirty]);

  const handleEndpointsChange = useCallback((endpoints) => {
    editChangesRef.current.endpoints = endpoints;
    markDirty();
  }, [markDirty]);

  const handleEntitiesChange = useCallback((entities) => {
    editChangesRef.current.entities = entities;
    markDirty();
  }, [markDirty]);

  // ── Save edited content ──
  const handleSave = async () => {
    if (!document) return;
    setIsSaving(true);
    onSaveStateChange?.('saving');
    try {
      let structuredContent;

      if (document.sections) {
        structuredContent = document.sections.map(section => {
          const edited = editChangesRef.current[section.id] !== undefined
            ? editChangesRef.current[section.id]
            : editChanges[section.id];
          if (edited === undefined) return section;
          if (section.items) {
            return { ...section, items: typeof edited === 'string' ? edited.split('\n').filter(Boolean) : edited };
          }
          if (section.table) {
            try {
              const parsed = JSON.parse(edited);
              if (Array.isArray(parsed)) {
                return { ...section, table: { ...section.table, rows: parsed } };
              }
            } catch {
              // fallback
            }
          }
          return { ...section, content: edited };
        });
      } else if (document.stories) {
        structuredContent = editChangesRef.current.stories || editChanges.stories || document.stories;
      } else if (document.endpoints) {
        structuredContent = editChangesRef.current.endpoints || editChanges.endpoints || document.endpoints;
      } else if (document.entities) {
        structuredContent = editChangesRef.current.entities || editChanges.entities || document.entities;
      } else {
        structuredContent = document;
      }

      const saveRes = await saveDocument(projectId, activeDocId, structuredContent);
      const savedData = saveRes?.data;
      const nextVersion = savedData?.currentVersion || (document.currentVersion || 1) + 1;
      const nextUpdatedAt = savedData?.updatedAt || new Date().toISOString();

      const updatedDocument = {
        ...document,
        ...(document.sections ? { sections: structuredContent } : {}),
        ...(document.stories ? { stories: structuredContent } : {}),
        ...(document.endpoints ? { endpoints: structuredContent } : {}),
        ...(document.entities ? { entities: structuredContent } : {}),
        currentVersion: nextVersion,
        updatedAt: nextUpdatedAt,
      };

      setDocument(updatedDocument);
      setIsEditing(false);
      setEditChanges({});
      editChangesRef.current = {};
      isDirtyRef.current = false;
      onSaveStateChange?.('saved');
      onDocumentLoaded?.(updatedDocument);
      onDocumentSaved?.(updatedDocument);

      setTimeout(() => onSaveStateChange?.(null), 3000);
    } catch (err) {
      console.error('Failed to save document:', err);
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

  // ── Section regeneration (Phase 3 connects to API) ──
  const handleRegenSection = async (sectionId) => {
    setRegenSectionId(sectionId);
    await new Promise(r => setTimeout(r, 2000));
    setRegenSectionId(null);
  };

  // ── Document generation ──
  const handleGenerate = useCallback(async () => {
    if (!projectId || isGenerating) return;
    setIsGenerating(true);
    setGenError(null);
    try {
      await generateDocument(projectId, activeDocId);
      await loadDocument();
      onDocumentGenerated?.(activeDocId);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || `${activeDocId} generation failed.`;
      setGenError(msg);
      setLoadState('empty');
    } finally {
      setIsGenerating(false);
    }
  }, [projectId, activeDocId, isGenerating, loadDocument, onDocumentGenerated]);

  // ── Restore version ──
  const handleRestore = async (versionNumber) => {
    if (!projectId || !activeDocId || !versionNumber || isRestoring) return;
    setIsRestoring(true);
    try {
      await restoreDocumentVersion(projectId, activeDocId, versionNumber);
      onClearPreview?.();
      await loadDocument();
    } catch (err) {
      console.error('Failed to restore version:', err);
    } finally {
      setIsRestoring(false);
    }
  };

  // ── Status & display computations ──
  const docStatus = docStatuses?.[activeDocId]?.status || 'not_generated';
  const stageIndex = STAGE_INDEX_MAP[activeDocId] ?? 2;

  if (docStatus === 'generating' || isGenerating) {
    return <GenerationStatus currentStageIndex={stageIndex} />;
  }

  const activeDocMeta = BLUEPRINT_DOCS.find(d => d.id === activeDocId);
  const docLabel = activeDocMeta?.label || activeDocId;

  const displayDocument = previewVersion?.content
    ? normalizeVersionContent(activeDocId, previewVersion.content, document)
    : document;

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
          onRegenerate={handleGenerate}
          isSaving={isSaving}
        />
      )}

      {/* Version Preview Banner */}
      <VersionPreviewBanner
        previewVersion={previewVersion}
        isRestoring={isRestoring}
        onClearPreview={onClearPreview}
        onRestore={handleRestore}
      />

      {/* Document content area */}
      <div className={`flex-1 overflow-y-auto ws-panel ${previewVersion ? 'opacity-80' : ''}`}>
        {loadState === 'loading' && <DocumentSkeleton />}
        {loadState === 'error'   && <DocError onRetry={loadDocument} />}
        {loadState === 'empty'   && (
          <DocEmpty
            docId={activeDocId}
            docLabel={docLabel}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            error={genError}
          />
        )}

        {loadState === 'ready' && document && (
          <DocRenderer
            docType={activeDocId}
            document={displayDocument}
            isEditing={isEditing && !previewVersion}
            onFieldChange={handleFieldChange}
            onStoriesChange={handleStoriesChange}
            onEndpointsChange={handleEndpointsChange}
            onEntitiesChange={handleEntitiesChange}
            regenSectionId={regenSectionId}
            onRegenSection={handleRegenSection}
          />
        )}
      </div>
    </div>
  );
};

export default DocumentViewer;
