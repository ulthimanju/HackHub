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
// On 403/409 with phase-mismatch messages, signals useEventLifecycle to refresh.
// Returns response.data directly so service methods don't need to unwrap it.
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    const status = error.response?.status;
    if (status === 403 || status === 409) {
      const msg = (error.response?.data?.message || '').toLowerCase();
      const phaseKeywords = ['phase', 'locked', 'closed', 'registration', 'ongoing', 'started', 'judging', 'completed'];
      if (phaseKeywords.some(k => msg.includes(k))) {
        window.dispatchEvent(new CustomEvent('lifecycle-stale'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;

/**
 * Extracts a human-readable error message from an Axios error.
 *
 * Priority:
 *   1. Structured backend payload — `err.response.data.message` (ErrorResponse contract)
 *   2. Plain string response body
 *   3. HTTP status-code specific fallbacks (500, 502/503/504, 429)
 *   4. Network / timeout failures → connection message
 *   5. Generic JS error message or provided fallback
 *
 * @param {Error}  err        - The caught Axios or JS error.
 * @param {string} [fallback] - Fallback text if no message can be extracted.
 * @returns {string}
 */
export const extractErrorMessage = (err, fallback = 'An unexpected error occurred.') => {
  // P1: Structured backend ErrorResponse contract
  if (err?.response?.data?.message) return err.response.data.message;

  // P2: Plain string response body
  if (typeof err?.response?.data === 'string' && err.response.data) return err.response.data;

  // P3: HTTP status-code specific fallbacks
  const status = err?.response?.status;
  if (status === 500) return 'Server error. Please try again shortly.';
  if (status === 502 || status === 503 || status === 504) return 'Service unavailable. Please try again later.';
  if (status === 429) return 'Too many requests. Please wait a moment and try again.';

  // P4: Network / timeout failures
  if (err?.code === 'ERR_NETWORK' || err?.message === 'Network Error')
    return 'Please check your internet connection.';
  if (err?.code === 'ECONNABORTED' || err?.message?.toLowerCase().includes('timeout'))
    return 'Connection timed out. Please check your internet connection.';

  // P5: Generic JS error or fallback
  return err?.message || fallback;
};
