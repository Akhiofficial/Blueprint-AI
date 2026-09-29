/**
 * generationService.js
 *
 * Application-level service for document generation workflows.
 * Handles project ownership, concurrency protection, Generation record lifecycle,
 * and delegates AI execution to blueprintEngine.
 *
 * This is the generic version of brdService — supports all document generation types.
 */

import Project from '../../models/Project.js';
import Generation from '../../models/Generation.js';
import { env } from '../../config/env.js';
import * as blueprintEngine from '../../engine/core/blueprintEngine.js';

// Authoritative supported document generation types (locked to project synopsis scope)
export const SUPPORTED_GENERATION_TYPES = new Set([
  'brd',
  'srs',
  'user-stories',
  'api',
  'api-design',
  'database',
]);

/**
 * Generates an AI document for a project.
 *
 * @param {string} projectId      - MongoDB project ID
 * @param {string} ownerId        - Authenticated user's ID
 * @param {string} generationType - e.g. 'brd', 'srs', 'user-stories', 'api', 'database'
 * @returns {Promise<{status: string, data?: Object, error?: string, generationId?: string}>}
 */
export const generateDocument = async (projectId, ownerId, generationType) => {
  // Step 1: Validate generation type is within authorized scope
  if (!SUPPORTED_GENERATION_TYPES.has(generationType)) {
    return {
      status: 'unsupported_type',
      error: `Unsupported generation type: '${generationType}'. BlueprintAI supports: brd, srs, user-stories, api-design, database.`,
    };
  }

  // Step 3: Verify project ownership
  const project = await Project.findOne({ _id: projectId, owner: ownerId });
  if (!project) {
    return { status: 'unauthorized', error: 'Project not found or unauthorized' };
  }

  // Step 4: Concurrency check — prevent duplicate in-flight generations of same type
  const STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
  const running = await Generation.findOne({
    project: projectId,
    generationType,
    status: 'running',
  });

  if (running) {
    const isStale = Date.now() - new Date(running.createdAt).getTime() > STALE_THRESHOLD_MS;
    if (isStale) {
      running.status = 'failed';
      running.error = 'Generation timed out or server restarted.';
      await running.save();
    } else {
      return {
        status: 'in_progress',
        error: `${generationType.toUpperCase()} generation is already in progress for this project.`,
      };
    }
  }

  const modelName = env.GEMINI_MODEL || 'gemini-2.0-flash';

  // Step 5: Create a pending Generation record
  const generation = await Generation.create({
    project: projectId,
    generationType,
    model: modelName,
    status: 'running',
    promptVersion: '1.0',
  });

  const startTime = Date.now();

  try {
    // Step 6: Delegate entirely to the Blueprint Engine
    const engineResult = await blueprintEngine.execute({
      projectId,
      generationType,
      modelName,
    });

    const outputData = engineResult?.data !== undefined ? engineResult.data : engineResult;
    const actualModel = engineResult?.model || modelName;
    const actualProvider = engineResult?.provider || 'gemini';

    // Step 7: Persist successful output
    generation.status = 'completed';
    generation.output = outputData;
    generation.provider = actualProvider;
    generation.model = actualModel;
    generation.error = null;
    generation.durationMs = Date.now() - startTime;
    await generation.save();

    console.log(`[GenerationService] COMPLETED — generationId=${generation._id}, type=${generationType}, provider=${actualProvider}, model=${actualModel}, durationMs=${generation.durationMs}`);

    return {
      status: 'success',
      data: outputData,
      generationId: generation._id,
      model: actualModel,
      provider: actualProvider,
    };
  } catch (err) {
    // Step 8: Persist failure
    generation.status = 'failed';
    generation.error = err.message;
    generation.durationMs = Date.now() - startTime;
    await generation.save();

    console.warn(`[GenerationService] FAILED — generationId=${generation._id}, type=${generationType}`);

    // Distinguish engine-level "not implemented" from unexpected failures
    if (err.message && err.message.includes('is not implemented yet')) {
      return { status: 'not_implemented', error: err.message };
    }
    if (err.message && err.message.includes('Missing prerequisite')) {
      return { status: 'missing_prerequisite', error: err.message };
    }

    return { status: 'engine_error', error: err.message };
  }
};

/**
 * Retrieves the latest completed generation of a given type for a project.
 *
 * @param {string} projectId      - MongoDB project ID
 * @param {string} ownerId        - Authenticated user's ID
 * @param {string} generationType - e.g. 'brd', 'srs'
 * @returns {Promise<{status: string, data?: Object, updatedAt?: string, generationId?: string}>}
 */
export const getLatestGeneration = async (projectId, ownerId, generationType) => {
  const project = await Project.findOne({ _id: projectId, owner: ownerId });
  if (!project) {
    return { status: 'unauthorized' };
  }

  const latest = await Generation.findOne({
    project: projectId,
    generationType,
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
