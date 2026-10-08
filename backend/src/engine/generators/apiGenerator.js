/**
 * apiGenerator.js
 *
 * Generates the REST API Specification (OpenAPI-compatible structure).
 * Depends on prerequisite SRS output context and project metadata.
 * Delegates AI execution to generationPipeline.
 */

import { SYSTEM_INSTRUCTION, buildApiPrompt } from '../prompts/api.prompt.js';
import { apiSpecSchema } from '../validators/apiValidator.js';
import { runPipeline } from '../core/generationPipeline.js';

/**
 * Generates a structured REST API Specification object.
 *
 * @param {Object} srsOutput   - Prerequisite SRS output object
 * @param {Object} [projectInfo] - Optional project metadata ({ title, description })
 * @param {string} [ragContext]  - Optional retrieved context from RAG
 * @param {string} [modelName]   - Preferred model identifier
 * @returns {Promise<{ success: boolean, data?: Object, model?: string, provider?: string, error?: string }>}
 */
export const generateApiDocument = async (srsOutput, projectInfo = {}, ragContext = '', modelName) => {
  let prompt = buildApiPrompt(srsOutput, projectInfo);

  if (ragContext) {
    prompt += `\n\nADDITIONAL PROJECT CONTEXT (Use if relevant):\n"""\n${ragContext}\n"""`;
  }

  return await runPipeline({
    prompt,
    systemInstruction: SYSTEM_INSTRUCTION,
    schema: apiSpecSchema,
    modelName,
    role: 'primary',
  });
};
