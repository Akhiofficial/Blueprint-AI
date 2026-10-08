import asyncHandler from '../utils/asyncHandler.js';
import * as requirementService from '../services/requirement/requirementService.js';
import * as analysisService from '../services/requirement/analysisService.js';
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

/**
 * @desc    Upload a requirement document (PDF / DOCX / TXT) for a project.
 * @route   POST /api/projects/:projectId/requirements/upload
 * @access  Private
 */
const uploadRequirementDoc = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const ownerId = req.user._id;

  if (!req.file) {
    res.status(400);
    throw new Error('No file was uploaded. Please attach a PDF, DOCX, or TXT file.');
  }

  const result = await requirementService.uploadRequirementDocument(
    projectId,
    ownerId,
    req.file
  );

  if (!result) {
    res.status(404);
    throw new Error('Project not found or you do not have access to it.');
  }

  const { knowledgeDoc, extractedText } = result;

  res.status(201).json({
    success: true,
    data: {
      knowledgeDocId: knowledgeDoc._id,
      filename: knowledgeDoc.name,
      fileType: knowledgeDoc.fileType,
      status: knowledgeDoc.status,
      chunkCount: knowledgeDoc.chunkCount,
      extractedText,
    },
  });
});

/**
 * @desc    Analyze project requirements using Gemini AI
 * @route   POST /api/projects/:projectId/requirements/analyze
 * @access  Private
 */
const analyzeRequirements = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const ownerId = req.user._id;

  const result = await analysisService.analyzeProjectRequirements(projectId, ownerId);

  if (result.status === 'unauthorized') {
    res.status(404);
    throw new Error('Project not found or unauthorized');
  }

  if (result.status === 'no_requirements') {
    res.status(400);
    throw new Error('No usable requirements found for this project. Please add or upload requirements first.');
  }

  if (result.status === 'validation_error') {
    res.status(422);
    throw new Error(result.error || 'AI generated response failed validation.');
  }

  if (result.status === 'service_error') {
    res.status(500);
    throw new Error(result.error || 'Failed to analyze requirements.');
  }

  res.status(200).json({
    success: true,
    data: result.data,
    generationId: result.generationId,
  });
});

/**
 * @desc    Get the latest completed requirement analysis for a project
 * @route   GET /api/projects/:projectId/requirements/analysis
 * @access  Private
 */
const getLatestAnalysis = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const ownerId = req.user._id;

  const result = await analysisService.getLatestAnalysis(projectId, ownerId);

  if (result.status === 'unauthorized') {
    res.status(404);
    throw new Error('Project not found or unauthorized');
  }

  if (result.status === 'not_found') {
    res.status(404);
    throw new Error('No requirement analysis found for this project.');
  }

  res.status(200).json({
    success: true,
    data: result.data,
    generationId: result.generationId,
    updatedAt: result.updatedAt,
  });
});

export {
  createRequirement,
  getRequirements,
  getRequirement,
  updateRequirement,
  deleteRequirement,
  uploadRequirementDoc,
  analyzeRequirements,
  getLatestAnalysis,
};

