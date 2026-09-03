/**
 * uploadMiddleware.js
 *
 * Multer configuration for handling file uploads.
 *
 * Strategy: memoryStorage — the uploaded file is kept in
 * req.file.buffer (in RAM) and never written to disk.
 * This avoids path traversal risks and removes the need for
 * a temporary-file cleanup step.
 *
 * Accepted MIME types: PDF, DOCX, plain text.
 * Max file size: 10 MB.
 *
 * Usage in a route:
 *   router.post('/upload', protect, upload.single('file'), handler);
 */

import multer from 'multer';

// ── Accepted MIME types ──────────────────────────────────────────────────────
const ACCEPTED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]);

// 10 MB in bytes
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// ── multer instance ──────────────────────────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(), // buffer in memory — no disk I/O
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (_req, file, cb) => {
    if (ACCEPTED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true); // accept
    } else {
      // Reject with a named error so the controller can return 415
      cb(
        Object.assign(new Error('Unsupported file type. Please upload a PDF, DOCX, or TXT file.'), {
          code: 'UNSUPPORTED_FILE_TYPE',
        })
      );
    }
  },
});

export default upload;
