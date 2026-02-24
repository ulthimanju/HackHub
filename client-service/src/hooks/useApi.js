import { useState, useEffect, useCallback } from 'react';
import { extractErrorMessage } from '../services/api';

/**
 * Generic data-fetching hook.
 *
 * @param {Function} fetchFn  - async function that returns the data
 * @param {Array}    deps     - effect dependencies (default [])
 * @returns {{ data, loading, error, refetch }}
 */
export function useApi(fetchFn, deps = []) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const run = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchFn()
      .then((result) => { if (!cancelled) { setData(result); } })
      .catch((err)   => { if (!cancelled) { setError(extractErrorMessage(err, 'Request failed')); } })
      .finally(()    => { if (!cancelled) { setLoading(false); } });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => run(), [run]);

  return { data, loading, error, refetch: run };
}
