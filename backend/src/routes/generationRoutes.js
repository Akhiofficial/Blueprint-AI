/**
 * generationRoutes.js
 *
 * Routes for the generic AI document generation API.
 *
 * POST /api/projects/:projectId/generations/:generationType  → trigger generation
 * GET  /api/projects/:projectId/generations/:generationType  → retrieve latest result
 *
 * All routes require authentication via the protect middleware.
 * The :generationType param is validated inside generationService.
 */

import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { generateDocument, getLatestGeneration } from '../controllers/generationController.js';

const router = express.Router({ mergeParams: true }); // Access :projectId from parent router

router.use(protect);

router.route('/:generationType')
  .post(generateDocument)
  .get(getLatestGeneration);

export default router;
