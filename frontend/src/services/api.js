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
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor: handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;
