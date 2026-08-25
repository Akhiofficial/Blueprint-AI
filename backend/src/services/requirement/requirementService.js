import Requirement from '../../models/Requirement.js';
import Project from '../../models/Project.js';

/**
 * Creates a new requirement.
 * @param {string} projectId - Project ID
 * @param {string} ownerId - Owner's user ID
 * @param {Object} data - Requirement attributes
 * @returns {Promise<Object|null>} The created Requirement model instance or null if project not found/not owned
 */
export const createRequirement = async (projectId, ownerId, data) => {
  const project = await Project.findOne({ _id: projectId, owner: ownerId });
  if (!project) return null;

  return await Requirement.create({
    ...data,
    project: projectId,
  });
};

/**
 * Retrieves all requirements for a specific project.
 * @param {string} projectId - Project ID
 * @param {string} ownerId - Owner's user ID
 * @returns {Promise<Array|null>} List of Requirement documents or null if project not found/not owned
 */
export const getRequirements = async (projectId, ownerId) => {
  const project = await Project.findOne({ _id: projectId, owner: ownerId });
  if (!project) return null;

  // Sorting by creation date ascending (or requirementId) to keep consistent order
  return await Requirement.find({ project: projectId }).sort({ createdAt: 1 });
};

/**
 * Retrieves a single requirement by ID.
 * @param {string} projectId - Project ID
 * @param {string} requirementId - Requirement ID
 * @param {string} ownerId - Owner's user ID
 * @returns {Promise<Object|null>} The Requirement document or null if not found
 */
export const getRequirementById = async (projectId, requirementId, ownerId) => {
  const project = await Project.findOne({ _id: projectId, owner: ownerId });
  if (!project) return null;

  return await Requirement.findOne({ _id: requirementId, project: projectId });
};

/**
 * Updates a requirement.
 * @param {string} projectId - Project ID
 * @param {string} requirementId - Requirement ID
 * @param {string} ownerId - Owner's user ID
 * @param {Object} updateData - Fields to update
 * @returns {Promise<Object|null>} The updated Requirement document or null if not found
 */
export const updateRequirement = async (projectId, requirementId, ownerId, updateData) => {
  const project = await Project.findOne({ _id: projectId, owner: ownerId });
  if (!project) return null;

  const requirement = await Requirement.findOne({ _id: requirementId, project: projectId });
  if (!requirement) return null;

  // Prevent project overriding from updateData
  delete updateData.project;
  
  Object.assign(requirement, updateData);
  return await requirement.save();
};

/**
 * Deletes a requirement.
 * @param {string} projectId - Project ID
 * @param {string} requirementId - Requirement ID
 * @param {string} ownerId - Owner's user ID
 * @returns {Promise<boolean>} True if requirement deleted, false otherwise
 */
export const deleteRequirement = async (projectId, requirementId, ownerId) => {
  const project = await Project.findOne({ _id: projectId, owner: ownerId });
  if (!project) return false;

  const requirement = await Requirement.findOne({ _id: requirementId, project: projectId });
  if (!requirement) return false;

  await requirement.deleteOne();
  return true;
};
