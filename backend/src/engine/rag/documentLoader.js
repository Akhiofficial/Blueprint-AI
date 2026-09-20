/**
 * documentLoader.js
 *
 * Loads and parses uploaded documents (PDF, DOCX, TXT, MD) for RAG ingestion.
 */

import KnowledgeDocument from '../../models/KnowledgeDocument.js';

export const loadDocument = async (projectId, documentId) => {
  const doc = await KnowledgeDocument.findOne({ _id: documentId, project: projectId }).lean();
  if (!doc) throw new Error('Document not found or access denied');
  return doc;
};
