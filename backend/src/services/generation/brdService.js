/**
 * brdService.js
 *
 * Backend service for generating Business Requirements Documents (BRD).
 * Delegates to generationService which calls blueprintEngine.
 * Preserves the original external interface for backward compatibility.
 */

import * as generationService from './generationService.js';
import Project from '../../models/Project.js';
import Generation from '../../models/Generation.js';

/**
 * Generates a Business Requirements Document (BRD) for a project.
 *
 * @param {string} projectId - Project ID
 * @param {string} ownerId   - Authenticated user's ID
 * @returns {Promise<{ status: string, data?: Object, error?: string, generationId?: string }>}
 */
export const generateBRD = async (projectId, ownerId) => {
  const result = await generationService.generateDocument(projectId, ownerId, 'brd');

  // Map generic statuses back to the BRD-specific statuses that brdController expects
  if (result.status === 'missing_prerequisite') {
    return { status: 'no_analysis', error: result.error };
  }
  return result;
};



/**
 * Retrieves the latest completed BRD for a project.
 *
 * @param {string} projectId - Project ID
 * @param {string} ownerId   - Authenticated user's ID
 * @returns {Promise<{ status: string, data?: Object, updatedAt?: string }>}
 */
export const getLatestBRD = async (projectId, ownerId) => {
  const project = await Project.findOne({ _id: projectId, owner: ownerId });
  if (!project) {
    return { status: 'unauthorized' };
  }

  const latest = await Generation.findOne({
    project: projectId,
    generationType: 'brd',
    status: 'completed',
  }).sort({ createdAt: -1 });

  if (!latest || !latest.output) {
    return { status: 'not_found' };
  }

  return {
    status: 'success',
    data: latest.output,
    generationId: latest._id,
    updatedAt: latest.updatedAt,
  };
};
