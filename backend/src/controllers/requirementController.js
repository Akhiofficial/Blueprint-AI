import asyncHandler from '../utils/asyncHandler.js';
import * as requirementService from '../services/requirement/requirementService.js';
import { createRequirementSchema, updateRequirementSchema } from '../validators/requirementValidator.js';

/**
 * @desc    Create a new requirement
 * @route   POST /api/projects/:projectId/requirements
 * @access  Private
 */
const createRequirement = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const ownerId = req.user._id;

  // Validate request body
  const parsed = createRequirementSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400);
    throw new Error(parsed.error.issues.map((e) => e.message).join(', '));
  }
  const validatedData = parsed.data;

  const requirement = await requirementService.createRequirement(projectId, ownerId, validatedData);
  if (!requirement) {
    res.status(404);
    throw new Error('Project not found or unauthorized');
  }

  res.status(201).json({ success: true, data: requirement });
});

/**
 * @desc    Get all requirements for a project
 * @route   GET /api/projects/:projectId/requirements
 * @access  Private
 */
const getRequirements = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const ownerId = req.user._id;

  const requirements = await requirementService.getRequirements(projectId, ownerId);
  if (!requirements) {
    res.status(404);
    throw new Error('Project not found or unauthorized');
  }

  res.status(200).json({ success: true, data: requirements });
});

/**
 * @desc    Get a single requirement
 * @route   GET /api/projects/:projectId/requirements/:id
 * @access  Private
 */
const getRequirement = asyncHandler(async (req, res) => {
  const { projectId, id } = req.params;
  const ownerId = req.user._id;

  const requirement = await requirementService.getRequirementById(projectId, id, ownerId);
  if (!requirement) {
    res.status(404);
    throw new Error('Requirement not found or unauthorized');
  }

  res.status(200).json({ success: true, data: requirement });
});

/**
 * @desc    Update a requirement
 * @route   PUT /api/projects/:projectId/requirements/:id
 * @access  Private
 */
const updateRequirement = asyncHandler(async (req, res) => {
  const { projectId, id } = req.params;
  const ownerId = req.user._id;

  // Validate request body
  const parsed = updateRequirementSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400);
    throw new Error(parsed.error.issues.map((e) => e.message).join(', '));
  }
  const validatedData = parsed.data;

  const requirement = await requirementService.updateRequirement(projectId, id, ownerId, validatedData);
  if (!requirement) {
    res.status(404);
    throw new Error('Requirement not found or unauthorized');
  }

  res.status(200).json({ success: true, data: requirement });
});

/**
 * @desc    Delete a requirement
 * @route   DELETE /api/projects/:projectId/requirements/:id
 * @access  Private
 */
const deleteRequirement = asyncHandler(async (req, res) => {
  const { projectId, id } = req.params;
  const ownerId = req.user._id;

  const success = await requirementService.deleteRequirement(projectId, id, ownerId);
  if (!success) {
    res.status(404);
    throw new Error('Requirement not found or unauthorized');
  }

  res.status(200).json({ success: true, message: 'Requirement removed' });
});

export {
  createRequirement,
  getRequirements,
  getRequirement,
  updateRequirement,
  deleteRequirement,
};
