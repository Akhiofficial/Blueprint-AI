import { useState, useEffect } from 'react';
import { loadRequirements } from '../../requirements/services/requirementService';
import api from '../../../services/api';

/**
 * useWorkflowStage — determines the current workflow stage of a project
 * by querying existing API endpoints. No new backend endpoints needed.
 *
 * Workflow stages:
 *   'loading'      — Still fetching data
 *   'requirements' — No requirements saved yet → user should complete requirements
 *   'analysis'     — Requirements exist but no AI analysis has been run yet
 *   'workspace'    — Analysis has been run; blueprint workspace is accessible
 *
 * Route mapping:
 *   requirements → /projects/:id/requirements
 *   analysis     → /projects/:id/requirements  (user confirms reqs then runs analysis)
 *   workspace    → /projects/:id/workspace
 */
const useWorkflowStage = (projectId) => {
  const [stage, setStage] = useState('loading');

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;

    const detect = async () => {
      try {
        // Step 1: Check if any requirements text has been saved for this project
        const { text } = await loadRequirements(projectId);

        if (!text || !text.trim()) {
          // No requirements saved → user needs to fill in requirements first
          if (!cancelled) setStage('requirements');
          return;
        }

        // Step 2: Requirements exist — check if AI analysis has been run
        try {
          await api.get(`/api/projects/${projectId}/requirements/analysis`);
          // Analysis record found → user can access the workspace
          if (!cancelled) setStage('workspace');
        } catch (err) {
          if (err?.response?.status === 404) {
            // Requirements exist but analysis hasn't been run yet
            if (!cancelled) setStage('analysis');
          } else {
            // Network or server error — fall back to requirements stage safely
            if (!cancelled) setStage('requirements');
          }
        }
      } catch {
        // Could not load requirements (network error, etc.) — safe fallback
        if (!cancelled) setStage('requirements');
      }
    };

    detect();
    return () => { cancelled = true; };
  }, [projectId]);

  return stage;
};

export default useWorkflowStage;
