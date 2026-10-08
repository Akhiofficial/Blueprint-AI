/**
 * refinementGenerator.js
 *
 * AI document refinement generator.
 * Combines the refinement prompt + existing generationPipeline + per-type Zod validators
 * to produce a structured, validated refined document.
 *
 * Architecture:
 *   refinementService → refinementGenerator → runPipeline → llmProvider (Gemini/Groq/OpenRouter)
 *
 * Placed in engine/generators/ to match brdGenerator, srsGenerator, etc.
 */

import { REFINEMENT_SYSTEM_INSTRUCTION, buildRefinementPrompt } from '../prompts/refinement.prompt.js';
import { runPipeline } from '../core/generationPipeline.js';

// Import Zod schemas for all 5 document types
import { brdSchema } from '../../validators/brdValidator.js';
import { srsSchema } from '../../validators/srsValidator.js';
import { userStoriesSchema } from '../validators/userStoryValidator.js';
import { apiSpecSchema } from '../validators/apiValidator.js';
import { databaseSchemaValidator } from '../validators/databaseValidator.js';
import { z } from 'zod';

// ─── Map docType → its Zod schema ────────────────────────────────────────────

const DOC_TYPE_SCHEMAS = {
  BRD: brdSchema,
  SRS: srsSchema,
  UserStories: userStoriesSchema,
  APISpec: apiSpecSchema,
  DBSchema: databaseSchemaValidator,
};

// ─── Response envelope schema ─────────────────────────────────────────────────

/**
 * The LLM must return:
 *   { message: string, updatedContent: object | array | null }
 *
 * We validate the envelope shape, allowing updatedContent to match either
 * the full document Zod schema, a normalized section/entity array, or a structured JSON object.
 */
const buildEnvelopeSchema = (contentSchema) => z.object({
  message: z.string().min(1, 'AI must provide a message describing the change'),
  updatedContent: z.union([contentSchema, z.array(z.any()), z.record(z.any())]).nullable(),
});

// ─── Main generator ───────────────────────────────────────────────────────────

/**
 * Refines a document using the AI.
 *
 * @param {object} params
 * @param {string} params.docType        - 'BRD' | 'SRS' | 'UserStories' | 'APISpec' | 'DBSchema'
 * @param {object} params.currentContent - The full parsed document JSON
 * @param {string} params.instruction    - User's natural-language instruction
 * @param {object} params.projectInfo    - { title, description } for context
 * @param {string} [params.modelName]    - Optional preferred model
 * @returns {Promise<{ success: boolean, message?: string, updatedContent?: object, error?: string }>}
 */
export const refineDocumentContent = async ({
  docType,
  currentContent,
  instruction,
  projectInfo = {},
  modelName,
}) => {
  const contentSchema = DOC_TYPE_SCHEMAS[docType];
  if (!contentSchema) {
    return {
      success: false,
      error: `Unsupported document type for refinement: ${docType}`,
    };
  }

  const envelopeSchema = buildEnvelopeSchema(contentSchema);
  const prompt = buildRefinementPrompt(docType, currentContent, instruction, projectInfo);

  const result = await runPipeline({
    prompt,
    systemInstruction: REFINEMENT_SYSTEM_INSTRUCTION,
    schema: envelopeSchema,
    modelName,
    role: 'refinement',
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error || 'AI refinement pipeline failed.',
    };
  }

  const { message, updatedContent } = result.data;

  // If the AI returned null for updatedContent, it means it couldn't apply the change
  if (updatedContent === null) {
    return {
      success: false,
      error: message || 'The AI could not apply the requested change to this document.',
    };
  }

  return {
    success: true,
    message,
    updatedContent,
    model: result.model,
    provider: result.provider,
  };
};
