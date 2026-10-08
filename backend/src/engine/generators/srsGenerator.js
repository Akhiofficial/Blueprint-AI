/**
 * srsGenerator.js
 *
 * Generates the Software Requirements Specification (SRS).
 * Depends on prerequisite BRD output context and project metadata.
 * Delegates AI execution to generationPipeline.
 */

import { SYSTEM_INSTRUCTION, buildSRSPrompt } from '../prompts/srs.prompt.js';
import { srsSchema } from '../../validators/srsValidator.js';
import { runPipeline } from '../core/generationPipeline.js';

/**
 * Generates a structured SRS document object.
 *
 * @param {Object} brdOutput - Prerequisite BRD output object
 * @param {Object} [projectInfo] - Optional project metadata ({ title, description })
 * @param {string} [ragContext] - Optional retrieved context from RAG
 * @param {string} [modelName] - Preferred model identifier
 * @returns {Promise<{ success: boolean, data?: Object, model?: string, provider?: string, error?: string }>}
 */
export const generateSRSDocument = async (brdOutput, projectInfo = {}, ragContext = '', modelName) => {
  let prompt = buildSRSPrompt(brdOutput, projectInfo);

  if (ragContext) {
    prompt += `\n\nADDITIONAL PROJECT CONTEXT (Use if relevant):\n"""\n${ragContext}\n"""`;
  }

  return await runPipeline({
    prompt,
    systemInstruction: SYSTEM_INSTRUCTION,
    schema: srsSchema,
    modelName,
    role: 'primary',
  });
};
