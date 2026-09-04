/**
 * useAnalysis.js
 *
 * Orchestration hook for requirement analysis.
 * Manages processing status, stage index, analysis data, and error handling.
 * Communicates strictly with analysisService API layer.
 */

import { useState, useEffect, useCallback } from 'react';
import { analyzeRequirements, getLatestAnalysis } from '../services/analysisService';

export const useAnalysis = (projectId) => {
  const [status, setStatus] = useState('idle'); // 'idle' | 'processing' | 'completed' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [stageIndex, setStageIndex] = useState(0);
  const [analysisData, setAnalysisData] = useState(null);

  const startAnalysis = useCallback(async () => {
    if (!projectId) return;
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
      console.error('Requirement analysis error:', error);
      setErrorMessage(error.message || 'We could not analyze your requirements at this time.');
      setStatus('error');
    }
  }, [projectId]);

  const loadOrCreateAnalysis = useCallback(async () => {
    if (!projectId) return;
    setStatus('processing');
    setErrorMessage('');

    try {
      const existing = await getLatestAnalysis(projectId);
      if (existing) {
        setAnalysisData(existing);
        setStatus('completed');
        return;
      }
      await startAnalysis();
    } catch {
      await startAnalysis();
    }
  }, [projectId, startAnalysis]);

  useEffect(() => {
    loadOrCreateAnalysis();
  }, [loadOrCreateAnalysis]);

  return {
    status,
    errorMessage,
    stageIndex,
    analysisData,
    startAnalysis,
    loadOrCreateAnalysis,
  };
};

export default useAnalysis;
