/**
 * AnalysisPage.jsx
 *
 * Route: /projects/:id/analysis
 *
 * Step 4 in the BlueprintAI workflow:
 *   01 Project → 02 Requirements → 03 Analysis → 04 Blueprint
 *
 * This page simulates the AI analysis of requirements, displaying a
 * structured breakdown of functional/non-functional requirements,
 * user roles, and core modules.
 *
 * It uses isolated, labeled [DEMO] mock data via `analysisService.js`
 * since the Blueprint Engine (Phase 3) is not yet implemented.
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { useProjectsContext } from '../../projects/projects.context';
import useProjects from '../../projects/hooks/useProjects';
import { analyzeRequirements, ANALYSIS_STAGES } from '../services/analysisService';

// ── Design tokens ─────────────────────────────────────────────────────────────
const CARD_STYLE = {
  background: '#11161D',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '12px',
  boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 8px 40px rgba(0,0,0,0.4)',
};

const SECTION_LABEL_STYLE = {
  fontSize: '0.65rem',
  letterSpacing: '0.14em',
  color: 'rgba(255,255,255,0.28)',
  textTransform: 'uppercase',
  fontFamily: 'inherit',
  fontWeight: 600,
  marginBottom: '1rem',
};

import WorkflowIndicator from '../../../components/common/WorkflowIndicator';

// ── Components: Processing State ─────────────────────────────────────────────
const ProcessingView = ({ stageIndex }) => {
  return (
    <div style={CARD_STYLE} className="max-w-2xl mx-auto p-10 animate-fade-in mt-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <span className="w-5 h-5 rounded-full border-2 border-blue-400/30 border-t-blue-400 animate-spin" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100">Analyzing requirements...</h2>
          <p className="text-sm text-slate-400">Blueprint Engine is structuring your project.</p>
        </div>
      </div>

      <div className="space-y-4">
        {ANALYSIS_STAGES.map((stage, idx) => {
          const isCompleted = idx < stageIndex;
          const isActive = idx === stageIndex;
          const isPending = idx > stageIndex;

          let icon;
          let colorStyle;

          if (isCompleted) {
            icon = (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7L5.5 10L11.5 4" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            );
            colorStyle = { color: 'rgba(255,255,255,0.6)' };
          } else if (isActive) {
            icon = <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />;
            colorStyle = { color: 'rgba(255,255,255,0.95)', fontWeight: 500 };
          } else {
            icon = <div className="w-2 h-2 rounded-full bg-slate-700" />;
            colorStyle = { color: 'rgba(255,255,255,0.2)' };
          }

          return (
            <div key={stage.id} className="flex items-center gap-4 transition-all duration-300">
              <div className="w-6 flex justify-center">{icon}</div>
              <span className="text-sm" style={colorStyle}>{stage.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Components: Completed Data Views ─────────────────────────────────────────

const StatCard = ({ label, value }) => (
  <div
    className="p-4 rounded-xl flex flex-col justify-center"
    style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
    }}
  >
    <p className="text-xs text-slate-400 mb-1">{label}</p>
    <p className="text-2xl font-bold text-slate-100">{value}</p>
  </div>
);

const RequirementList = ({ requirements, isFunctional }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left text-sm border-collapse">
      <thead>
        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <th className="py-3 px-4 font-medium text-slate-400" style={{ width: '12%' }}>ID</th>
          <th className="py-3 px-4 font-medium text-slate-400" style={{ width: '25%' }}>Title</th>
          <th className="py-3 px-4 font-medium text-slate-400">Description</th>
          <th className="py-3 px-4 font-medium text-slate-400 text-right" style={{ width: '15%' }}>
            {isFunctional ? 'Actor' : 'Category'}
          </th>
        </tr>
      </thead>
      <tbody style={{ color: 'rgba(255,255,255,0.75)' }}>
        {requirements.map((req) => (
          <tr key={req.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <td className="py-4 px-4 align-top">
              <span className="bp-mono text-xs text-slate-500">{req.id}</span>
            </td>
            <td className="py-4 px-4 align-top font-medium text-slate-200">
              {req.title.replace('[DEMO] ', '')}
            </td>
            <td className="py-4 px-4 align-top leading-relaxed text-slate-400">
              {req.description}
            </td>
            <td className="py-4 px-4 align-top text-right">
              <span
                className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.6)',
                }}
              >
                {isFunctional ? req.actor : req.category}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const EntityGrid = ({ items }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {items.map((item) => (
      <div
        key={item.id}
        className="p-4 rounded-xl"
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <p className="font-medium text-slate-200 mb-1">{item.name.replace('[DEMO] ', '')}</p>
        <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
      </div>
    ))}
  </div>
);

// ── Main Page Component ───────────────────────────────────────────────────────
const AnalysisPage = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const { currentProject, loading: projectLoading } = useProjectsContext();
  const { handleFetchProjectById } = useProjects();

  // ── States ──
  const [status, setStatus] = useState('idle'); // idle | processing | completed | error
  const [stageIndex, setStageIndex] = useState(0);
  const [analysisData, setAnalysisData] = useState(null);
  const [showSource, setShowSource] = useState(false);

  // ── Initialization ──
  useEffect(() => {
    if (!currentProject || currentProject._id !== projectId) {
      handleFetchProjectById(projectId);
    }
    // Auto-start analysis on mount for this mockup
    startAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const startAnalysis = async () => {
    setStatus('processing');
    setStageIndex(0);
    try {
      const data = await analyzeRequirements(projectId, (idx) => {
        setStageIndex(idx);
      });
      setAnalysisData(data);
      setStatus('completed');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  const handleGenerateBlueprint = () => {
    // Navigate to Phase 4 (Workspace/Blueprint)
    navigate(`/projects/${projectId}/workspace`);
  };

  // ── Render Header ──
  const renderHeader = () => (
    <header className="mb-7">
      <div className="flex items-center gap-2 mb-3">
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
            {projectLoading ? '…' : currentProject?.title ?? 'Project'}
          </Link>
          <span className="mx-2" style={{ color: 'rgba(255,255,255,0.12)' }}>/</span>
          <span style={{ color: '#22D3EE' }}>Analysis</span>
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            Requirement Analysis
          </h1>
          <p className="text-sm text-slate-400">
            {status === 'completed'
              ? 'BlueprintAI has structured your project requirements.'
              : 'Transforming requirements into structured software context.'}
          </p>
        </div>
        
        {status === 'completed' && (
          <div className="flex items-center gap-3">
            <button
              onClick={startAnalysis}
              className="text-xs px-4 py-2 rounded-lg font-medium transition-colors"
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
              onClick={handleGenerateBlueprint}
              className="text-xs px-4 py-2 rounded-lg font-medium transition-all"
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

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl animate-fade-in pb-20">
        <WorkflowIndicator current={2} />
        {renderHeader()}

        {status === 'processing' && <ProcessingView stageIndex={stageIndex} />}

        {status === 'error' && (
          <div style={CARD_STYLE} className="p-8 text-center animate-fade-in">
            <div className="text-red-400 text-3xl mb-4">⚠️</div>
            <h2 className="text-lg font-semibold text-slate-200 mb-2">Analysis Failed</h2>
            <p className="text-slate-400 text-sm mb-6">We couldn't analyze your requirements at this time.</p>
            <button
              onClick={startAnalysis}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors text-slate-200"
            >
              Try Again
            </button>
          </div>
        )}

        {status === 'completed' && analysisData && (
          <div className="space-y-6 animate-slide-up">
            
            {/* Demo Notice */}
            <div className="p-3 rounded-lg flex items-center justify-center gap-2 text-xs" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#93C5FD' }}>
              <span className="font-bold">PHASE 3 NOTICE:</span> This is a mock UI structure. Blueprint Engine integration will populate actual data.
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label="Functional" value={analysisData.summary.functional} />
              <StatCard label="Non-Functional" value={analysisData.summary.nonFunctional} />
              <StatCard label="User Roles" value={analysisData.summary.roles} />
              <StatCard label="Core Modules" value={analysisData.summary.modules} />
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column (Main lists) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Functional Requirements */}
                <div style={CARD_STYLE} className="p-6">
                  <h2 style={SECTION_LABEL_STYLE}>Functional Requirements</h2>
                  <RequirementList requirements={analysisData.functionalRequirements} isFunctional={true} />
                </div>

                {/* Non-Functional Requirements */}
                <div style={CARD_STYLE} className="p-6">
                  <h2 style={SECTION_LABEL_STYLE}>Non-Functional Requirements</h2>
                  <RequirementList requirements={analysisData.nonFunctionalRequirements} isFunctional={false} />
                </div>

              </div>

              {/* Right Column (Entities & Source) */}
              <div className="space-y-6">
                
                {/* User Roles */}
                <div style={CARD_STYLE} className="p-6">
                  <h2 style={SECTION_LABEL_STYLE}>Identified Roles</h2>
                  <EntityGrid items={analysisData.roles} />
                </div>

                {/* Core Modules */}
                <div style={CARD_STYLE} className="p-6">
                  <h2 style={SECTION_LABEL_STYLE}>Core Modules</h2>
                  <EntityGrid items={analysisData.modules} />
                </div>

                {/* Source Requirements Accordion */}
                <div style={CARD_STYLE} className="overflow-hidden">
                  <button
                    className="w-full p-4 flex items-center justify-between text-left transition-colors"
                    style={{ background: showSource ? 'rgba(255,255,255,0.02)' : 'transparent' }}
                    onClick={() => setShowSource(!showSource)}
                  >
                    <span style={{ ...SECTION_LABEL_STYLE, marginBottom: 0 }}>Source Requirements</span>
                    <span className="text-slate-500 text-lg leading-none">{showSource ? '−' : '+'}</span>
                  </button>
                  {showSource && (
                    <div className="p-4 border-t border-white/5 bg-white/[0.01]">
                      <p className="text-sm text-slate-400 whitespace-pre-wrap leading-relaxed">
                        {analysisData.originalRequirements}
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default AnalysisPage;
