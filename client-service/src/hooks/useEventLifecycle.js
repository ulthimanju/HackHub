import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const BASE_URL = '/api';

function getToken() {
  return localStorage.getItem('token');
}

/** Returns polling interval: 5 s if a phase transition is under 60 s away, else 30 s. */
function calcInterval(lifecycle) {
  if (!lifecycle?.phaseTimestamps) return 30000;
  const now = Date.now();
  const upcoming = Object.values(lifecycle.phaseTimestamps)
    .map(t => new Date(t).getTime())
    .filter(t => !isNaN(t) && t > now);
  if (upcoming.length === 0) return 30000;
  return Math.min(...upcoming) - now < 60000 ? 5000 : 30000;
}

/**
 * Polls GET /events/{id}/lifecycle with smart interval adaptation and ETag/304 support.
 *
 * Returns:
 *   lifecycle  – the latest LifecycleResponse payload (null while loading)
 *   loading    – true on the first fetch
 *   error      – error message string or null
 *   hasCapability(key) – true if key is in lifecycle.allowedActions
 */
export function useEventLifecycle(eventId) {
  const [lifecycle, setLifecycle] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const etagRef       = useRef(null);
  const lifecycleRef  = useRef(null);
  const timeoutRef    = useRef(null);
  const isMountedRef  = useRef(false);
  const pollRef       = useRef(null);

  useEffect(() => {
    if (!eventId) return;

    isMountedRef.current = true;

    const doFetch = async () => {
      if (!isMountedRef.current) return;
      try {
        const headers = {};
        const token = getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (etagRef.current) headers['If-None-Match'] = etagRef.current;

        const response = await axios.get(`${BASE_URL}/events/${eventId}/lifecycle`, {
          headers,
          validateStatus: s => s === 200 || s === 304,
        });

        if (!isMountedRef.current) return;

        if (response.status === 200) {
          etagRef.current = response.headers['etag'] || null;
          lifecycleRef.current = response.data;
          setLifecycle(response.data);
          setError(null);
        }
        // 304: no state change — keep existing lifecycle
        setLoading(false);
      } catch (err) {
        if (!isMountedRef.current) return;
        setError(err?.response?.data?.message ?? 'Failed to load lifecycle');
        setLoading(false);
      } finally {
        if (isMountedRef.current) {
          const interval = calcInterval(lifecycleRef.current);
          timeoutRef.current = setTimeout(doFetch, interval);
        }
      }
    };

    pollRef.current = doFetch;
    doFetch();

    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [eventId]);

  // Immediately re-fetch when api.js signals a phase mismatch (403/409 with phase keywords)
  useEffect(() => {
    const handler = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      pollRef.current?.();
    };
    window.addEventListener('lifecycle-stale', handler);
    return () => window.removeEventListener('lifecycle-stale', handler);
  }, []);

  const hasCapability = useCallback(
    (key) => lifecycle?.allowedActions?.includes(key) ?? false,
    [lifecycle]
  );

  return { lifecycle, loading, error, hasCapability };
}
