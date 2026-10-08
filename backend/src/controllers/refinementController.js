/**
 * refinementController.js
 *
 * HTTP controller for AI document refinement.
 *
 * Route:
 *   POST /api/projects/:projectId/documents/:docType/refine
 *
 * This controller does NOT persist anything.
 * It delegates to refinementService, which calls the AI and returns
 * a proposed updatedContent JSON for the frontend to apply as a local draft.
 *
 * Persistence happens only when the user clicks Save,
 * going through the existing documentController.saveDocument path.
 *
 * Must NOT contain: Gemini calls, DB writes, prompt building, engine logic.
 */

import asyncHandler from '../utils/asyncHandler.js';
import * as refinementService from '../services/refinement/refinementService.js';

/**
 * @desc    Refine a document with a natural-language AI instruction
 * @route   POST /api/projects/:projectId/documents/:docType/refine
 * @access  Private
 *
 * Request body:
 *   { instruction: string }
 *
 * Response:
 *   { success: true, message: string, updatedContent: object }
 */
export const refineDocument = asyncHandler(async (req, res) => {
  const { projectId, docType } = req.params;
  const ownerId = req.user._id;
  const { instruction } = req.body;

  // Basic input validation at controller level
  if (!instruction || typeof instruction !== 'string' || !instruction.trim()) {
    res.status(400);
    throw new Error('Request body must include a non-empty instruction field.');
  }

  const result = await refinementService.refineDocument({
    projectId,
    ownerId,
    docType,
    instruction,
  });

  if (result.status === 'unauthorized') {
    res.status(404);
    throw new Error('Project not found or unauthorized.');
  }

  if (result.status === 'invalid_input') {
    res.status(400);
    throw new Error(result.error);
  }

  if (result.status === 'unsupported_type') {
    res.status(400);
    throw new Error(result.error);
  }

  if (result.status === 'not_found') {
    res.status(404);
    throw new Error(result.error);
  }

  if (result.status === 'parse_error') {
    res.status(422);
    throw new Error(result.error);
  }

  if (result.status === 'engine_error') {
    res.status(500);
    throw new Error(result.error || 'AI refinement failed due to an internal error.');
  }

  res.status(200).json({
    success: true,
    message: result.message,
    updatedContent: result.updatedContent,
  });
});
