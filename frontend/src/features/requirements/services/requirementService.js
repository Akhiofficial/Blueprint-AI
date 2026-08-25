import api from '../../../services/api';

/**
 * Load saved requirements text for a project from the API.
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
        updatedAt: requirements[0].updatedAt 
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
      const updateRes = await api.put(`/api/projects/${projectId}/requirements/${reqId}`, {
        description: text
      });
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
 * @param {string} projectId
 */
export const clearRequirements = async (projectId) => {
  try {
    const response = await api.get(`/api/projects/${projectId}/requirements`);
    const requirements = response.data.data;
    if (requirements && requirements.length > 0) {
      await api.delete(`/api/projects/${projectId}/requirements/${requirements[0]._id}`);
    }
  } catch (err) {
    console.error('Failed to clear requirements:', err);
  }
};

export const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
export const ACCEPTED_EXTENSIONS = ['.pdf', '.docx'];
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

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

export const readFileAsText = (file) =>
  new Promise((resolve) => {
    resolve(`[File uploaded: ${file.name} — ${(file.size / 1024).toFixed(1)} KB]\n\nNote: Full document parsing will be available when the backend processing API is ready.`);
  });
