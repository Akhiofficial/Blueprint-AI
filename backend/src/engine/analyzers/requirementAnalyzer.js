/**
 * requirementAnalyzer.js
 *
 * Analyzes and classifies project requirements using Gemini AI.
 * Encapsulates prompt assembly, LLM execution, and Zod output validation.
 */

import { SYSTEM_INSTRUCTION, buildRequirementAnalysisPrompt } from '../prompts/requirementAnalysis.prompt.js';
import { generateJSON } from '../providers/geminiProvider.js';
import { requirementAnalysisSchema } from '../../validators/analysisValidator.js';

/**
 * Executes requirement analysis via Gemini AI and validates the structured output.
 *
 * @param {string} combinedText - Normalized requirement text content
 * @param {Object} [projectInfo] - Optional project metadata ({ title, description })
 * @param {string} [modelName] - Gemini model identifier
 * @returns {Promise<{ success: boolean, data?: Object, error?: string }>}
 */
export const analyzeRequirements = async (combinedText, projectInfo = {}, modelName) => {
  const prompt = buildRequirementAnalysisPrompt(combinedText, projectInfo);

  const rawOutput = await generateJSON({
    prompt,
    systemInstruction: SYSTEM_INSTRUCTION,
    modelName,
  });

  const parsed = requirementAnalysisSchema.safeParse(rawOutput);
  if (!parsed.success) {
    const validationError = parsed.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join(', ');

    return {
      success: false,
      error: `AI output validation failed: ${validationError}`,
    };
  }

  return {
    success: true,
    data: parsed.data,
  };
};
