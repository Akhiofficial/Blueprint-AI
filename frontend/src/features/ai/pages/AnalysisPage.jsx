/**
 * AnalysisPage.jsx
 *
 * Route: /projects/:id/analysis
 *
 * Step 3 in the BlueprintAI workflow:
 *   01 Project → 02 Requirements → 03 Analysis → 04 Blueprint
 *
 * Composition container page for Requirement Analysis.
 * Uses 4-layer architecture:
 *   UI (AnalysisPage + components) → Hook (useAnalysis) → Service (analysisService) → API
 */

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { useProjectsContext } from '../../projects/projects.context';
import useProjects from '../../projects/hooks/useProjects';
import WorkflowIndicator from '../../../components/common/WorkflowIndicator';
import useAnalysis from '../hooks/useAnalysis';

// Presentation Components
import AnalysisHeader from '../components/AnalysisHeader';
import ExecutiveSummary from '../components/ExecutiveSummary';
import AnalysisStats from '../components/AnalysisStats';
import RequirementTable from '../components/RequirementTable';
import EntityGridSection from '../components/EntityGridSection';
import StringListCard from '../components/StringListCard';
import ProcessingView from '../components/ProcessingView';
import AnalysisErrorView from '../components/AnalysisErrorView';

const AnalysisPage = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const { currentProject, loading: projectLoading } = useProjectsContext();
  const { handleFetchProjectById } = useProjects();

  // Layer 2: custom orchestration hook
  const {
    status,
    errorMessage,
    stageIndex,
    analysisData,
    startAnalysis,
  } = useAnalysis(projectId);

  // Load project if not present in context
  useEffect(() => {
    if (!currentProject || currentProject._id !== projectId) {
      handleFetchProjectById(projectId);
    }
  }, [projectId, currentProject, handleFetchProjectById]);

  const handleGenerateBlueprint = () => {
    navigate(`/projects/${projectId}/workspace?doc=BRD&autoGenerate=true`);
  };

  return (
    <DashboardLayout>
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 animate-fade-in pb-20 overflow-x-hidden">
        <WorkflowIndicator current={2} />

        <AnalysisHeader
          projectId={projectId}
          projectTitle={currentProject?.title}
          projectLoading={projectLoading}
          complexity={analysisData?.complexity}
          status={status}
          onReAnalyze={startAnalysis}
          onGenerateBlueprint={handleGenerateBlueprint}
        />

        {status === 'processing' && <ProcessingView stageIndex={stageIndex} />}

        {status === 'error' && (
          <AnalysisErrorView
            errorMessage={errorMessage}
            projectId={projectId}
            onRetry={startAnalysis}
          />
        )}

        {status === 'completed' && analysisData && (
          <div className="space-y-6 animate-slide-up w-full">
            {/* Executive Summary */}
            <ExecutiveSummary summary={analysisData.summary} />

            {/* Summary Statistics */}
            <AnalysisStats
              functionalCount={analysisData.functionalRequirements?.length || 0}
              nonFunctionalCount={analysisData.nonFunctionalRequirements?.length || 0}
              actorsCount={analysisData.actors?.length || 0}
              entitiesCount={analysisData.entities?.length || 0}
            />

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full items-start">
              {/* Main Column */}
              <div className="lg:col-span-2 space-y-6 w-full min-w-0">
                <RequirementTable
                  title="Functional Requirements"
                  requirements={analysisData.functionalRequirements}
                  isFunctional={true}
                />
                <RequirementTable
                  title="Non-Functional Requirements"
                  requirements={analysisData.nonFunctionalRequirements}
                  isFunctional={false}
                />
                <StringListCard title="Business Goals" items={analysisData.businessGoals} badgeColor="#34D399" />
                <StringListCard title="Constraints" items={analysisData.constraints} badgeColor="#F87171" />
                <StringListCard title="Technology Hints" items={analysisData.technologyHints} badgeColor="#22D3EE" />
              </div>

              {/* Sidebar Column */}
              <div className="space-y-6 w-full min-w-0">
                <EntityGridSection
                  title="Identified Actors"
                  items={analysisData.actors}
                  nameKey="name"
                  descKey="description"
                />
                <EntityGridSection
                  title="Domain Entities"
                  items={analysisData.entities}
                  nameKey="name"
                  descKey="description"
                />
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
