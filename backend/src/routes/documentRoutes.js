/**
 * documentRoutes.js
 *
 * API route definitions for AI-generated documents.
 * Routes: /api/projects/:projectId/documents and /api/documents/:id/versions
 *
 * TODO: Implement in Phase 2 — Documents feature.
 *   Wire into app.js once documentController is implemented.
 */
import express from 'express';

const router = express.Router({ mergeParams: true });

// TODO: import { protect } from '../middleware/authMiddleware.js';
// TODO: import * as documentController from '../controllers/documentController.js';

// router.use(protect);
// router.route('/').get(...);
// router.route('/:id').get(...).delete(...);
// router.route('/:id/versions').get(...);

export default router;
