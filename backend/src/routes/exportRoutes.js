/**
 * exportRoutes.js
 *
 * API route definitions for Blueprint document export.
 *
 * Mounted under:
 *   /api/projects/:projectId/export
 *
 * Routes:
 *   GET / → exportProjectDocuments
 *
 * Supported query parameters:
 *   Single doc:   ?docType=BRD&format=markdown
 *                 ?docType=BRD&format=pdf
 *   All docs:     ?scope=all&format=markdown
 *                 ?scope=all&format=pdf
 *
 * :docType aliases map to Document.type enum values:
 *   BRD | SRS | UserStories | APISpec | DBSchema
 *
 * READ-ONLY — This route never creates, modifies or deletes any document.
 */

import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { exportProjectDocuments } from '../controllers/exportController.js';

const router = express.Router({ mergeParams: true }); // Access :projectId from parent

// All export routes require authentication
router.use(protect);

// GET /api/projects/:projectId/export
router.get('/', exportProjectDocuments);

export default router;
