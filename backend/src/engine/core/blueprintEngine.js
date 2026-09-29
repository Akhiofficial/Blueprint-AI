/**
 * blueprintEngine.js
 *
 * High-level orchestration layer for Blueprint AI generation.
 * Coordinates Context, RAG, Analyzers, and Generators.
 */

import { buildContext } from '../context/contextBuilder.js';
import { retrieveRelevantContext } from '../rag/ragService.js';
import { analyzeRequirements } from '../analyzers/requirementAnalyzer.js';
import { generateBRDDocument } from '../generators/brdGenerator.js';

/**
 * Executes the requested generation workflow.
 *
 * @param {Object} options
 * @param {string} options.projectId
 * @param {string} options.generationType - e.g., 'requirement-analysis', 'brd'
 * @param {string} [options.modelName]
 * @returns {Promise<Object>} The structured output data
 * @throws {Error} If generation fails or is unsupported
 */
export const execute = async ({ projectId, generationType, modelName }) => {
  // 1. Gather Context
  const context = await buildContext(projectId, generationType);

  // 2. Resolve and Execute
  switch (generationType) {
    case 'requirement-analysis': {
      if (!context.requirements) {
        throw new Error("Missing required requirements context for analysis.");
      }
      
      const result = await analyzeRequirements(context.requirements, context.project, modelName);
      if (!result.success) throw new Error(result.error);
      return { data: result.data, model: result.model, provider: result.provider };
    }

    case 'brd': {
      const analysisOutput = context.documents['requirement-analysis'];
      if (!analysisOutput) {
        throw new Error("Missing prerequisite: requirement-analysis is required to generate BRD.");
      }

      let ragContext = '';
      if (context.project?.description) {
        // Derive query logically from prepared context as instructed
        ragContext = await retrieveRelevantContext(projectId, context.project.description);
      }

      const result = await generateBRDDocument(analysisOutput, context.project, ragContext, modelName);
      if (!result.success) throw new Error(result.error);
      return { data: result.data, model: result.model, provider: result.provider };
    }

    case 'srs':
    case 'user-stories':
    case 'api':
    case 'database':
    case 'architecture':
    case 'roadmap':
    case 'test-cases':
    case 'use-cases':
      throw new Error(`Generation type '${generationType}' is not implemented yet.`);

    default:
      throw new Error(`Unsupported generation type: '${generationType}'`);
  }
};
