import Project from '../models/Project.js';
import asyncHandler from '../utils/asyncHandler.js';
import { createProjectSchema, updateProjectSchema } from '../schemas/projectSchema.js';

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

  const project = await Project.create({
    ...parsed.data,
    owner: req.user._id,
  });

  res.status(201).json({ success: true, data: project });
});

// ─────────────────────────────────────────────
// @desc    Get all projects for the logged-in user
// @route   GET /api/projects
// @access  Private
// ─────────────────────────────────────────────
const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ owner: req.user._id }).sort({
    createdAt: -1,
  });

  res.status(200).json({ success: true, count: projects.length, data: projects });
});

// ─────────────────────────────────────────────
// @desc    Get a single project by ID
// @route   GET /api/projects/:id
// @access  Private — ownership enforced
// ─────────────────────────────────────────────
const getProjectById = asyncHandler(async (req, res) => {
  // Querying by both _id and owner ensures non-owners get 404 (not a 403 that leaks existence)
  const project = await Project.findOne({
    _id: req.params.id,
    owner: req.user._id,
  });

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

  const project = await Project.findOne({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  // Apply only the fields that were sent
  Object.assign(project, parsed.data);
  const updated = await project.save();

  res.status(200).json({ success: true, data: updated });
});

// ─────────────────────────────────────────────
// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private — ownership enforced
// ─────────────────────────────────────────────
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findOne({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  await project.deleteOne();

  res.status(200).json({ success: true, message: 'Project deleted successfully' });
});

export { createProject, getProjects, getProjectById, updateProject, deleteProject };
