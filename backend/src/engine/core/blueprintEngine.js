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
import { generateSRSDocument } from '../generators/srsGenerator.js';
import { generateUserStoriesDocument } from '../generators/userStoryGenerator.js';
import { generateApiDocument } from '../generators/apiGenerator.js';
import { generateDatabaseDocument } from '../generators/databaseGenerator.js';

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

    case 'srs': {
      const brdOutput = context.documents['brd'];
      if (!brdOutput) {
        throw new Error("Missing prerequisite: brd is required to generate SRS.");
      }

      let ragContext = '';
      if (context.project?.description) {
        ragContext = await retrieveRelevantContext(projectId, context.project.description);
      }

      const result = await generateSRSDocument(brdOutput, context.project, ragContext, modelName);
      if (!result.success) throw new Error(result.error);
      return { data: result.data, model: result.model, provider: result.provider };
    }

    case 'user-stories': {
      const srsOutput = context.documents['srs'];
      if (!srsOutput) {
        throw new Error("Missing prerequisite: srs is required to generate User Stories.");
      }

      let ragContext = '';
      if (context.project?.description) {
        ragContext = await retrieveRelevantContext(projectId, context.project.description);
      }

      const result = await generateUserStoriesDocument(srsOutput, context.project, ragContext, modelName);
      if (!result.success) throw new Error(result.error);
      return { data: result.data, model: result.model, provider: result.provider };
    }

    case 'api':
    case 'api-design': {
      const srsOutput = context.documents['srs'];
      if (!srsOutput) {
        throw new Error("Missing prerequisite: srs is required to generate API Specification.");
      }

      let ragContext = '';
      if (context.project?.description) {
        ragContext = await retrieveRelevantContext(projectId, context.project.description);
      }

      const result = await generateApiDocument(srsOutput, context.project, ragContext, modelName);
      if (!result.success) throw new Error(result.error);
      return { data: result.data, model: result.model, provider: result.provider };
    }

    case 'database': {
      const srsOutput = context.documents['srs'];
      if (!srsOutput) {
        throw new Error("Missing prerequisite: srs is required to generate Database Schema.");
      }

      let ragContext = '';
      if (context.project?.description) {
        ragContext = await retrieveRelevantContext(projectId, context.project.description);
      }

      const result = await generateDatabaseDocument(srsOutput, context.project, ragContext, modelName);
      if (!result.success) throw new Error(result.error);
      return { data: result.data, model: result.model, provider: result.provider };
    }

    default:
      throw new Error(`Unsupported generation type: '${generationType}'`);
  }
};
