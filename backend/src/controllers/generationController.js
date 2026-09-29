/**
 * generationController.js
 *
 * HTTP controller for generic document generation endpoints.
 * Reads auth context and route params, delegates to generationService,
 * and maps application-level statuses to HTTP responses.
 *
 * Must NOT contain: Gemini calls, RAG calls, prompt building, DB access, engine logic.
 */

import asyncHandler from '../utils/asyncHandler.js';
import * as generationService from '../services/generation/generationService.js';

/**
 * @desc    Trigger AI generation for a given document type
 * @route   POST /api/projects/:projectId/generations/:generationType
 * @access  Private
 */
export const generateDocument = asyncHandler(async (req, res) => {
  const { projectId, generationType } = req.params;
  const ownerId = req.user._id;

  const result = await generationService.generateDocument(projectId, ownerId, generationType);

  if (result.status === 'unauthorized') {
    res.status(404);
    throw new Error('Project not found or unauthorized');
  }

  if (result.status === 'unsupported_type') {
    res.status(400);
    throw new Error(result.error);
  }

  if (result.status === 'not_implemented') {
    res.status(501);
    throw new Error(result.error);
  }

  if (result.status === 'in_progress') {
    res.status(409);
    throw new Error(result.error);
  }

  if (result.status === 'missing_prerequisite') {
    res.status(400);
    throw new Error(result.error);
  }

  if (result.status === 'engine_error') {
    res.status(500);
    throw new Error(result.error || 'Generation failed due to an internal engine error.');
  }

  res.status(200).json({
    success: true,
    data: result.data,
    generationId: result.generationId,
    generationType,
  });
});

/**
 * @desc    Get the latest completed generation of a given type
 * @route   GET /api/projects/:projectId/generations/:generationType
 * @access  Private
 */
export const getLatestGeneration = asyncHandler(async (req, res) => {
  const { projectId, generationType } = req.params;
  const ownerId = req.user._id;

  const result = await generationService.getLatestGeneration(projectId, ownerId, generationType);

  if (result.status === 'unauthorized') {
    res.status(404);
    throw new Error('Project not found or unauthorized');
  }

  if (result.status === 'not_found') {
    res.status(404);
    throw new Error(`No completed ${generationType} generation found for this project.`);
  }

  res.status(200).json({
    success: true,
    data: result.data,
    generationId: result.generationId,
    updatedAt: result.updatedAt,
    generationType,
  });
});
