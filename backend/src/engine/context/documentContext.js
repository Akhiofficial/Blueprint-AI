/**
 * documentContext.js
 *
 * Builds the document-level context from previously generated documents.
 * Enables cross-document consistency (e.g. SRS references BRD decisions).
 */

import Generation from '../../models/Generation.js';

// Define expected prerequisites for each generation type
const PREREQUISITES = {
  'brd': ['requirement-analysis'],
  'srs': ['brd'],
  'userstories': ['srs'],
  'apispec': ['srs'],
  'dbschema': ['srs'],
  'architecture': ['srs'],
  'roadmap': ['brd', 'architecture'],
  'testcases': ['userstories', 'apispec'],
  'usecases': ['srs']
};

export const buildDocumentContext = async (projectId, generationType) => {
  const prereqs = PREREQUISITES[generationType] || [];
  const context = {};

  for (const prereq of prereqs) {
    const latestDoc = await Generation.findOne({
      project: projectId,
      generationType: prereq,
      status: 'completed'
    }).sort({ createdAt: -1 }).lean();

    if (latestDoc && latestDoc.output) {
      context[prereq] = latestDoc.output;
    } else {
      context[prereq] = null;
    }
  }

  return context;
};
