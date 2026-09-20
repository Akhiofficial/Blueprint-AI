/**
 * contextBuilder.js
 *
 * Assembles the full generation context by combining:
 *   - projectContext   (project metadata, title, description, tech stack)
 *   - requirementContext  (analyzed requirements, features)
 *   - documentContext  (previously generated documents for cross-referencing)
 *   - RAG context      (retrieved knowledge chunks - pending Phase 3)
 *
 * The assembled context is passed to the prompt builder.
 */

import { buildProjectContext } from './projectContext.js';
import { buildDocumentContext } from './documentContext.js';
import { buildRequirementContext } from './requirementContext.js';
import Requirement from '../../models/Requirement.js';

export const buildContext = async (projectId, generationType) => {
  // 1. Gather Project Context
  const project = await buildProjectContext(projectId);

  // 2. Gather Document Prerequisites Context
  const documents = await buildDocumentContext(projectId, generationType);

  // 3. Gather Raw Requirements
  // Strictly needed for early-stage generations (like requirement-analysis)
  let requirements = null;
  if (generationType === 'requirement-analysis' || generationType === 'brd') {
    const reqs = await Requirement.find({ project: projectId }).sort({ createdAt: 1 }).lean();
    requirements = buildRequirementContext(reqs);
  }

  return {
    project,
    requirements,
    documents,
    generationType
  };
};
