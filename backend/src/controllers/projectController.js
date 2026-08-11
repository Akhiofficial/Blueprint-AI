import * as projectService from '../services/projectService.js';
import asyncHandler from '../utils/asyncHandler.js';
import { createProjectSchema, updateProjectSchema } from '../validators/projectValidator.js';

// ─────────────────────────────────────────────
// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
// ─────────────────────────────────────────────
const createProject = asyncHandler(async (req, res) => {
  const parsed = createProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400);
    throw new Error(parsed.error.issues.map((e) => e.message).join(', '));
  }

  const project = await projectService.createProject(parsed.data, req.user._id);

  res.status(201).json({ success: true, data: project });
});

// ─────────────────────────────────────────────
// @desc    Get all projects for the logged-in user
// @route   GET /api/projects
// @access  Private
// ─────────────────────────────────────────────
const getProjects = asyncHandler(async (req, res) => {
  const projects = await projectService.getProjects(req.user._id);

  res.status(200).json({ success: true, count: projects.length, data: projects });
});

// ─────────────────────────────────────────────
// @desc    Get a single project by ID
// @route   GET /api/projects/:id
// @access  Private — ownership enforced
// ─────────────────────────────────────────────
const getProjectById = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectById(req.params.id, req.user._id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  res.status(200).json({ success: true, data: project });
});

// ─────────────────────────────────────────────
// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private — ownership enforced
// ─────────────────────────────────────────────
const updateProject = asyncHandler(async (req, res) => {
  const parsed = updateProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400);
    throw new Error(parsed.error.issues.map((e) => e.message).join(', '));
  }

  const project = await projectService.updateProject(req.params.id, req.user._id, parsed.data);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  res.status(200).json({ success: true, data: project });
});

// ─────────────────────────────────────────────
// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private — ownership enforced
// ─────────────────────────────────────────────
const deleteProject = asyncHandler(async (req, res) => {
  const success = await projectService.deleteProject(req.params.id, req.user._id);

  if (!success) {
    res.status(404);
    throw new Error('Project not found');
  }

  res.status(200).json({ success: true, message: 'Project deleted successfully' });
});

export { createProject, getProjects, getProjectById, updateProject, deleteProject };

