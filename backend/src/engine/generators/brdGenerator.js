/**
 * brdGenerator.js
 *
 * Generates the Business Requirements Document (BRD).
 * Uses brd.prompt.js template + requirement analysis context + Gemini LLM provider.
 */

import { SYSTEM_INSTRUCTION, buildBRDPrompt } from '../prompts/brd.prompt.js';
import { generateJSON } from '../providers/geminiProvider.js';
import { brdSchema } from '../../validators/brdValidator.js';

/**
 * Generates a structured BRD document object using Gemini AI and validates output via brdSchema.
 *
 * @param {Object} analysisOutput - Requirement analysis output object
 * @param {Object} [projectInfo] - Optional project metadata ({ title, description })
 * @param {string} [modelName] - Gemini model identifier
 * @returns {Promise<{ success: boolean, data?: Object, error?: string }>}
 */
export const generateBRDDocument = async (analysisOutput, projectInfo = {}, modelName) => {
  const prompt = buildBRDPrompt(analysisOutput, projectInfo);

  const rawOutput = await generateJSON({
    prompt,
    systemInstruction: SYSTEM_INSTRUCTION,
    modelName,
  });

  const parsed = brdSchema.safeParse(rawOutput);
  if (!parsed.success) {
    const validationError = parsed.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join(', ');

    return {
      success: false,
      error: `AI BRD output validation failed: ${validationError}`,
    };
  }

  return {
    success: true,
    data: parsed.data,
  };
};
