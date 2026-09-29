/**
 * documentService.js
 *
 * Business logic for managing AI-generated workspace documents.
 * Handles Document create/upsert, content updates, and delegates
 * version snapshotting to versionService.
 *
 * Document is keyed uniquely by (project, type). Each generation or
 * manual save creates a new immutable DocumentVersion snapshot.
 *
 * Supported document types (locked to project synopsis scope):
 *   BRD | SRS | UserStories | APISpec | DBSchema
 */

import Document from '../../models/Document.js';
import * as versionService from '../version/versionService.js';

// ── Map from generationType (backend string) to Document.type enum ──────────
export const GENERATION_TYPE_TO_DOC_TYPE = {
  'brd':         'BRD',
  'srs':         'SRS',
  'user-stories':'UserStories',
  'api':         'APISpec',
  'api-design':  'APISpec',
  'database':    'DBSchema',
};

// ── Default titles per document type ────────────────────────────────────────
const DOC_TYPE_TITLES = {
  BRD:        'Business Requirements Document',
  SRS:        'Software Requirements Specification',
  UserStories:'User Stories',
  APISpec:    'REST API Design',
  DBSchema:   'Database Schema',
};

/**
 * Upsert a Document after a successful AI generation, and snapshot the output
 * as a new DocumentVersion.
 *
 * Called by generationService immediately after a successful engine run.
 *
 * @param {object} params
 * @param {string} params.projectId       - MongoDB project ObjectId (string)
 * @param {string} params.generationType  - e.g. 'brd', 'api', 'user-stories'
 * @param {string} params.generationId    - Generation record ObjectId (string)
 * @param {object} params.outputData      - Structured JSON output from AI engine
 * @param {string} params.userId          - Authenticated user ObjectId (string)
 * @returns {Promise<{ document: Document, versionNumber: number }>}
 */
export const upsertDocumentFromGeneration = async ({
  projectId,
  generationType,
  generationId,
  outputData,
  userId,
}) => {
  const docType = GENERATION_TYPE_TO_DOC_TYPE[generationType];
  if (!docType) {
    throw new Error(`documentService: unknown generationType '${generationType}'`);
  }

  const contentString = JSON.stringify(outputData);
  const title = outputData?.title || DOC_TYPE_TITLES[docType] || docType;

  // Find existing document (project + type is unique)
  let doc = await Document.findOne({ project: projectId, type: docType });

  if (doc) {
    // Existing document — increment version and update content
    const nextVersion = (doc.currentVersion || 1) + 1;
    doc.content        = contentString;
    doc.title          = title;
    doc.status         = 'ready';
    doc.currentVersion = nextVersion;
    doc.generation     = generationId;
    await doc.save();

    // Create immutable version snapshot
    await versionService.createVersion({
      documentId:    doc._id,
      versionNumber: nextVersion,
      content:       contentString,
      changes:       'AI re-generation',
      createdBy:     userId,
    });

    console.log(`[DocumentService] UPDATED — docId=${doc._id}, type=${docType}, version=${nextVersion}`);
    return { document: doc, versionNumber: nextVersion };

  } else {
    // First generation — create document + version 1
    doc = await Document.create({
      project:        projectId,
      type:           docType,
      title,
      content:        contentString,
      status:         'ready',
      currentVersion: 1,
      generation:     generationId,
    });

    await versionService.createVersion({
      documentId:    doc._id,
      versionNumber: 1,
      content:       contentString,
      changes:       'Initial AI generation',
      createdBy:     userId,
    });

    console.log(`[DocumentService] CREATED — docId=${doc._id}, type=${docType}, version=1`);
    return { document: doc, versionNumber: 1 };
  }
};

/**
 * Retrieve the current Document for a project + docType.
 *
 * @param {string} projectId  - MongoDB project ObjectId (string)
 * @param {string} docType    - Document.type enum value (e.g. 'BRD')
 * @param {string} ownerId    - Must match project owner (ownership enforced at service layer)
 * @returns {Promise<Document|null>}
 */
export const getDocumentByType = async (projectId, docType) => {
  return Document.findOne({ project: projectId, type: docType });
};

/**
 * Retrieve all Documents for a project (summary — no content blob).
 *
 * @param {string} projectId
 * @returns {Promise<Document[]>}
 */
export const getProjectDocuments = async (projectId) => {
  return Document.find({ project: projectId })
    .select('-content')
    .sort({ type: 1 });
};

/**
 * Save manually edited document content and create a new version snapshot.
 *
 * @param {object} params
 * @param {string} params.projectId  - MongoDB project ObjectId (string)
 * @param {string} params.docType    - Document.type enum (e.g. 'BRD')
 * @param {object} params.content    - The updated structured content object
 * @param {string} params.userId     - Authenticated user ObjectId (string)
 * @returns {Promise<{ document: Document, versionNumber: number }>}
 */
export const saveDocumentContent = async ({ projectId, docType, content, userId }) => {
  const doc = await Document.findOne({ project: projectId, type: docType });
  if (!doc) {
    throw new Error(`Document not found: project=${projectId} type=${docType}`);
  }

  const contentString = typeof content === 'string' ? content : JSON.stringify(content);
  const nextVersion = (doc.currentVersion || 1) + 1;

  doc.content        = contentString;
  doc.currentVersion = nextVersion;
  doc.status         = 'ready';
  await doc.save();

  await versionService.createVersion({
    documentId:    doc._id,
    versionNumber: nextVersion,
    content:       contentString,
    changes:       'Manual edit',
    createdBy:     userId,
  });

  console.log(`[DocumentService] SAVED — docId=${doc._id}, type=${docType}, version=${nextVersion}`);
  return { document: doc, versionNumber: nextVersion };
};

/**
 * Restore a document to a previous version snapshot.
 * Creates a new version with the content of the restored version.
 *
 * @param {object} params
 * @param {string} params.projectId      - MongoDB project ObjectId (string)
 * @param {string} params.docType        - Document.type enum (e.g. 'BRD')
 * @param {number} params.versionNumber  - Target version number to restore
 * @param {string} params.userId         - Authenticated user ObjectId (string)
 * @returns {Promise<{ document: Document, versionNumber: number }>}
 */
export const restoreDocumentVersion = async ({ projectId, docType, versionNumber, userId }) => {
  const doc = await Document.findOne({ project: projectId, type: docType });
  if (!doc) {
    throw new Error(`Document not found: project=${projectId} type=${docType}`);
  }

  const targetVersion = await versionService.getVersionByNumber(doc._id, Number(versionNumber));
  if (!targetVersion) {
    throw new Error(`Version ${versionNumber} not found for ${docType}`);
  }

  const nextVersion = (doc.currentVersion || 1) + 1;

  doc.content        = targetVersion.content;
  doc.currentVersion = nextVersion;
  doc.status         = 'ready';
  await doc.save();

  await versionService.createVersion({
    documentId:    doc._id,
    versionNumber: nextVersion,
    content:       targetVersion.content,
    changes:       `Restored from version ${versionNumber}`,
    createdBy:     userId,
  });

  console.log(`[DocumentService] RESTORED — docId=${doc._id}, type=${docType}, restoredFrom=${versionNumber}, newVersion=${nextVersion}`);
  return { document: doc, versionNumber: nextVersion };
};


