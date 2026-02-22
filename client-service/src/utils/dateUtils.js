/**
 * Centralized date formatting utilities.
 */

/** "1 Jan 2025" */
export const formatDateShort = (d) => {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

/** "01/01/2025, 14:30" */
export const formatDateTime = (d) => {
  if (!d) return 'N/A';
  return new Date(d).toLocaleString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};
