/**
 * brdService.js
 *
 * Backend service for generating Business Requirements Documents (BRD).
 * Manages project ownership checks, prerequisite requirement analysis fetching,
 * concurrency checks, Generation record persistence, and delegates AI generation to brdGenerator.
 */

import Project from '../../models/Project.js';
import Generation from '../../models/Generation.js';
import { env } from '../../config/env.js';
import { generateBRDDocument } from '../../engine/generators/brdGenerator.js';

/**
 * Generates a Business Requirements Document (BRD) for a project.
 *
 * @param {string} projectId - Project ID
 * @param {string} ownerId   - Authenticated user's ID
 * @returns {Promise<{ status: string, data?: Object, error?: string, generationId?: string }>}
 */
export const generateBRD = async (projectId, ownerId) => {
  // Step 1: Verify project ownership
  const project = await Project.findOne({ _id: projectId, owner: ownerId });
  if (!project) {
    return { status: 'unauthorized', error: 'Project not found or unauthorized' };
  }

  // Step 2: Fetch latest completed Requirement Analysis
  const latestAnalysis = await Generation.findOne({
    project: projectId,
    generationType: 'requirement-analysis',
    status: 'completed',
  }).sort({ createdAt: -1 });

  if (!latestAnalysis || !latestAnalysis.output) {
    return { status: 'no_analysis', error: 'No completed requirement analysis found for this project.' };
  }

  // Check for currently running BRD generation to prevent duplicate concurrent runs
  const runningBRD = await Generation.findOne({
    project: projectId,
    generationType: 'brd',
    status: 'running',
  });

  if (runningBRD) {
    return { status: 'in_progress', error: 'BRD generation is already in progress for this project.' };
  }

  const modelName = env.GEMINI_MODEL || 'gemini-3.6-flash';

  // Step 3: Create running Generation record
  const generation = await Generation.create({
    project: projectId,
    generationType: 'brd',
    model: modelName,
    status: 'running',
    promptVersion: '1.0',
  });

  const startTime = Date.now();

  try {
    // Step 4: Delegate AI prompt building, Gemini execution, and Zod validation to brdGenerator
    const result = await generateBRDDocument(
      latestAnalysis.output,
      {
        title: project.title,
        description: project.description,
      },
      modelName
    );

    if (!result.success) {
      generation.status = 'failed';
      generation.error = result.error;
      generation.durationMs = Date.now() - startTime;
      await generation.save();

      return { status: 'validation_error', error: generation.error };
    }

    // Step 5: Persist validated BRD output
    generation.status = 'completed';
    generation.output = result.data;
    generation.error = null;
    generation.durationMs = Date.now() - startTime;
    await generation.save();

    return {
      status: 'success',
      data: result.data,
      generationId: generation._id,
    };
  } catch (err) {
    generation.status = 'failed';
    generation.error = err.message;
    generation.durationMs = Date.now() - startTime;
    await generation.save();

    return { status: 'service_error', error: err.message };
  }
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
