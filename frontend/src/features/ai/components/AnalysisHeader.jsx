/**
 * AnalysisHeader.jsx
 *
 * Header component for the Requirement Analysis page.
 * Renders eyebrow navigation, page title, complexity tag, subheader description,
 * and primary CTA buttons.
 */

import { Link } from 'react-router-dom';

const AnalysisHeader = ({
  projectId,
  projectTitle,
  projectLoading,
  complexity,
  status,
  onReAnalyze,
  onGenerateBlueprint,
}) => {
  return (
    <header className="mb-6 sm:mb-7 w-full max-w-full overflow-hidden">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <p
          className="bp-mono uppercase"
          style={{ fontSize: '0.62rem', letterSpacing: '0.16em', color: 'rgba(255,255,255,0.22)' }}
        >
          <Link
            to={`/projects/${projectId}`}
            style={{ color: 'rgba(255,255,255,0.22)', transition: 'color 0.15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.22)'; }}
          >
            {projectLoading ? '…' : projectTitle ?? 'Project'}
          </Link>
          <span className="mx-2" style={{ color: 'rgba(255,255,255,0.12)' }}>/</span>
          <span style={{ color: '#22D3EE' }}>Analysis</span>
        </p>
      </div>

      {/* Main Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-1 flex-wrap">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-100 truncate">
              Requirement Analysis
            </h1>
            {complexity && (
              <span
                className="px-2.5 py-0.5 rounded-full text-[0.65rem] sm:text-xs font-semibold uppercase bp-mono shrink-0"
                style={{
                  background:
                    complexity === 'high'
                      ? 'rgba(239,68,68,0.15)'
                      : complexity === 'medium'
                      ? 'rgba(245,158,11,0.15)'
                      : 'rgba(52,211,153,0.15)',
                  color:
                    complexity === 'high'
                      ? '#F87171'
                      : complexity === 'medium'
                      ? '#FBBF24'
                      : '#34D399',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {complexity} Complexity
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            {status === 'completed'
              ? 'BlueprintAI has structured your project requirements.'
              : 'Transforming requirements into structured software context.'}
          </p>
        </div>

        {status === 'completed' && (
          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
            <button
              onClick={onReAnalyze}
              className="text-xs px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition-colors"
              style={{
                background: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            >
              Re-analyze
            </button>
            <button
              onClick={onGenerateBlueprint}
              className="text-xs px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition-all"
              style={{
                background: 'linear-gradient(135deg,#1E40AF 0%,#2563EB 55%,#3B82F6 100%)',
                color: '#fff',
                border: 'none',
                boxShadow: '0 1px 3px rgba(0,0,0,0.4),0 0 12px rgba(59,130,246,0.2)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.5),0 0 16px rgba(59,130,246,0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.4),0 0 12px rgba(59,130,246,0.2)'; }}
            >
              Generate Blueprint →
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default AnalysisHeader;
