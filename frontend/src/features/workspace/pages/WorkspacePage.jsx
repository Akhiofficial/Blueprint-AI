/**
 * WorkspacePage.jsx
 *
 * Route: /projects/:id/workspace?doc=BRD
 *
 * The primary product screen of BlueprintAI — Step 4 of the workflow:
 *   01 Project → 02 Requirements → 03 Analysis → 04 Blueprint Workspace
 *
 * Layout: three-panel IDE shell.
 *   [BlueprintSidebar] [DocumentViewer] [ContextPanel (Chat / History)]
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useProjectsContext } from '../../projects/projects.context';
import useProjects from '../../projects/hooks/useProjects';
import { fetchDocumentStatuses, BLUEPRINT_DOCS } from '../services/workspaceService';
import useWorkspaceResizer from '../hooks/useWorkspaceResizer';
import BlueprintHeader from '../components/BlueprintHeader';
import BlueprintSidebar from '../components/BlueprintSidebar';
import DocumentViewer from '../components/DocumentViewer';
import ChatPanel from '../components/ChatPanel';
import VersionHistoryPanel from '../components/VersionHistoryPanel';
import ExportDialog from '../components/ExportDialog';
import ErrorState from '../../../components/common/ErrorState';

// ─── Workspace loading skeleton ───────────────────────────────────────────────

const WorkspaceSkeleton = () => (
  <div className="flex flex-1 min-h-0 overflow-hidden">
    <div
      className="hidden lg:block shrink-0 p-4 space-y-2"
      style={{ background: '#0D1117', borderRight: '1px solid rgba(255,255,255,0.07)', width: 220 }}
    >
      <div className="skeleton h-3 rounded-lg w-2/3 mb-4" />
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="skeleton h-9 rounded-lg" />
      ))}
    </div>
    <div className="flex-1 p-6 space-y-4" style={{ background: '#080B0F' }}>
      <div className="skeleton h-7 rounded-xl w-1/4 mb-6" />
      <div className="skeleton h-4 rounded-lg w-full" />
      <div className="skeleton h-4 rounded-lg w-5/6" />
      <div className="skeleton h-4 rounded-lg w-4/5" />
      <div className="skeleton h-4 rounded-lg w-full mt-4" />
      <div className="skeleton h-4 rounded-lg w-3/4" />
      <div className="skeleton h-32 rounded-xl w-full mt-6" />
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const WorkspacePage = () => {
  const { id: projectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const { currentProject, loading: projectLoading } = useProjectsContext();
  const { handleFetchProjectById } = useProjects();

  // ── Document & UI State ──
  const [docStatuses, setDocStatuses] = useState({});
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState(false);
  const [activeDocId, setActiveDocId] = useState(() => {
    const paramDoc = searchParams.get('doc');
    const validId = BLUEPRINT_DOCS.find(d => d.id === paramDoc)?.id;
    return validId || 'BRD';
  });
  const [saveState, setSaveState] = useState(null); // 'saved'|'saving'|'unsaved'|null
  const [activeDoc, setActiveDoc] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [activeRightPanel, setActiveRightPanel] = useState('chat'); // 'chat' | 'history' | null
  const [previewVersion, setPreviewVersion] = useState(null);
  const [triggerSave, setTriggerSave] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // ── Draggable Panel Resizing ──
  const {
    sidebarWidth,
    rightPanelWidth,
    isDraggingSidebar,
    isDraggingRightPanel,
    setIsDraggingSidebar,
    setIsDraggingRightPanel,
  } = useWorkspaceResizer();

  // ── Load project if not in context ──
  useEffect(() => {
    if (!currentProject || currentProject._id !== projectId) {
      handleFetchProjectById(projectId);
    }
  }, [projectId, currentProject, handleFetchProjectById]);

  // ── Load document statuses ──
  const loadStatuses = useCallback(async () => {
    setStatusLoading(true);
    setStatusError(false);
    try {
      const statuses = await fetchDocumentStatuses(projectId);
      setDocStatuses(statuses);
    } catch {
      setStatusError(true);
    } finally {
      setStatusLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadStatuses();
  }, [loadStatuses]);

  // ── Sync active doc to URL query param ──
  const handleSelectDoc = useCallback((docId) => {
    setActiveDocId(docId);
    setSearchParams({ doc: docId }, { replace: true });
    setSaveState(null);
    setPreviewVersion(null);
  }, [setSearchParams]);

  // ── Handle unsaved changes on window navigation ──
  useEffect(() => {
    const handler = (e) => {
      if (saveState === 'unsaved') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [saveState]);

  // ── Handle save propagation ──
  const handleDocumentSaved = useCallback((updatedDoc) => {
    setActiveDoc(updatedDoc);
    setDocStatuses(prev => ({
      ...prev,
      [activeDocId]: {
        status: 'ready',
        currentVersion: updatedDoc.currentVersion,
      }
    }));
    setRefreshKey(k => k + 1);
  }, [activeDocId]);

  const projectName = projectLoading ? '…' : currentProject?.title ?? 'Project';
  const activeDocMeta = BLUEPRINT_DOCS.find(d => d.id === activeDocId);

  return (
    <div
      className="flex flex-col"
      style={{ height: '100vh', background: '#080B0F', overflow: 'hidden' }}
    >
      {/* ── Top Header ── */}
      <BlueprintHeader
        projectId={projectId}
        projectName={projectName}
        activeDocLabel={activeDocMeta?.label}
        saveState={saveState}
        onSave={() => setTriggerSave(prev => prev + 1)}
        onExport={() => setExportOpen(true)}
        isSidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(prev => !prev)}
        activeRightPanel={activeRightPanel}
        onToggleRightPanel={(panel) => setActiveRightPanel(prev => prev === panel ? null : panel)}
      />

      {/* ── Three-panel workspace ── */}
      {statusLoading ? (
        <WorkspaceSkeleton />
      ) : statusError ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <ErrorState 
            title="Unable to load blueprint"
            message="We couldn't load your blueprint documents. Please try again."
            onRetry={loadStatuses}
            className="w-full max-w-md"
          />
        </div>
      ) : (
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* ── Left: Blueprint Sidebar ── */}
          <BlueprintSidebar
            width={sidebarWidth}
            activeDocId={activeDocId}
            docStatuses={docStatuses}
            onSelectDoc={handleSelectDoc}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          {/* Left Resizer */}
          <div
            className="hidden lg:block w-1 hover:bg-blue-500/50 cursor-col-resize z-50"
            style={{ 
              background: isDraggingSidebar ? 'rgba(59,130,246,0.5)' : 'transparent',
              transition: 'background 0.2s'
            }}
            onMouseDown={() => setIsDraggingSidebar(true)}
          />

          {/* ── Center: Document Viewer ── */}
          <main
            className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden"
            style={{
              backgroundImage: [
                'radial-gradient(ellipse 80% 55% at 50% 100%, rgba(34,211,238,0.04) 0%, rgba(59,130,246,0.07) 40%, transparent 70%)',
                'radial-gradient(circle, rgba(255,255,255,0.022) 1px, transparent 1px)',
              ].join(', '),
              backgroundSize: '100% 100%, 48px 48px',
            }}
          >
            <DocumentViewer
              projectId={projectId}
              activeDocId={activeDocId}
              docStatuses={docStatuses}
              onDocumentLoaded={setActiveDoc}
              onDocumentSaved={handleDocumentSaved}
              onSaveStateChange={setSaveState}
              onDocumentGenerated={loadStatuses}
              externalDocUpdate={activeDoc}
              previewVersion={previewVersion}
              onClearPreview={() => setPreviewVersion(null)}
              triggerSave={triggerSave}
              refreshKey={refreshKey}
            />
          </main>

          {/* Right Resizer */}
          {(activeRightPanel === 'chat' || activeRightPanel === 'history') && (
            <div
              className="hidden xl:block w-1 hover:bg-blue-500/50 cursor-col-resize z-50"
              style={{ 
                background: isDraggingRightPanel ? 'rgba(59,130,246,0.5)' : 'transparent',
                transition: 'background 0.2s'
              }}
              onMouseDown={() => setIsDraggingRightPanel(true)}
            />
          )}

          {/* ── Right: AI Chat / History Panel ── */}
          {activeRightPanel === 'chat' && (
            <ChatPanel
              width={rightPanelWidth}
              projectId={projectId}
              activeDocId={activeDocId}
              onDocumentRefined={(updatedDoc) => {
                setActiveDoc(updatedDoc);
                setSaveState('saved');
                setTimeout(() => setSaveState(null), 3000);
              }}
            />
          )}

          {activeRightPanel === 'history' && (
            <VersionHistoryPanel
              width={rightPanelWidth}
              activeDocId={activeDocId}
              activeDoc={activeDoc}
              projectId={projectId}
              refreshKey={refreshKey}
              onViewVersion={(v) => setPreviewVersion(v)}
              onRestoreSuccess={() => {
                setPreviewVersion(null);
                setRefreshKey(k => k + 1);
                loadStatuses();
              }}
            />
          )}
        </div>
      )}

      {/* ── Export Dialog ── */}
      <ExportDialog
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        docStatuses={docStatuses}
        activeDocId={activeDocId}
        saveState={saveState}
        onSave={() => setTriggerSave(prev => prev + 1)}
      />
    </div>
  );
};

export default WorkspacePage;
