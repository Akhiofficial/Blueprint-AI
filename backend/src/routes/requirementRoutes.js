import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createRequirement,
  getRequirements,
  getRequirement,
  updateRequirement,
  deleteRequirement,
  uploadRequirementDoc,
} from '../controllers/requirementController.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router({ mergeParams: true }); // Access :projectId from parent router

// All requirement routes require authentication
router.use(protect);

// ── Standard CRUD ────────────────────────────────────────────────────────────
router.route('/')
  .get(getRequirements)
  .post(createRequirement);

// ── Document Upload ───────────────────────────────────────────────────────────
// IMPORTANT: This route MUST be declared before /:id so that Express does not
// try to treat the literal string "upload" as a Mongo ObjectId.
//
// upload.single('file') is multer middleware — it parses the multipart/form-data
// request and puts the file in req.file before uploadRequirementDoc runs.
//
// Multer errors (file too large, wrong MIME) bypass asyncHandler because multer
// calls next(err) internally. The multerErrorHandler below converts those errors
// into JSON responses with the correct HTTP status codes.
router.post(
  '/upload',
  upload.single('file'),
  // Multer-specific error handler — runs only when multer sets next(err)
  (err, req, res, next) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          success: false,
          message: 'File is too large. Maximum allowed size is 10 MB.',
        });
      }
      if (err.code === 'UNSUPPORTED_FILE_TYPE') {
        return res.status(415).json({
          success: false,
          message: err.message,
        });
      }
      // Unknown multer error — forward to central handler
      return next(err);
    }
    next();
  },
  uploadRequirementDoc
);

// ── Single requirement CRUD ───────────────────────────────────────────────────
router.route('/:id')
  .get(getRequirement)
  .put(updateRequirement)
  .delete(deleteRequirement);

export default router;
