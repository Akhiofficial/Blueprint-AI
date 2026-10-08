/**
 * refinementService.js
 *
 * Application-level service for AI document refinement.
 *
 * Responsibilities:
 *   1. Verify project ownership (identical pattern to documentController)
 *   2. Load the current persisted document content
 *   3. Validate the instruction is not empty
 *   4. Delegate to refinementGenerator (engine layer)
 *   5. Return the proposed update — NEVER persists it
 *
 * The returned updatedContent is sent to the frontend.
 * The user reviews it and must explicitly Save — persistence goes through
 * the existing documentService.saveDocumentContent() path.
 *
 * This service has NO direct DB write access to documents/versions.
 */

import Project from '../../models/Project.js';
import Document from '../../models/Document.js';
import { buildProjectContext } from '../../engine/context/projectContext.js';
import { refineDocumentContent } from '../../engine/generators/refinementGenerator.js';
import { env } from '../../config/env.js';

// ── Supported doc types for refinement (must match Document.type enum) ─────
const SUPPORTED_DOC_TYPES = new Set(['BRD', 'SRS', 'UserStories', 'APISpec', 'DBSchema']);

/**
 * Refines a document using AI.
 *
 * @param {object} params
 * @param {string} params.projectId   - MongoDB project ObjectId
 * @param {string} params.ownerId     - Authenticated user ObjectId
 * @param {string} params.docType     - Document.type enum: 'BRD'|'SRS'|'UserStories'|'APISpec'|'DBSchema'
 * @param {string} params.instruction - User's natural-language modification instruction
 * @returns {Promise<{status: string, message?: string, updatedContent?: object, error?: string}>}
 */
export const refineDocument = async ({ projectId, ownerId, docType, instruction }) => {
  // 1. Validate instruction
  if (!instruction || typeof instruction !== 'string' || !instruction.trim()) {
    return { status: 'invalid_input', error: 'Instruction cannot be empty.' };
  }

  // 2. Validate docType
  if (!SUPPORTED_DOC_TYPES.has(docType)) {
    return {
      status: 'unsupported_type',
      error: `Unsupported document type: ${docType}. Supported: BRD, SRS, UserStories, APISpec, DBSchema.`,
    };
  }

  // 3. Verify project ownership (same pattern as documentController)
  const project = await Project.findOne({ _id: projectId, owner: ownerId });
  if (!project) {
    return { status: 'unauthorized', error: 'Project not found or unauthorized.' };
  }

  // 4. Load the current persisted document
  const doc = await Document.findOne({ project: projectId, type: docType });
  if (!doc || !doc.content) {
    return {
      status: 'not_found',
      error: `No ${docType} document found. Please generate it first.`,
    };
  }

  // 5. Parse the document content
  let currentContent;
  try {
    currentContent = typeof doc.content === 'string' ? JSON.parse(doc.content) : doc.content;
  } catch {
    return {
      status: 'parse_error',
      error: 'Could not parse the existing document content. Please re-generate it.',
    };
  }

  // 6. Build project context for the prompt
  const projectInfo = await buildProjectContext(projectId);

  // 7. Delegate to the engine (no DB writes here)
  const modelName = env.GEMINI_MODEL || 'gemini-2.0-flash';

  console.log(`[RefinementService] START — projectId=${projectId}, docType=${docType}, instructionLength=${instruction.trim().length}`);

  const result = await refineDocumentContent({
    docType,
    currentContent,
    instruction: instruction.trim(),
    projectInfo,
    modelName,
  });

  if (!result.success) {
    console.warn(`[RefinementService] FAILED — projectId=${projectId}, docType=${docType}: ${result.error}`);
    return { status: 'engine_error', error: result.error };
  }

  console.log(`[RefinementService] SUCCESS — projectId=${projectId}, docType=${docType}, provider=${result.provider}`);

  return {
    status: 'success',
    message: result.message,
    updatedContent: result.updatedContent,
    model: result.model,
    provider: result.provider,
  };
};
