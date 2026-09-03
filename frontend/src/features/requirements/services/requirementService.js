import api from '../../../services/api';

/**
 * requirementService.js — API layer for the requirements feature.
 *
 * This is the ONLY file in the requirements feature that imports the API client.
 * Hooks call these functions. Components never import this file directly.
 */

// ── File validation constants ─────────────────────────────────────────────────

export const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

export const ACCEPTED_EXTENSIONS = ['.pdf', '.docx', '.txt'];
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Client-side file validation before sending to the backend.
 * The backend also validates — this is a fast UX guard, not the security layer.
 *
 * @param {File} file
 * @returns {string|null} Error message, or null if valid
 */
export const validateFile = (file) => {
  if (!file) return 'Please select a file.';

  if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
    return 'Unsupported file type. Please upload a PDF, DOCX, or TXT file.';
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return 'File is too large. Please choose a file under 10 MB.';
  }

  return null;
};

// ── Text requirement persistence ──────────────────────────────────────────────

/**
 * Load saved requirements text for a project from the API.
 * Returns the first requirement's description field (the text entered in the editor).
 *
 * @param {string} projectId
 * @returns {Promise<{ text: string, updatedAt: string|null }>}
 */
export const loadRequirements = async (projectId) => {
  try {
    const response = await api.get(`/api/projects/${projectId}/requirements`);
    const requirements = response.data.data;
    if (requirements && requirements.length > 0) {
      return {
        text: requirements[0].description || '',
        updatedAt: requirements[0].updatedAt,
      };
    }
    return { text: '', updatedAt: null };
  } catch (err) {
    console.error('Failed to load requirements:', err);
    return { text: '', updatedAt: null };
  }
};

/**
 * Persist requirements text for a project via the API.
 * If a requirement already exists for the project, updates it.
 * If none exists, creates a new one.
 *
 * @param {string} projectId
 * @param {string} text
 * @returns {Promise<{ text: string, updatedAt: string|null }>}
 */
export const saveRequirements = async (projectId, text) => {
  try {
    const response = await api.get(`/api/projects/${projectId}/requirements`);
    const requirements = response.data.data;

    let savedReq;
    if (requirements && requirements.length > 0) {
      const reqId = requirements[0]._id;
      const updateRes = await api.put(
        `/api/projects/${projectId}/requirements/${reqId}`,
        { description: text }
      );
      savedReq = updateRes.data.data;
    } else {
      const createRes = await api.post(`/api/projects/${projectId}/requirements`, {
        requirementId: `REQ-${Date.now()}`,
        title: 'Project Requirements',
        type: 'functional',
        description: text,
      });
      savedReq = createRes.data.data;
    }

    return { text: savedReq.description, updatedAt: savedReq.updatedAt };
  } catch (err) {
    console.error('Failed to save requirements:', err);
    throw err;
  }
};

/**
 * Clear saved requirements for a project via the API.
 *
 * @param {string} projectId
 */
export const clearRequirements = async (projectId) => {
  try {
    const response = await api.get(`/api/projects/${projectId}/requirements`);
    const requirements = response.data.data;
    if (requirements && requirements.length > 0) {
      await api.delete(
        `/api/projects/${projectId}/requirements/${requirements[0]._id}`
      );
    }
  } catch (err) {
    console.error('Failed to clear requirements:', err);
  }
};

// ── Document upload ───────────────────────────────────────────────────────────

/**
 * Upload a requirement document to the backend for text extraction.
 *
 * The backend extracts text from the file and returns it so the frontend
 * can immediately populate the write-mode editor.
 *
 * @param {string} projectId
 * @param {File}   file        - The File object from the browser's file input
 * @returns {Promise<{ knowledgeDocId: string, filename: string, fileType: string, extractedText: string }>}
 */
export const uploadDocument = async (projectId, file) => {
  // Build multipart/form-data — Axios detects FormData and sets the correct
  // Content-Type header (including boundary) automatically.
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post(
    `/api/projects/${projectId}/requirements/upload`,
    formData,
    {
      // Override the default 'application/json' header so Axios sends multipart
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );

  return response.data.data;
};
