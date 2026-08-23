/**
 * WorkspacePage.jsx
 *
 * Route: /projects/:id/workspace?doc=BRD
 *
 * The primary product screen of BlueprintAI — Step 4 of the workflow:
 *   01 Project → 02 Requirements → 03 Analysis → 04 Blueprint Workspace
 *
 * Layout: custom full-height three-panel IDE-like shell.
 *   [BlueprintSidebar] [DocumentViewer] [ContextPanel]
 *
 * This page uses its OWN layout (not DashboardLayout) because
 * the workspace needs full viewport height with no outer scroll.
 *
 * Authentication: handled by ProtectedRoute — no auth logic here.
 *
 * Phase 3 integration:
 *   - fetchDocumentStatuses → real backend call
 *   - DocumentViewer → uses real document API
 *   - All mock content is isolated in workspaceService.js
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useProjectsContext } from '../../projects/projects.context';
import useProjects from '../../projects/hooks/useProjects';
import { fetchDocumentStatuses, BLUEPRINT_DOCS } from '../services/workspaceService';
import BlueprintHeader from '../components/BlueprintHeader';
import BlueprintSidebar from '../components/BlueprintSidebar';
import DocumentViewer from '../components/DocumentViewer';
import ChatPanel from '../components/ChatPanel';
import VersionHistoryPanel from '../components/VersionHistoryPanel';
import ExportDialog from '../components/ExportDialog';

// ─── Workspace loading skeleton ───────────────────────────────────────────────

const WorkspaceSkeleton = () => (
  <div className="flex flex-1 min-h-0 overflow-hidden">
    {/* Sidebar skeleton */}
    <div
      className="hidden lg:block w-55 shrink-0 p-4 space-y-2"
      style={{ background: '#0D1117', borderRight: '1px solid rgba(255,255,255,0.07)', width: 220 }}
    >
      <div className="skeleton h-3 rounded-lg w-2/3 mb-4" />
      {[1,2,3,4,5].map(i => (
        <div key={i} className="skeleton h-9 rounded-lg" />
      ))}
    </div>
    {/* Center skeleton */}
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
  const navigate = useNavigate();

  const { currentProject, loading: projectLoading } = useProjectsContext();
  const { handleFetchProjectById } = useProjects();

  // ── State ──
  const [docStatuses,  setDocStatuses]  = useState({});
  const [statusLoading,setStatusLoading]= useState(true);
  const [statusError,  setStatusError]  = useState(false);
  const [activeDocId,  setActiveDocId]  = useState(() => {
    const paramDoc = searchParams.get('doc');
    const validId = BLUEPRINT_DOCS.find(d => d.id === paramDoc)?.id;
    return validId || 'BRD';
  });
  const [saveState,    setSaveState]    = useState(null); // 'saved'|'saving'|'unsaved'|null
  const [activeDoc,    setActiveDoc]    = useState(null);
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [exportOpen,   setExportOpen]   = useState(false);
  const [activeRightPanel, setActiveRightPanel] = useState('chat'); // 'chat' | 'history' | null
  const [previewVersion, setPreviewVersion] = useState(null);
  const [triggerSave, setTriggerSave] = useState(0);

  // ── Load project if not in context ──
  useEffect(() => {
    if (!currentProject || currentProject._id !== projectId) {
      handleFetchProjectById(projectId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

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

  // ── Handle unsaved changes on navigation ──
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

  // ── Project name ──
  const projectName = projectLoading ? '…' : currentProject?.title ?? 'Project';

  // ── Active doc label ──
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
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-20">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path d="M10 7v4M10 13.5h.01" stroke="#F87171" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M3 17L10 3l7 14H3z" stroke="#F87171" strokeWidth="1.3" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-sm font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Unable to load blueprint
          </h2>
          <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            We couldn't load your blueprint documents. Please try again.
          </p>
          <button
            id="ws-retry-btn"
            onClick={loadStatuses}
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
      ) : (
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* ── Left: Blueprint Sidebar ── */}
          <BlueprintSidebar
            activeDocId={activeDocId}
            docStatuses={docStatuses}
            onSelectDoc={handleSelectDoc}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
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
            {/* [DEMO] Notice bar */}
            <div
              className="flex items-center justify-center gap-2 px-4 py-2 text-xs"
              style={{
                background: 'rgba(59,130,246,0.06)',
                borderBottom: '1px solid rgba(59,130,246,0.12)',
                color: '#93C5FD',
                flexShrink: 0,
              }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.2" />
                <path d="M5 4v2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="5" cy="7.5" r="0.5" fill="currentColor" />
              </svg>
              <span>
                <strong>Phase 3 Preview:</strong> Documents below are structured demo data.
                Blueprint Engine integration will populate actual AI-generated content.
              </span>
            </div>

            <DocumentViewer
              projectId={projectId}
              activeDocId={activeDocId}
              docStatuses={docStatuses}
              onDocumentLoaded={setActiveDoc}
              onSaveStateChange={setSaveState}
              externalDocUpdate={activeDoc}
              previewVersion={previewVersion}
              onClearPreview={() => setPreviewVersion(null)}
              triggerSave={triggerSave}
            />
          </main>

          {/* ── Right: AI Chat / History Panel ── */}
          {activeRightPanel === 'chat' && (
            <ChatPanel
              projectId={projectId}
              activeDocId={activeDocId}
              onDocumentRefined={(updatedDoc) => {
                setActiveDoc(updatedDoc);
                // Trigger a save state change to show success momentarily
                setSaveState('saved');
                setTimeout(() => setSaveState(null), 3000);
              }}
            />
          )}

          {activeRightPanel === 'history' && (
            <VersionHistoryPanel
              activeDocId={activeDocId}
              activeDoc={activeDoc}
              onViewVersion={(v) => setPreviewVersion(v)}
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
