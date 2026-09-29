/**
 * requirementAnalyzer.js
 *
 * Analyzes and classifies project requirements using Gemini AI.
 * Encapsulates prompt assembly and delegates execution to generationPipeline.
 */

import { SYSTEM_INSTRUCTION, buildRequirementAnalysisPrompt } from '../prompts/requirementAnalysis.prompt.js';
import { requirementAnalysisSchema } from '../../validators/analysisValidator.js';
import { runPipeline } from '../core/generationPipeline.js';

/**
 * Executes requirement analysis.
 *
 * @param {string} combinedText - Normalized requirement text content
 * @param {Object} [projectInfo] - Optional project metadata ({ title, description })
 * @param {string} [modelName] - Gemini model identifier
 * @returns {Promise<{ success: boolean, data?: Object, error?: string }>}
 */
export const analyzeRequirements = async (combinedText, projectInfo = {}, modelName) => {
  const prompt = buildRequirementAnalysisPrompt(combinedText, projectInfo);

  return await runPipeline({
    prompt,
    systemInstruction: SYSTEM_INSTRUCTION,
    schema: requirementAnalysisSchema,
    modelName,
  });
};
