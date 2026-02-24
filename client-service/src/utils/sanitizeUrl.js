/**
 * Returns the URL only if it uses http: or https: scheme.
 * Returns "#" for any other value (e.g. javascript:, data:) to prevent injection.
 */
export function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '#';
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return '#';
}
