/**
 * analysisService.js
 *
 * Backend service for analyzing project requirements.
 * Manages project ownership verification, database requirement querying,
 * generation record persistence, and delegates AI execution to requirementAnalyzer.
 */

import Project from '../../models/Project.js';
import Requirement from '../../models/Requirement.js';
import Generation from '../../models/Generation.js';
import { env } from '../../config/env.js';
import { analyzeRequirements } from '../../engine/analyzers/requirementAnalyzer.js';
import { buildRequirementContext } from '../../engine/context/requirementContext.js';

/**
 * Analyzes stored requirements for a given project.
 *
 * @param {string} projectId - Project ID
 * @param {string} ownerId   - Authenticated user's ID
 * @returns {Promise<{ status: string, data?: Object, error?: string, generationId?: string }>}
 */
export const analyzeProjectRequirements = async (projectId, ownerId) => {
  // Step 1: Verify project ownership
  const project = await Project.findOne({ _id: projectId, owner: ownerId });
  if (!project) {
    return { status: 'unauthorized' };
  }

  // Step 2: Fetch project requirements
  const requirements = await Requirement.find({ project: projectId }).sort({ createdAt: 1 });

  // Normalize requirement text content using the context builder
  const combinedText = buildRequirementContext(requirements);

  if (!combinedText || combinedText.length < 10) {
    return { status: 'no_requirements' };
  }

  const modelName = env.GEMINI_MODEL || 'gemini-3.6-flash';

  // Step 3: Create a pending Generation record
  const generation = await Generation.create({
    project: projectId,
    generationType: 'requirement-analysis',
    model: modelName,
    status: 'running',
    promptVersion: '1.0',
  });

  const startTime = Date.now();

  try {
    // Step 4: Delegate AI prompt building, Gemini execution, and Zod validation to requirementAnalyzer
    const analysisResult = await analyzeRequirements(
      combinedText,
      {
        title: project.title,
        description: project.description,
      },
      modelName
    );

    if (!analysisResult.success) {
      generation.status = 'failed';
      generation.error = analysisResult.error;
      generation.durationMs = Date.now() - startTime;
      await generation.save();

      return { status: 'validation_error', error: generation.error };
    }

    // Step 5: Persist validated analysis output
    generation.status = 'completed';
    generation.output = analysisResult.data;
    generation.durationMs = Date.now() - startTime;
    await generation.save();

    return {
      status: 'success',
      data: analysisResult.data,
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
 * Retrieves the latest completed requirement analysis for a project.
 *
 * @param {string} projectId - Project ID
 * @param {string} ownerId   - Authenticated user's ID
 * @returns {Promise<{ status: string, data?: Object, updatedAt?: string }>}
 */
export const getLatestAnalysis = async (projectId, ownerId) => {
  const project = await Project.findOne({ _id: projectId, owner: ownerId });
  if (!project) {
    return { status: 'unauthorized' };
  }

  const latest = await Generation.findOne({
    project: projectId,
    generationType: 'requirement-analysis',
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
