/**
 * analysisService.js
 *
 * Backend service for analyzing project requirements with Gemini AI,
 * validating structured output via Zod, and persisting results in Generation documents.
 */

import Project from '../../models/Project.js';
import Requirement from '../../models/Requirement.js';
import Generation from '../../models/Generation.js';
import { env } from '../../config/env.js';
import { SYSTEM_INSTRUCTION, buildRequirementAnalysisPrompt } from '../../engine/prompts/requirementAnalysis.prompt.js';
import { generateJSON } from '../../engine/providers/geminiProvider.js';
import { requirementAnalysisSchema } from '../../validators/analysisValidator.js';

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

  // Normalize requirement text content
  const textParts = requirements
    .map((r) => {
      const titleStr = r.title && r.title !== 'Project Requirements' ? `### ${r.title}\n` : '';
      const descStr = r.description ? r.description.trim() : '';
      return `${titleStr}${descStr}`.trim();
    })
    .filter(Boolean);

  const combinedText = textParts.join('\n\n');

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
    // Step 4: Construct prompt & call Gemini AI provider
    const prompt = buildRequirementAnalysisPrompt(combinedText, {
      title: project.title,
      description: project.description,
    });

    const rawOutput = await generateJSON({
      prompt,
      systemInstruction: SYSTEM_INSTRUCTION,
      modelName,
    });

    // Step 5: Validate AI output structure with Zod
    const parsed = requirementAnalysisSchema.safeParse(rawOutput);
    if (!parsed.success) {
      const validationError = parsed.error.issues
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join(', ');

      generation.status = 'failed';
      generation.error = `AI output validation failed: ${validationError}`;
      generation.durationMs = Date.now() - startTime;
      await generation.save();

      return { status: 'validation_error', error: generation.error };
    }

    // Step 6: Persist validated analysis output
    generation.status = 'completed';
    generation.output = parsed.data;
    generation.durationMs = Date.now() - startTime;
    await generation.save();

    return {
      status: 'success',
      data: parsed.data,
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
