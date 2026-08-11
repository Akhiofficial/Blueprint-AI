/**
 * requirementRoutes.js
 *
 * API route definitions for requirements.
 * These routes are nested under projects: /api/projects/:projectId/requirements
 *
 * TODO: Implement in Phase 2 — Requirements feature.
 *   Wire into app.js once requirementController is implemented.
 */
import express from 'express';

const router = express.Router({ mergeParams: true }); // mergeParams to access :projectId

// TODO: import { protect } from '../middleware/authMiddleware.js';
// TODO: import * as requirementController from '../controllers/requirementController.js';

// router.use(protect);
// router.route('/').get(...).post(...);
// router.route('/:id').get(...).put(...).delete(...);

export default router;
