/**
 * documentRoutes.js
 *
 * API route definitions for workspace document persistence and version history.
 *
 * All routes are mounted under:
 *   /api/projects/:projectId/documents
 *
 * Routes:
 *   GET  /                                    → list all documents for project (summaries)
 *   GET  /:docType                            → get current document by type (BRD, SRS, etc.)
 *   PUT  /:docType                            → save (edit) document content — creates new version
 *   GET  /:docType/versions                   → get version history (with content) for a document
 *   GET  /:docType/versions/:versionNumber    → get a single version's content by number
 *
 * :docType must be a valid Document.type enum value:
 *   BRD | SRS | UserStories | APISpec | DBSchema
 */

import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getProjectDocuments,
  getDocument,
  saveDocument,
  getVersionHistory,
  getVersionContent,
  restoreVersion,
} from '../controllers/documentController.js';

const router = express.Router({ mergeParams: true }); // Access :projectId from parent router

// All document routes require authentication
router.use(protect);

// Project documents list
router.route('/').get(getProjectDocuments);

// Single document by type
router.route('/:docType').get(getDocument).put(saveDocument);

// Version history for a document type (includes content blobs)
router.route('/:docType/versions').get(getVersionHistory);

// A single specific version's content
router.route('/:docType/versions/:versionNumber').get(getVersionContent);

// Restore document to a specific version snapshot
router.route('/:docType/restore/:versionNumber').put(restoreVersion);

export default router;

