/**
 * analysisService.js
 *
 * API client layer for Requirement Analysis.
 * Communicates with backend endpoints:
 *   POST /api/projects/:projectId/requirements/analyze
 *   GET /api/projects/:projectId/requirements/analysis
 */

import api from '../../../services/api';

export const ANALYSIS_STAGES = [
  { id: 'reading', label: 'Reading requirements' },
  { id: 'scope', label: 'Identifying project scope' },
  { id: 'extract-fr', label: 'Extracting functional requirements' },
  { id: 'extract-nfr', label: 'Identifying non-functional requirements' },
  { id: 'context', label: 'Organizing project context' },
];

/**
 * Triggers the AI requirement analysis API call on the backend.
 * Advances progress stages while waiting for the HTTP response.
 *
 * @param {string} projectId
 * @param {function(number)} onProgress - Callback receiving stage index (0-4)
 * @returns {Promise<Object>} The structured requirement analysis response
 */
export const analyzeRequirements = async (projectId, onProgress) => {
  let currentStage = 0;
  if (onProgress) onProgress(0);

  const interval = setInterval(() => {
    currentStage = Math.min(currentStage + 1, ANALYSIS_STAGES.length - 1);
    if (onProgress) onProgress(currentStage);
  }, 900);

  try {
    const response = await api.post(`/api/projects/${projectId}/requirements/analyze`);
    clearInterval(interval);
    if (onProgress) onProgress(ANALYSIS_STAGES.length - 1);
    return response.data.data;
  } catch (err) {
    clearInterval(interval);
    const message = err.response?.data?.message || err.message || 'Analysis failed. Please try again.';
    throw new Error(message);
  }
};

/**
 * Fetches the latest completed requirement analysis for a project.
 *
 * @param {string} projectId
 * @returns {Promise<Object|null>} The structured analysis data or null if not found
 */
export const getLatestAnalysis = async (projectId) => {
  try {
    const response = await api.get(`/api/projects/${projectId}/requirements/analysis`);
    return response.data.data;
  } catch (err) {
    if (err.response?.status === 404) {
      return null;
    }
    const message = err.response?.data?.message || err.message || 'Failed to fetch analysis.';
    throw new Error(message);
  }
};
