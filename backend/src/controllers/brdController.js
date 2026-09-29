import asyncHandler from '../utils/asyncHandler.js';
import * as brdService from '../services/generation/brdService.js';

/**
 * @desc    Generate a Business Requirements Document (BRD) for a project
 * @route   POST /api/projects/:projectId/brd/generate
 * @access  Private
 */
export const generateBRD = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const ownerId = req.user._id;

  const result = await brdService.generateBRD(projectId, ownerId);

  if (result.status === 'unauthorized') {
    res.status(404);
    throw new Error('Project not found or unauthorized');
  }

  if (result.status === 'no_analysis') {
    res.status(400);
    throw new Error(result.error || 'No completed requirement analysis found for this project.');
  }

  if (result.status === 'in_progress') {
    res.status(409);
    throw new Error(result.error || 'BRD generation is already in progress.');
  }

  if (result.status === 'validation_error') {
    res.status(422);
    throw new Error(result.error || 'AI generated BRD failed validation.');
  }

  if (result.status === 'service_error' || result.status === 'engine_error') {
    res.status(500);
    throw new Error(result.error || 'Failed to generate BRD due to an internal engine error.');
  }

  res.status(200).json({
    success: true,
    data: result.data,
    generationId: result.generationId,
    generationType: 'brd',
  });
});

/**
 * @desc    Get the latest completed BRD for a project
 * @route   GET /api/projects/:projectId/brd
 * @access  Private
 */
export const getLatestBRD = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const ownerId = req.user._id;

  const result = await brdService.getLatestBRD(projectId, ownerId);

  if (result.status === 'unauthorized') {
    res.status(404);
    throw new Error('Project not found or unauthorized');
  }

  if (result.status === 'not_found') {
    res.status(404);
    throw new Error('No BRD found for this project.');
  }

  res.status(200).json({
    success: true,
    data: result.data,
    generationId: result.generationId,
    updatedAt: result.updatedAt,
  });
});
