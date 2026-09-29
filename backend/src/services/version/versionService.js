/**
 * versionService.js
 *
 * Business logic for managing immutable DocumentVersion snapshots.
 *
 * Versions are ordered by versionNumber (ascending).
 * Old versions are never mutated after creation.
 */

import DocumentVersion from '../../models/DocumentVersion.js';

/**
 * Create a new immutable version snapshot for a document.
 *
 * @param {object} params
 * @param {string} params.documentId    - DocumentVersion.document (MongoDB ObjectId)
 * @param {number} params.versionNumber - The version number (1, 2, 3 …)
 * @param {string} params.content       - JSON.stringified document content
 * @param {string} params.changes       - Human-readable change description
 * @param {string} params.createdBy     - User ObjectId (string)
 * @returns {Promise<DocumentVersion>}
 */
export const createVersion = async ({ documentId, versionNumber, content, changes, createdBy }) => {
  const version = await DocumentVersion.create({
    document:      documentId,
    versionNumber,
    content,
    changes:       changes || '',
    createdBy,
  });
  return version;
};

/**
 * Retrieve all versions for a document, ordered newest first.
 *
 * @param {string} documentId - MongoDB Document ObjectId (string)
 * @returns {Promise<DocumentVersion[]>}
 */
export const getVersionsByDocument = async (documentId) => {
  return DocumentVersion.findOne
    ? DocumentVersion.find({ document: documentId })
        .select('versionNumber changes createdAt createdBy')
        .sort({ versionNumber: -1 })
    : [];
};

/**
 * Retrieve a specific version by document + versionNumber (includes content).
 *
 * @param {string} documentId
 * @param {number} versionNumber
 * @returns {Promise<DocumentVersion|null>}
 */
export const getVersionByNumber = async (documentId, versionNumber) => {
  return DocumentVersion.findOne({ document: documentId, versionNumber });
};

/**
 * Retrieve all versions for a document with their content blobs (for preview).
 *
 * @param {string} documentId
 * @returns {Promise<DocumentVersion[]>}
 */
export const getVersionsWithContent = async (documentId) => {
  return DocumentVersion.findOne
    ? DocumentVersion.find({ document: documentId })
        .select('versionNumber changes createdAt createdBy content')
        .sort({ versionNumber: -1 })
    : [];
};
