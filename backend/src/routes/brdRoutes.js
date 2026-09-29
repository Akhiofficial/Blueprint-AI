import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { generateBRD, getLatestBRD } from '../controllers/brdController.js';

const router = express.Router({ mergeParams: true }); // Access :projectId from parent router

// All BRD generation routes require authentication
router.use(protect);

router.post('/generate', generateBRD);
router.get('/', getLatestBRD);

export default router;
