/**
 * documentController.js
 *
 * HTTP request handlers for workspace document endpoints.
 * Delegates business logic to documentService and versionService.
 *
 * Routes:
 *   GET    /api/projects/:projectId/documents                → getProjectDocuments
 *   GET    /api/projects/:projectId/documents/:docType       → getDocument
 *   PUT    /api/projects/:projectId/documents/:docType       → saveDocument
 *   GET    /api/projects/:projectId/documents/:docType/versions → getVersionHistory
 *
 * All routes are project-scoped and protected by authenticate middleware.
 * Ownership is verified in documentService by ensuring project belongs to ownerId.
 */

import asyncHandler from '../utils/asyncHandler.js';
import Project from '../models/Project.js';
import * as documentService from '../services/document/documentService.js';
import * as versionService from '../services/version/versionService.js';


// ── Helper: verify project ownership ────────────────────────────────────────
const assertProjectOwnership = async (projectId, ownerId) => {
  const project = await Project.findOne({ _id: projectId, owner: ownerId });
  return !!project;
};

/**
 * @desc    Get all documents for a project (summaries — no content blob)
 * @route   GET /api/projects/:projectId/documents
 * @access  Private
 */
export const getProjectDocuments = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const ownerId = req.user._id;

  const owned = await assertProjectOwnership(projectId, ownerId);
  if (!owned) {
    res.status(404);
    throw new Error('Project not found or unauthorized');
  }

  const documents = await documentService.getProjectDocuments(projectId);

  res.status(200).json({
    success: true,
    count: documents.length,
    data: documents,
  });
});

/**
 * @desc    Get the current document by type (with parsed content)
 * @route   GET /api/projects/:projectId/documents/:docType
 * @access  Private
 */
export const getDocument = asyncHandler(async (req, res) => {
  const { projectId, docType } = req.params;
  const ownerId = req.user._id;

  const owned = await assertProjectOwnership(projectId, ownerId);
  if (!owned) {
    res.status(404);
    throw new Error('Project not found or unauthorized');
  }

  const doc = await documentService.getDocumentByType(projectId, docType);
  if (!doc) {
    res.status(404);
    throw new Error(`No ${docType} document found for this project.`);
  }

  // Parse content from JSON string back to object for the frontend
  let parsedContent = null;
  if (doc.content) {
    try {
      parsedContent = JSON.parse(doc.content);
    } catch {
      parsedContent = doc.content;
    }
  }

  res.status(200).json({
    success: true,
    data: {
      _id:            doc._id,
      type:           doc.type,
      title:          doc.title,
      status:         doc.status,
      currentVersion: doc.currentVersion,
      content:        parsedContent,
      generation:     doc.generation,
      createdAt:      doc.createdAt,
      updatedAt:      doc.updatedAt,
    },
  });
});

/**
 * @desc    Save (manually edit) document content — creates a new version
 * @route   PUT /api/projects/:projectId/documents/:docType
 * @access  Private
 */
export const saveDocument = asyncHandler(async (req, res) => {
  const { projectId, docType } = req.params;
  const ownerId = req.user._id;
  const { content } = req.body;

  if (content === undefined || content === null) {
    res.status(400);
    throw new Error('Request body must include a content field.');
  }

  const owned = await assertProjectOwnership(projectId, ownerId);
  if (!owned) {
    res.status(404);
    throw new Error('Project not found or unauthorized');
  }

  const { document: doc, versionNumber, isUnchanged } = await documentService.saveDocumentContent({
    projectId,
    docType,
    content,
    userId: ownerId,
  });

  res.status(200).json({
    success: true,
    message: isUnchanged
      ? `Document content unchanged (current version ${versionNumber}).`
      : `Document saved as version ${versionNumber}.`,
    data: {
      _id:            doc._id,
      type:           doc.type,
      title:          doc.title,
      status:         doc.status,
      currentVersion: doc.currentVersion,
      updatedAt:      doc.updatedAt,
      isUnchanged:    !!isUnchanged,
    },
  });
});

/**
 * @desc    Get version history for a document
 * @route   GET /api/projects/:projectId/documents/:docType/versions
 * @access  Private
 */
export const getVersionHistory = asyncHandler(async (req, res) => {
  const { projectId, docType } = req.params;
  const ownerId = req.user._id;

  const owned = await assertProjectOwnership(projectId, ownerId);
  if (!owned) {
    res.status(404);
    throw new Error('Project not found or unauthorized');
  }

  const doc = await documentService.getDocumentByType(projectId, docType);
  if (!doc) {
    // Return empty history instead of 404 — document might not be generated yet
    return res.status(200).json({ success: true, count: 0, data: [] });
  }

  const versions = await versionService.getVersionsWithContent(doc._id);

  res.status(200).json({
    success: true,
    count: versions.length,
    data: versions.map(v => {
      let parsedContent = null;
      if (v.content) {
        try { parsedContent = JSON.parse(v.content); } catch { parsedContent = v.content; }
      }
      return {
        versionNumber: v.versionNumber,
        changes:       v.changes,
        createdAt:     v.createdAt,
        createdBy:     v.createdBy,
        content:       parsedContent,
      };
    }),
  });
});

/**
 * @desc    Get a single version's content by version number
 * @route   GET /api/projects/:projectId/documents/:docType/versions/:versionNumber
 * @access  Private
 */
export const getVersionContent = asyncHandler(async (req, res) => {
  const { projectId, docType, versionNumber } = req.params;
  const ownerId = req.user._id;

  const owned = await assertProjectOwnership(projectId, ownerId);
  if (!owned) {
    res.status(404);
    throw new Error('Project not found or unauthorized');
  }

  const doc = await documentService.getDocumentByType(projectId, docType);
  if (!doc) {
    res.status(404);
    throw new Error(`No ${docType} document found.`);
  }

  const version = await versionService.getVersionByNumber(doc._id, Number(versionNumber));
  if (!version) {
    res.status(404);
    throw new Error(`Version ${versionNumber} not found.`);
  }

  let parsedContent = null;
  if (version.content) {
    try { parsedContent = JSON.parse(version.content); } catch { parsedContent = version.content; }
  }

  res.status(200).json({
    success: true,
    data: {
      versionNumber: version.versionNumber,
      changes:       version.changes,
      createdAt:     version.createdAt,
      createdBy:     version.createdBy,
      content:       parsedContent,
    },
  });
});

/**
 * @desc    Restore a document to a previous version snapshot
 * @route   PUT /api/projects/:projectId/documents/:docType/restore/:versionNumber
 * @access  Private
 */
export const restoreVersion = asyncHandler(async (req, res) => {
  const { projectId, docType, versionNumber } = req.params;
  const ownerId = req.user._id;

  const owned = await assertProjectOwnership(projectId, ownerId);
  if (!owned) {
    res.status(404);
    throw new Error('Project not found or unauthorized');
  }

  const { document: doc, versionNumber: newVersionNumber } = await documentService.restoreDocumentVersion({
    projectId,
    docType,
    versionNumber,
    userId: ownerId,
  });

  let parsedContent = null;
  if (doc.content) {
    try {
      parsedContent = JSON.parse(doc.content);
    } catch {
      parsedContent = doc.content;
    }
  }

  res.status(200).json({
    success: true,
    message: `Document restored from version ${versionNumber} to new version ${newVersionNumber}.`,
    data: {
      _id:            doc._id,
      type:           doc.type,
      title:          doc.title,
      status:         doc.status,
      currentVersion: doc.currentVersion,
      content:        parsedContent,
      updatedAt:      doc.updatedAt,
    },
  });
});

