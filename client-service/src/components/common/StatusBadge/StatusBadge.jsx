import React from 'react';

/** Status → display config */
const STATUS_CONFIG = {
  // Registration statuses
  PENDING:  { label: 'Pending',  cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  APPROVED: { label: 'Approved', cls: 'bg-green-50 text-green-700 border-green-200' },
  REJECTED: { label: 'Rejected', cls: 'bg-red-50 text-red-600 border-red-200' },
  // Team member statuses
  ACCEPTED: { label: 'Accepted', cls: 'bg-green-50 text-green-700 border-green-200' },
  INVITED:  { label: 'Invited',  cls: 'bg-blue-50 text-blue-600 border-blue-200' },
  REQUESTED:{ label: 'Requested',cls: 'bg-purple-50 text-purple-600 border-purple-200' },
};

/**
 * Renders a pill badge for a given status string.
 * Falls back to PENDING style for unknown statuses.
 */
const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${config.cls}`}>
      {config.label}
    </span>
  );
};

export { STATUS_CONFIG };
export default StatusBadge;
