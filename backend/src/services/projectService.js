import Project from '../models/Project.js';

/**
 * Creates a new project.
 * @param {Object} data - Project attributes
 * @param {string} ownerId - ID of the project owner
 * @returns {Promise<Object>} The created Project model instance
 */
export const createProject = async (data, ownerId) => {
  return await Project.create({
    ...data,
    owner: ownerId,
  });
};

/**
 * Retrieves all projects owned by a specific user.
 * @param {string} ownerId - Owner's user ID
 * @returns {Promise<Array>} List of Project documents sorted by creation date descending
 */
export const getProjects = async (ownerId) => {
  return await Project.find({ owner: ownerId }).sort({ createdAt: -1 });
};

/**
 * Retrieves a single project by ID and owner.
 * @param {string} projectId - Project ID
 * @param {string} ownerId - Owner's user ID
 * @returns {Promise<Object|null>} The Project document or null if not found
 */
export const getProjectById = async (projectId, ownerId) => {
  return await Project.findOne({ _id: projectId, owner: ownerId });
};

/**
 * Updates a project.
 * @param {string} projectId - Project ID
 * @param {string} ownerId - Owner's user ID
 * @param {Object} updateData - Fields to update
 * @returns {Promise<Object|null>} The updated Project document or null if not found
 */
export const updateProject = async (projectId, ownerId, updateData) => {
  const project = await Project.findOne({ _id: projectId, owner: ownerId });
  if (!project) return null;

  Object.assign(project, updateData);
  return await project.save();
};

/**
 * Deletes a project.
 * @param {string} projectId - Project ID
 * @param {string} ownerId - Owner's user ID
 * @returns {Promise<boolean>} True if project deleted, false otherwise
 */
export const deleteProject = async (projectId, ownerId) => {
  const project = await Project.findOne({ _id: projectId, owner: ownerId });
  if (!project) return false;

  await project.deleteOne();
  return true;
};
