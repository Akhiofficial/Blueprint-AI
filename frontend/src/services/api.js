/**
 * api.js — Global Axios API Client
 *
 * Single source of truth for all HTTP requests to the BlueprintAI backend.
 * All feature-level API files import from here — never import axios directly.
 *
 * Configuration:
 *   - baseURL: VITE_API_BASE_URL from environment
 *   - withCredentials: true (always sends httpOnly auth cookies)
 *   - Content-Type: application/json
 *
 * Interceptors:
 *   - Response: on 401, dispatches 'auth:unauthorized' custom event
 *     so useAuth can redirect to /login without coupling to react-router here.
 */
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor: handle 401 globally and normalize errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }

    let serverMessage = null;
    // When responseType is 'blob', Axios provides error body as a Blob
    if (error.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const parsed = JSON.parse(text);
        serverMessage = parsed.message || parsed.error;
      } catch {
        // Blob wasn't JSON
      }
    } else if (error.response?.data?.message) {
      serverMessage = error.response.data.message;
    }
    
    // Normalize error for the UI
    const normalizedError = {
      message: serverMessage || error.response?.data?.message || error.message || 'An unexpected network error occurred.',
      status: error.response?.status || 500,
      code: error.code || 'UNKNOWN_ERROR',
      isNormalized: true
    };
    
    return Promise.reject(normalizedError);
  }
);

export default api;
