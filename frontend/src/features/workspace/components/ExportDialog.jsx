import { useState, useEffect } from 'react';
import { BLUEPRINT_DOCS } from '../services/workspaceService';

const ExportDialog = ({ isOpen, onClose, docStatuses, activeDocId, saveState, onSave }) => {
  const [exportScope, setExportScope] = useState('all'); // 'current' | 'all'
  
  // Keep track of which documents the user has manually selected
  const [manualSelection, setManualSelection] = useState([]);
  
  const [format, setFormat] = useState('pdf');
  const [exportState, setExportState] = useState('idle'); // idle | unsaved_warning | exporting | success | error

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setExportState('idle');
      setExportScope('all');
      setFormat('pdf');
      const generatedDocs = BLUEPRINT_DOCS.filter(d => docStatuses?.[d.id]?.status === 'ready').map(d => d.id);
      setManualSelection(generatedDocs);
    }
  }, [isOpen, docStatuses]);

  if (!isOpen) return null;

  // Determine active selection based on scope
  const selectedDocs = exportScope === 'current' 
    ? (docStatuses?.[activeDocId]?.status === 'ready' ? [activeDocId] : [])
    : manualSelection;

  const handleToggleDoc = (id) => {
    if (exportScope === 'current') return;
    setManualSelection(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const generatedDocs = BLUEPRINT_DOCS.filter(d => docStatuses?.[d.id]?.status === 'ready').map(d => d.id);
    setManualSelection(generatedDocs);
  };

  const handleClearAll = () => {
    setManualSelection([]);
  };

  const handleInitialExport = () => {
    // If the active doc is selected and it has unsaved changes, warn the user
    if (saveState === 'unsaved' && selectedDocs.includes(activeDocId)) {
      setExportState('unsaved_warning');
    } else {
      executeExport();
    }
  };

  const executeExport = async () => {
    setExportState('exporting');
    // Simulate export delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    setExportState('success');
  };

  const handleSaveAndExport = async () => {
    setExportState('exporting');
    if (onSave) onSave(); // Trigger the save via WorkspacePage -> DocumentViewer
    // We assume the save will eventually succeed, simulate full operation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setExportState('success');
  };

  const handleExportSavedVersion = () => {
    executeExport();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget && exportState !== 'exporting') onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-dialog-title"
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden animate-slide-up flex flex-col"
        style={{
          background: '#0D1117',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
          maxHeight: '90vh'
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div>
            <h2 id="export-dialog-title" className="text-base font-semibold" style={{ color: 'rgba(255,255,255,0.95)' }}>
              Export Blueprint
            </h2>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Download your AI-generated documents
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={exportState === 'exporting'}
            className="rounded-lg p-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)' }}
            onMouseEnter={e => { if (exportState !== 'exporting') e.currentTarget.style.color = 'rgba(255,255,255,0.9)'; }}
            onMouseLeave={e => { if (exportState !== 'exporting') e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
            aria-label="Close export dialog"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Dynamic Body based on State */}
        <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-thin">
          
          {exportState === 'unsaved_warning' && (
            <div className="flex flex-col items-center justify-center text-center py-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#FCD34D' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              </div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: '#FCD34D' }}>Unsaved Changes</h3>
              <p className="text-sm max-w-xs mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                You have unsaved changes in the current document. Do you want to save them before exporting?
              </p>
              
              <div className="flex flex-col gap-3 mt-6 w-full max-w-xs mx-auto">
                <button
                  onClick={handleSaveAndExport}
                  className="py-2.5 rounded-lg text-sm font-medium transition-colors w-full"
                  style={{ background: '#3B82F6', color: '#fff' }}
                >
                  Save & Export
                </button>
                <button
                  onClick={handleExportSavedVersion}
                  className="py-2.5 rounded-lg text-sm font-medium transition-colors w-full"
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)' }}
                >
                  Export Saved Version
                </button>
                <button
                  onClick={() => setExportState('idle')}
                  className="py-2.5 rounded-lg text-sm font-medium transition-colors w-full mt-2"
                  style={{ background: 'transparent', color: 'rgba(255,255,255,0.5)' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {exportState === 'exporting' && (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <span className="w-10 h-10 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin mb-6" />
              <h3 className="text-sm font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.9)' }}>
                Exporting Blueprint...
              </h3>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Preparing {format.toUpperCase()} files. Please wait.
              </p>
            </div>
          )}

          {exportState === 'success' && (
            <div className="flex flex-col items-center justify-center text-center py-8">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34D399' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: '#34D399' }}>Frontend Export UI implemented</h3>
              <p className="text-sm max-w-[280px] mx-auto leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
                The UI workflow is complete. Backend export endpoints are still required in Phase 3 to generate the actual {format.toUpperCase()} download.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)' }}
              >
                Close
              </button>
            </div>
          )}

          {exportState === 'idle' && (
            <div className="space-y-6">
              {/* Scope Selection */}
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Export Scope
                </p>
                <div className="flex bg-[#161B22] p-1 rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                  <button
                    onClick={() => setExportScope('all')}
                    className="flex-1 py-2 text-xs font-medium rounded-lg transition-all"
                    style={{
                      background: exportScope === 'all' ? 'rgba(59,130,246,0.15)' : 'transparent',
                      color: exportScope === 'all' ? '#60A5FA' : 'rgba(255,255,255,0.5)',
                    }}
                  >
                    Entire Blueprint
                  </button>
                  <button
                    onClick={() => setExportScope('current')}
                    className="flex-1 py-2 text-xs font-medium rounded-lg transition-all"
                    style={{
                      background: exportScope === 'current' ? 'rgba(59,130,246,0.15)' : 'transparent',
                      color: exportScope === 'current' ? '#60A5FA' : 'rgba(255,255,255,0.5)',
                    }}
                  >
                    Current Document
                  </button>
                </div>
              </div>

              {/* Document selection */}
              <div className={`transition-opacity ${exportScope === 'current' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Documents
                  </p>
                  <div className="flex gap-3 text-[0.65rem] font-medium">
                    <button onClick={handleSelectAll} style={{ color: '#3B82F6' }} className="hover:underline">Select All</button>
                    <button onClick={handleClearAll} style={{ color: 'rgba(255,255,255,0.4)' }} className="hover:underline">Clear All</button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {BLUEPRINT_DOCS.map(doc => {
                    const status = docStatuses?.[doc.id]?.status || 'not_generated';
                    const isReady = status === 'ready';
                    const isChecked = selectedDocs.includes(doc.id);

                    return (
                      <label
                        key={doc.id}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all"
                        style={{
                          background: isChecked ? 'rgba(59,130,246,0.06)' : 'rgba(255,255,255,0.02)',
                          border: isChecked ? '1px solid rgba(59,130,246,0.15)' : '1px solid rgba(255,255,255,0.05)',
                          opacity: isReady ? 1 : 0.45,
                          cursor: isReady ? 'pointer' : 'not-allowed',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={!isReady || exportScope === 'current'}
                          onChange={() => isReady && handleToggleDoc(doc.id)}
                          className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
                            {doc.label}
                          </span>
                          {!isReady && (
                            <span className="ml-2 text-xs italic" style={{ color: 'rgba(255,255,255,0.3)' }}>
                              Not generated
                            </span>
                          )}
                        </div>
                        {isReady && (
                          <span className="text-[0.65rem] px-2 py-0.5 rounded-full" style={{ background: 'rgba(52,211,153,0.1)', color: '#34D399' }}>
                            Ready
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Format selection */}
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Format
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* PDF Option */}
                  <button
                    onClick={() => setFormat('pdf')}
                    className="p-3 rounded-xl text-left transition-all border border-transparent"
                    style={{
                      background: format === 'pdf' ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)',
                      borderColor: format === 'pdf' ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.08)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="p-1.5 rounded" style={{ background: format === 'pdf' ? '#3B82F6' : 'rgba(255,255,255,0.1)', color: format === 'pdf' ? '#fff' : 'rgba(255,255,255,0.7)' }}>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                          <rect x="2" y="1" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.2" />
                          <path d="M5 5h6M5 8h6M5 11h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium" style={{ color: format === 'pdf' ? '#60A5FA' : 'rgba(255,255,255,0.85)' }}>PDF</span>
                    </div>
                    <p className="text-[0.65rem] leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      Professional document for submission/sharing.
                    </p>
                  </button>

                  {/* Markdown Option */}
                  <button
                    onClick={() => setFormat('markdown')}
                    className="p-3 rounded-xl text-left transition-all border border-transparent"
                    style={{
                      background: format === 'markdown' ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)',
                      borderColor: format === 'markdown' ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.08)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="p-1.5 rounded" style={{ background: format === 'markdown' ? '#3B82F6' : 'rgba(255,255,255,0.1)', color: format === 'markdown' ? '#fff' : 'rgba(255,255,255,0.7)' }}>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                          <path d="M2 4l4 4-4 4M8 12h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium" style={{ color: format === 'markdown' ? '#60A5FA' : 'rgba(255,255,255,0.85)' }}>Markdown</span>
                    </div>
                    <p className="text-[0.65rem] leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      Editable developer-friendly documentation.
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {exportState === 'idle' && (
          <div
            className="flex items-center justify-between px-6 py-4 gap-3 shrink-0"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(13, 17, 23, 0.95)' }}
          >
            <button
              onClick={onClose}
              className="text-xs px-4 py-2.5 rounded-lg font-medium transition-colors"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.65)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            >
              Cancel
            </button>
            <button
              id="export-submit-btn"
              onClick={handleInitialExport}
              disabled={selectedDocs.length === 0}
              className="text-xs px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg flex items-center gap-2"
              style={{
                background: selectedDocs.length > 0
                  ? 'linear-gradient(135deg,#1E40AF,#3B82F6)'
                  : 'rgba(255,255,255,0.06)',
                color: selectedDocs.length > 0 ? '#fff' : 'rgba(255,255,255,0.3)',
                boxShadow: selectedDocs.length > 0 ? '0 4px 12px rgba(59,130,246,0.25)' : 'none',
                cursor: selectedDocs.length > 0 ? 'pointer' : 'not-allowed',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M8 2v8M4 7l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {exportScope === 'current' ? `Export ${activeDocId}` : `Export Blueprint ${selectedDocs.length > 0 ? `(${selectedDocs.length})` : ''}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportDialog;
