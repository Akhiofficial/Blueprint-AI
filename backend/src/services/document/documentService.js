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
import { generateChangeSummary } from '../version/changeSummaryService.js';

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

// ── Helper: deep equality comparison for structured documents ───────────────
const deepEqual = (obj1, obj2) => {
  if (obj1 === obj2) return true;

  if (obj1 === null || obj1 === undefined || obj2 === null || obj2 === undefined) {
    return obj1 === obj2;
  }

  if (typeof obj1 !== typeof obj2) return false;

  if (typeof obj1 !== 'object') return obj1 === obj2;

  if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;

  if (Array.isArray(obj1)) {
    if (obj1.length !== obj2.length) return false;
    for (let i = 0; i < obj1.length; i++) {
      if (!deepEqual(obj1[i], obj2[i])) return false;
    }
    return true;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!Object.prototype.hasOwnProperty.call(obj2, key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }

  return true;
};

/**
 * Compares persisted document content with incoming save content.
 * Parses JSON strings when necessary and performs a structural deep comparison.
 */
export const areContentsEqual = (persistedContent, incomingContent) => {
  if (persistedContent === incomingContent) return true;
  if (!persistedContent && !incomingContent) return true;
  if (!persistedContent || !incomingContent) return false;

  if (typeof persistedContent === 'string' && typeof incomingContent === 'string' && persistedContent.trim() === incomingContent.trim()) {
    return true;
  }

  let parsedA = persistedContent;
  let parsedB = incomingContent;

  if (typeof persistedContent === 'string') {
    try {
      parsedA = JSON.parse(persistedContent);
    } catch {
      parsedA = persistedContent;
    }
  }

  if (typeof incomingContent === 'string') {
    try {
      parsedB = JSON.parse(incomingContent);
    } catch {
      parsedB = incomingContent;
    }
  }

  return deepEqual(parsedA, parsedB);
};

/**
 * Save manually edited document content and create a new version snapshot.
 * If the incoming content is identical to the current persisted content,
 * no new version is created and the response is idempotent.
 *
 * @param {object} params
 * @param {string} params.projectId  - MongoDB project ObjectId (string)
 * @param {string} params.docType    - Document.type enum (e.g. 'BRD')
 * @param {object} params.content    - The updated structured content object
 * @param {string} params.userId     - Authenticated user ObjectId (string)
 * @returns {Promise<{ document: Document, versionNumber: number, isUnchanged: boolean }>}
 */
export const saveDocumentContent = async ({ projectId, docType, content, userId }) => {
  const doc = await Document.findOne({ project: projectId, type: docType });
  if (!doc) {
    throw new Error(`Document not found: project=${projectId} type=${docType}`);
  }

  // Idempotency check: if content is unchanged, avoid creating duplicate version
  const isUnchanged = areContentsEqual(doc.content, content);
  if (isUnchanged) {
    console.log(`[DocumentService] UNCHANGED — docId=${doc._id}, type=${docType}, version=${doc.currentVersion}`);
    return { document: doc, versionNumber: doc.currentVersion, isUnchanged: true };
  }

  // Generate a factual change summary from actual BEFORE vs AFTER content
  let changeSummary = 'Document updated.';
  try {
    changeSummary = await generateChangeSummary({
      docType,
      beforeContent: doc.content,
      afterContent: content,
    });
  } catch (err) {
    console.warn(`[DocumentService] Change summary generation failed (fallback used): ${err.message}`);
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
    changes:       changeSummary,
    createdBy:     userId,
  });

  console.log(`[DocumentService] SAVED — docId=${doc._id}, type=${docType}, version=${nextVersion}, changes="${changeSummary}"`);
  return { document: doc, versionNumber: nextVersion, isUnchanged: false };
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


