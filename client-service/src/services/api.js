import axios from 'axios';

/**
 * Pre-configured Axios instance used by all service modules.
 *
 * - Base URL: `/api` (proxied to the API Gateway in development; nginx in production)
 * - Request interceptor: attaches `Authorization: Bearer <token>` from localStorage
 * - Response interceptor:
 *     - Unwraps `response.data` so callers receive the payload directly
 *     - Redirects to `/login` and clears stored credentials on HTTP 401
 */

const api = axios.create({
  baseURL: '/api', // This should be proxied to the API Gateway (8000)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auto-logout and redirect on 401 Unauthorized (expired/invalid token)
// Returns response.data directly so service methods don't need to unwrap it.
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

/**
 * Extracts a human-readable error message from an Axios error.
 * Handles: structured `{ message }` responses, plain string responses, and generic JS errors.
 *
 * @param {Error}  err                - The caught error.
 * @param {string} [fallback]         - Fallback text if no message can be extracted.
 * @returns {string}
 */
export const extractErrorMessage = (err, fallback = 'An unexpected error occurred.') =>
  err?.response?.data?.message
  ?? (typeof err?.response?.data === 'string' ? err.response.data : null)
  ?? err?.message
  ?? fallback;
