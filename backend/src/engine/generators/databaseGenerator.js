/**
 * databaseGenerator.js
 *
 * Generates the structured Database Schema (entities, fields, constraints, relationships, indexes, ER diagram).
 * Depends on prerequisite SRS output context and project metadata.
 * Delegates AI execution to generationPipeline.
 */

import { SYSTEM_INSTRUCTION, buildDatabasePrompt } from '../prompts/database.prompt.js';
import { databaseSchemaValidator } from '../validators/databaseValidator.js';
import { runPipeline } from '../core/generationPipeline.js';

/**
 * Generates a structured Database Schema object.
 *
 * @param {Object} srsOutput     - Prerequisite SRS output object
 * @param {Object} [projectInfo] - Optional project metadata ({ title, description })
 * @param {string} [ragContext]  - Optional retrieved context from RAG
 * @param {string} [modelName]   - Preferred model identifier
 * @returns {Promise<{ success: boolean, data?: Object, model?: string, provider?: string, error?: string }>}
 */
export const generateDatabaseDocument = async (srsOutput, projectInfo = {}, ragContext = '', modelName) => {
  let prompt = buildDatabasePrompt(srsOutput, projectInfo);

  if (ragContext) {
    prompt += `\n\nADDITIONAL PROJECT CONTEXT (Use if relevant):\n"""\n${ragContext}\n"""`;
  }

  return await runPipeline({
    prompt,
    systemInstruction: SYSTEM_INSTRUCTION,
    schema: databaseSchemaValidator,
    modelName,
    role: 'primary'
  });
};
