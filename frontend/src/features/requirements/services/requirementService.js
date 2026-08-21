/**
 * requirementService.js
 *
 * Requirements data layer.
 *
 * PHASE 2 NOTE:
 * The backend requirement API (POST /api/projects/:projectId/requirements)
 * is not yet implemented. Until it is, requirements text is persisted in
 * localStorage keyed by projectId. This file is the single point to swap
 * out localStorage for real API calls once the backend is ready.
 *
 * Replace the functions below with axios calls when Phase 2 is complete.
 */

const STORAGE_KEY = (projectId) => `bp_requirements_${projectId}`;

/**
 * Load saved requirements text for a project.
 * @param {string} projectId
 * @returns {{ text: string, updatedAt: string|null }}
 */
export const loadRequirements = (projectId) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(projectId));
    if (!raw) return { text: '', updatedAt: null };
    return JSON.parse(raw);
  } catch {
    return { text: '', updatedAt: null };
  }
};

/**
 * Persist requirements text for a project.
 * @param {string} projectId
 * @param {string} text
 */
export const saveRequirements = (projectId, text) => {
  const data = { text, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY(projectId), JSON.stringify(data));
  return data;
};

/**
 * Clear saved requirements for a project.
 * @param {string} projectId
 */
export const clearRequirements = (projectId) => {
  localStorage.removeItem(STORAGE_KEY(projectId));
};

// ── Supported file types ─────────────────────────────────────────────────────
export const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
];

export const ACCEPTED_EXTENSIONS = ['.pdf', '.docx'];

// Max file size: 10 MB (align with typical Multer defaults)
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/**
 * Validate an uploaded File object.
 * Returns an error string if invalid, null if valid.
 * @param {File} file
 * @returns {string|null}
 */
export const validateFile = (file) => {
  if (!file) return 'Please select a file.';
  if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
    return 'This file type isn\'t supported. Please upload a PDF or DOCX document.';
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return 'This file is too large. Please choose a file under 10 MB.';
  }
  return null;
};

/**
 * Read a text file's content as a string.
 * For PDF/DOCX, real parsing requires the backend.
 * This returns a stub acknowledgment for Phase 1.
 * @param {File} file
 * @returns {Promise<string>}
 */
export const readFileAsText = (file) =>
  new Promise((resolve) => {
    // Phase 1: we cannot parse PDF/DOCX on the client without external libs.
    // Acknowledge the upload and let the user know processing happens server-side.
    resolve(`[File uploaded: ${file.name} — ${(file.size / 1024).toFixed(1)} KB]\n\nNote: Full document parsing will be available when the backend processing API is ready.`);
  });
