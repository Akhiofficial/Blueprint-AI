import { useState, useEffect, useCallback } from 'react';
import { fetchVersionHistory, restoreDocumentVersion } from '../services/workspaceService';

const VersionHistoryPanel = ({
  activeDocId,
  activeDoc,
  onViewVersion,
  onRestoreSuccess,
  width = 320,
  projectId
}) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoringVersion, setRestoringVersion] = useState(null);

  const loadHistory = useCallback(async () => {
    if (!activeDocId || !projectId) {
      setVersions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const history = await fetchVersionHistory(activeDocId, projectId);
      setVersions(history);
    } catch {
      setVersions([]);
    } finally {
      setLoading(false);
    }
  }, [activeDocId, projectId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleRestore = async (versionNumber) => {
    if (!projectId || !activeDocId || restoringVersion !== null) return;
    setRestoringVersion(versionNumber);
    try {
      await restoreDocumentVersion(projectId, activeDocId, versionNumber);
      await loadHistory();
      onRestoreSuccess?.(versionNumber);
    } catch (err) {
      console.error('Failed to restore version:', err);
    } finally {
      setRestoringVersion(null);
    }
  };

  return (
    <aside
      className="hidden xl:flex flex-col ws-enter-right"
      style={{
        width: width,
        background: '#0D1117',
        borderLeft: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
      }}
      aria-label="Version History panel"
    >
      {/* Header */}
      <div 
        className="px-5 py-4 shrink-0 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>
            Version History
          </h3>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {activeDoc?.title || activeDocId}
          </p>
        </div>
      </div>

      {/* Version List */}
      <div className="flex-1 overflow-y-auto px-4 py-5 scrollbar-thin flex flex-col gap-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <span className="w-5 h-5 rounded-full border-2 border-blue-400/30 border-t-blue-400 animate-spin" />
          </div>
        ) : versions.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 space-y-3">
            <p className="text-xs leading-relaxed">
              No version history found.
            </p>
          </div>
        ) : (
          versions.map((version, index) => {
            const isCurrent = index === 0; // Assuming the first item is the most recent
            const isThisRestoring = restoringVersion === version.versionNumber;
            
            return (
              <div 
                key={version.versionNumber}
                className={`relative rounded-xl p-4 transition-colors`}
                style={{
                  background: isCurrent ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.03)',
                  border: isCurrent ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {/* Timeline connector line (except for the last one) */}
                {index < versions.length - 1 && (
                  <div 
                    className="absolute left-[23px] -bottom-[20px] w-px h-[20px]" 
                    style={{ background: 'rgba(255,255,255,0.1)' }} 
                  />
                )}
                
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span 
                      className="font-mono text-sm font-bold"
                      style={{ color: isCurrent ? '#60A5FA' : 'rgba(255,255,255,0.7)' }}
                    >
                      v{version.versionNumber}
                    </span>
                    {isCurrent && (
                      <span 
                        className="text-[0.6rem] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(59,130,246,0.2)', color: '#93C5FD' }}
                      >
                        Current
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {new Date(version.createdAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </div>
                
                <p className="text-sm mb-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  {version.changes || 'Document updated.'}
                </p>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => onViewVersion(version)}
                    className="flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      color: 'rgba(255,255,255,0.8)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                  >
                    View
                  </button>
                  {!isCurrent && (
                    <button
                      onClick={() => handleRestore(version.versionNumber)}
                      disabled={isThisRestoring}
                      className="flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      style={{
                        background: 'rgba(59,130,246,0.15)',
                        color: '#60A5FA',
                        border: '1px solid rgba(59,130,246,0.2)',
                        opacity: isThisRestoring ? 0.6 : 1,
                      }}
                      onMouseEnter={e => { if (!isThisRestoring) e.currentTarget.style.background = 'rgba(59,130,246,0.25)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.15)'; }}
                    >
                      {isThisRestoring ? (
                        <>
                          <span className="w-3 h-3 rounded-full border-2 border-blue-400/30 border-t-blue-400 animate-spin" />
                          Restoring…
                        </>
                      ) : (
                        'Restore'
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};

export default VersionHistoryPanel;

