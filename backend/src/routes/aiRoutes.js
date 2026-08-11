/**
 * aiRoutes.js
 *
 * API route definitions for Blueprint Engine / AI generation endpoints.
 * Routes: /api/ai/*
 *
 * This is the entry point into the Blueprint Engine pipeline:
 *   POST /api/ai/generate  → aiController → blueprintEngine → Gemini → documentService
 *
 * TODO: Implement in Phase 3 — Blueprint Engine integration.
 *   Wire into app.js once the engine and aiController are implemented.
 */
import express from 'express';

const router = express.Router();

// TODO: import { protect } from '../middleware/authMiddleware.js';
// TODO: import * as aiController from '../controllers/aiController.js';

// router.use(protect);
// router.post('/generate', aiController.generateBlueprint);
// router.get('/status/:generationId', aiController.getGenerationStatus);

export default router;
