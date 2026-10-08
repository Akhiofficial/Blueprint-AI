/**
 * userStoryGenerator.js
 *
 * Generates user stories in standard 'As a / I want / So that' format,
 * grouped by epic, with acceptance criteria and story point estimates.
 * Depends on prerequisite SRS output context and project metadata.
 * Delegates AI execution to generationPipeline.
 */

import { SYSTEM_INSTRUCTION, buildUserStoriesPrompt } from '../prompts/userStories.prompt.js';
import { userStoriesSchema } from '../validators/userStoryValidator.js';
import { runPipeline } from '../core/generationPipeline.js';

/**
 * Generates a structured User Stories document object.
 *
 * @param {Object} srsOutput - Prerequisite SRS output object
 * @param {Object} [projectInfo] - Optional project metadata ({ title, description })
 * @param {string} [ragContext] - Optional retrieved context from RAG
 * @param {string} [modelName] - Preferred model identifier
 * @returns {Promise<{ success: boolean, data?: Object, model?: string, provider?: string, error?: string }>}
 */
export const generateUserStoriesDocument = async (srsOutput, projectInfo = {}, ragContext = '', modelName) => {
  let prompt = buildUserStoriesPrompt(srsOutput, projectInfo);

  if (ragContext) {
    prompt += `\n\nADDITIONAL PROJECT CONTEXT (Use if relevant):\n"""\n${ragContext}\n"""`;
  }

  return await runPipeline({
    prompt,
    systemInstruction: SYSTEM_INSTRUCTION,
    schema: userStoriesSchema,
    modelName,
    role: 'primary',
  });
};
