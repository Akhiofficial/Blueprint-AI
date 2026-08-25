import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createRequirement,
  getRequirements,
  getRequirement,
  updateRequirement,
  deleteRequirement,
} from '../controllers/requirementController.js';

const router = express.Router({ mergeParams: true }); // Access :projectId from parent router

// All requirement routes require authentication
router.use(protect);

router.route('/')
  .get(getRequirements)
  .post(createRequirement);

router.route('/:id')
  .get(getRequirement)
  .put(updateRequirement)
  .delete(deleteRequirement);

export default router;
