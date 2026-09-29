/**
 * brdGenerator.js
 *
 * Generates the Business Requirements Document (BRD).
 * Uses brd.prompt.js template + requirement analysis context + pipeline execution.
 */

import { SYSTEM_INSTRUCTION, buildBRDPrompt } from '../prompts/brd.prompt.js';
import { brdSchema } from '../../validators/brdValidator.js';
import { runPipeline } from '../core/generationPipeline.js';

/**
 * Generates a structured BRD document object.
 *
 * @param {Object} analysisOutput - Requirement analysis output object
 * @param {Object} [projectInfo] - Optional project metadata ({ title, description })
 * @param {string} [ragContext] - Optional retrieved context from RAG
 * @param {string} [modelName] - Gemini model identifier
 * @returns {Promise<{ success: boolean, data?: Object, error?: string }>}
 */
export const generateBRDDocument = async (analysisOutput, projectInfo = {}, ragContext = '', modelName) => {
  let prompt = buildBRDPrompt(analysisOutput, projectInfo);
  
  if (ragContext) {
    prompt += `\n\nADDITIONAL PROJECT CONTEXT (Use if relevant):\n"""\n${ragContext}\n"""`;
  }

  return await runPipeline({
    prompt,
    systemInstruction: SYSTEM_INSTRUCTION,
    schema: brdSchema,
    modelName,
  });
};
