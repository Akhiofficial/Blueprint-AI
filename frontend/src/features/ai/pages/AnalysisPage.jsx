/**
 * AnalysisPage.jsx
 *
 * Route: /projects/:id/analysis
 *
 * Step 3 in the BlueprintAI workflow:
 *   01 Project → 02 Requirements → 03 Analysis → 04 Blueprint
 *
 * Displays the AI-structured requirement analysis from the Blueprint Engine backend.
 */

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { useProjectsContext } from '../../projects/projects.context';
import useProjects from '../../projects/hooks/useProjects';
import { analyzeRequirements, getLatestAnalysis, ANALYSIS_STAGES } from '../services/analysisService';
import WorkflowIndicator from '../../../components/common/WorkflowIndicator';

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
          <p className="text-sm text-slate-400">Blueprint Engine is structuring your project requirements.</p>
        </div>
      </div>

      <div className="space-y-4">
        {ANALYSIS_STAGES.map((stage, idx) => {
          const isCompleted = idx < stageIndex;
          const isActive = idx === stageIndex;

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

const RequirementList = ({ requirements, isFunctional }) => {
  if (!requirements || requirements.length === 0) {
    return <p className="text-sm text-slate-500 italic">None identified.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <th className="py-3 px-4 font-medium text-slate-400" style={{ width: '12%' }}>ID</th>
            <th className="py-3 px-4 font-medium text-slate-400" style={{ width: '25%' }}>Title</th>
            <th className="py-3 px-4 font-medium text-slate-400">Description</th>
            <th className="py-3 px-4 font-medium text-slate-400 text-right" style={{ width: '18%' }}>
              {isFunctional ? 'Actor' : 'Category'}
            </th>
          </tr>
        </thead>
        <tbody style={{ color: 'rgba(255,255,255,0.75)' }}>
          {requirements.map((req, idx) => (
            <tr key={req.id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <td className="py-4 px-4 align-top">
                <span className="bp-mono text-xs text-slate-500">{req.id || `${isFunctional ? 'FR' : 'NFR'}-${idx + 1}`}</span>
              </td>
              <td className="py-4 px-4 align-top font-medium text-slate-200">
                {req.title}
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
};

const EntityGrid = ({ items, nameKey = 'name', descKey = 'description' }) => {
  if (!items || items.length === 0) {
    return <p className="text-sm text-slate-500 italic">None identified.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {items.map((item, idx) => (
        <div
          key={item.id || idx}
          className="p-4 rounded-xl"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <p className="font-medium text-slate-200 mb-1">{item[nameKey]}</p>
          {item[descKey] && <p className="text-sm text-slate-400 leading-relaxed">{item[descKey]}</p>}
        </div>
      ))}
    </div>
  );
};

const StringListCard = ({ title, items, badgeColor = 'rgba(59,130,246,0.1)' }) => {
  if (!items || items.length === 0) return null;

  return (
    <div style={CARD_STYLE} className="p-6">
      <h2 style={SECTION_LABEL_STYLE}>{title}</h2>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-300">
            <span
              className="inline-block shrink-0 rounded-full mt-1.5"
              style={{ width: 6, height: 6, background: badgeColor }}
            />
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// ── Main Page Component ───────────────────────────────────────────────────────
const AnalysisPage = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const { currentProject, loading: projectLoading } = useProjectsContext();
  const { handleFetchProjectById } = useProjects();

  // ── States ──
  const [status, setStatus] = useState('idle'); // idle | processing | completed | error
  const [errorMessage, setErrorMessage] = useState('');
  const [stageIndex, setStageIndex] = useState(0);
  const [analysisData, setAnalysisData] = useState(null);

  // ── Initialization ──
  useEffect(() => {
    if (!currentProject || currentProject._id !== projectId) {
      handleFetchProjectById(projectId);
    }
    loadOrCreateAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const loadOrCreateAnalysis = async () => {
    setStatus('processing');
    setErrorMessage('');
    try {
      // 1. Try to fetch existing analysis
      const existing = await getLatestAnalysis(projectId);
      if (existing) {
        setAnalysisData(existing);
        setStatus('completed');
        return;
      }
      // 2. If no existing analysis, trigger fresh analysis
      startAnalysis();
    } catch {
      // If fetching fails, attempt fresh analysis
      startAnalysis();
    }
  };

  const startAnalysis = async () => {
    setStatus('processing');
    setErrorMessage('');
    setStageIndex(0);
    try {
      const data = await analyzeRequirements(projectId, (idx) => {
        setStageIndex(idx);
      });
      setAnalysisData(data);
      setStatus('completed');
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || 'We could not analyze your requirements at this time.');
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
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Requirement Analysis
            </h1>
            {analysisData?.complexity && (
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase bp-mono"
                style={{
                  background:
                    analysisData.complexity === 'high'
                      ? 'rgba(239,68,68,0.15)'
                      : analysisData.complexity === 'medium'
                      ? 'rgba(245,158,11,0.15)'
                      : 'rgba(52,211,153,0.15)',
                  color:
                    analysisData.complexity === 'high'
                      ? '#F87171'
                      : analysisData.complexity === 'medium'
                      ? '#FBBF24'
                      : '#34D399',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {analysisData.complexity} Complexity
              </span>
            )}
          </div>
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
            <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">{errorMessage}</p>
            <div className="flex justify-center gap-3">
              <Link
                to={`/projects/${projectId}/requirements`}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors text-slate-200"
              >
                Edit Requirements
              </Link>
              <button
                onClick={startAnalysis}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm transition-colors text-white"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {status === 'completed' && analysisData && (
          <div className="space-y-6 animate-slide-up">

            {/* Summary Block */}
            {analysisData.summary && (
              <div style={CARD_STYLE} className="p-6">
                <h2 style={SECTION_LABEL_STYLE}>Executive Summary</h2>
                <p className="text-slate-300 text-sm leading-relaxed">{analysisData.summary}</p>
              </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label="Functional" value={analysisData.functionalRequirements?.length || 0} />
              <StatCard label="Non-Functional" value={analysisData.nonFunctionalRequirements?.length || 0} />
              <StatCard label="User Actors" value={analysisData.actors?.length || 0} />
              <StatCard label="Domain Entities" value={analysisData.entities?.length || 0} />
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

                {/* Business Goals & Constraints */}
                <StringListCard title="Business Goals" items={analysisData.businessGoals} badgeColor="#34D399" />
                <StringListCard title="Constraints" items={analysisData.constraints} badgeColor="#F87171" />
                <StringListCard title="Technology Hints" items={analysisData.technologyHints} badgeColor="#22D3EE" />

              </div>

              {/* Right Column (Entities & Context) */}
              <div className="space-y-6">

                {/* User Roles */}
                <div style={CARD_STYLE} className="p-6">
                  <h2 style={SECTION_LABEL_STYLE}>Identified Actors</h2>
                  <EntityGrid items={analysisData.actors} nameKey="name" descKey="description" />
                </div>

                {/* Domain Entities */}
                <div style={CARD_STYLE} className="p-6">
                  <h2 style={SECTION_LABEL_STYLE}>Domain Entities</h2>
                  <EntityGrid items={analysisData.entities} nameKey="name" descKey="description" />
                </div>

                {/* Risks & Ambiguities */}
                <StringListCard title="Risks" items={analysisData.risks} badgeColor="#F87171" />
                <StringListCard title="Ambiguities" items={analysisData.ambiguities} badgeColor="#FBBF24" />

              </div>
            </div>

          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default AnalysisPage;
