/**
 * extractTextService.js
 *
 * Extracts plain text from an uploaded file buffer.
 *
 * Supported formats:
 *   - PDF  (application/pdf)                  → pdf-parse library
 *   - DOCX (application/vnd.openxmlformats…)  → mammoth library
 *   - TXT  (text/plain)                        → buffer.toString('utf8')
 *
 * The caller receives a single normalized string.
 * If the document produces no readable text, an error is thrown
 * so that the controller can return an appropriate 422 response.
 *
 * This function deliberately contains NO HTTP, NO Mongoose, NO routing.
 * It is a pure transformation: (Buffer, mimetype) → string.
 */

import { createRequire } from 'module';
import mammoth from 'mammoth';

// pdf-parse is a CommonJS module. In an ESM project (type:"module") we must use
// createRequire to bridge the gap — a plain `import pdfParse from 'pdf-parse'`
// throws "does not provide an export named 'default'" at runtime.
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

// MIME constants — mirrors uploadMiddleware.js for consistency
const MIME_PDF  = 'application/pdf';
const MIME_DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const MIME_TXT  = 'text/plain';

// Minimum characters before we consider the document "readable"
const MIN_TEXT_LENGTH = 10;

/**
 * Normalizes extracted raw text:
 *  - Unifies line endings to \n
 *  - Collapses sequences of 3+ blank lines into 2
 *  - Trims surrounding whitespace
 *
 * This preserves paragraph structure without destroying content.
 *
 * @param {string} raw
 * @returns {string}
 */
const normalizeText = (raw) => {
  return raw
    .replace(/\r\n/g, '\n')          // Windows line endings → Unix
    .replace(/\r/g, '\n')             // old Mac line endings → Unix
    .replace(/\n{3,}/g, '\n\n')       // collapse 3+ blank lines → 1 blank line
    .trim();
};

/**
 * Extracts and normalizes text from an in-memory file buffer.
 *
 * @param {Buffer} buffer   - The raw file bytes (from req.file.buffer)
 * @param {string} mimetype - The file's MIME type (from req.file.mimetype)
 * @returns {Promise<string>} Extracted and normalized text
 * @throws {Error} If the format is unsupported or the document is empty
 */
export const extractText = async (buffer, mimetype) => {
  let raw = '';

  if (mimetype === MIME_PDF) {
    // pdf-parse reads the buffer directly
    const result = await pdfParse(buffer);
    raw = result.text || '';

  } else if (mimetype === MIME_DOCX) {
    // mammoth extracts plain text from a DOCX buffer
    const result = await mammoth.extractRawText({ buffer });
    raw = result.value || '';

  } else if (mimetype === MIME_TXT) {
    // Plain text — just decode the buffer as UTF-8
    raw = buffer.toString('utf8');

  } else {
    // Should not reach here if uploadMiddleware fileFilter is in use,
    // but we guard against it anyway.
    throw new Error('Unsupported file type. Please upload a PDF, DOCX, or TXT file.');
  }

  const text = normalizeText(raw);

  if (text.length < MIN_TEXT_LENGTH) {
    throw new Error('Uploaded document does not contain readable text.');
  }

  return text;
};
