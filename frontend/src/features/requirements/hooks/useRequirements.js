/**
 * useRequirements.js
 *
 * Hooks layer for the requirements feature.
 *
 * Orchestrates async operations for requirement document uploads.
 * Never renders JSX. Never holds data beyond transient upload state.
 *
 * Architecture contract:
 *   UI (RequirementsPage)
 *     ↓ calls hook functions
 *   Hook (useRequirements) — this file
 *     ↓ calls API service functions
 *   API (requirementService.js)
 *     ↓ uses Axios instance
 *   Backend
 */

import { useState, useCallback } from 'react';
import { uploadDocument } from '../services/requirementService';

// Upload can be in one of four states.
// The component reads this value to show the appropriate UI.
const UPLOAD_STATES = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  SUCCESS: 'success',
  ERROR: 'error',
};

/**
 * @returns {{
 *   uploadState: 'idle' | 'uploading' | 'success' | 'error',
 *   uploadError: string | null,
 *   uploadedDoc: object | null,
 *   handleUploadDocument: (projectId: string, file: File) => Promise<object | null>,
 *   resetUpload: () => void,
 * }}
 */
const useRequirements = () => {
  const [uploadState, setUploadState] = useState(UPLOAD_STATES.IDLE);
  const [uploadError, setUploadError] = useState(null);
  const [uploadedDoc, setUploadedDoc] = useState(null);

  /**
   * Uploads a file to the backend and extracts its text content.
   *
   * On success  — sets uploadState to 'success' and returns the response data.
   * On failure  — sets uploadState to 'error' with the error message.
   *
   * @param {string} projectId
   * @param {File}   file
   * @returns {Promise<object|null>} Backend response data, or null on failure
   */
  const handleUploadDocument = useCallback(async (projectId, file) => {
    setUploadState(UPLOAD_STATES.UPLOADING);
    setUploadError(null);
    setUploadedDoc(null);

    try {
      const data = await uploadDocument(projectId, file);
      setUploadedDoc(data);
      setUploadState(UPLOAD_STATES.SUCCESS);
      return data;
    } catch (err) {
      // Normalize the error message from the API interceptor or raw Error
      const message =
        err.message ||
        'Upload failed. Please try again.';
      setUploadError(message);
      setUploadState(UPLOAD_STATES.ERROR);
      return null;
    }
  }, []);

  /**
   * Resets the upload state back to idle.
   * Call this when the user removes the selected file.
   */
  const resetUpload = useCallback(() => {
    setUploadState(UPLOAD_STATES.IDLE);
    setUploadError(null);
    setUploadedDoc(null);
  }, []);

  return {
    uploadState,
    uploadError,
    uploadedDoc,
    handleUploadDocument,
    resetUpload,
  };
};

export default useRequirements;
