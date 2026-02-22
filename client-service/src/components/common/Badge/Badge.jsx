import React, { memo } from 'react';
import { X } from 'lucide-react';
import { theme } from '../../../utils/theme';

const Badge = memo(({ children, variant = 'info', removable, onRemove, className = '', ...props }) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border transition-colors ${theme.badge[variant] ?? theme.badge.info} ${className}`}
    {...props}
  >
    {children}
    {removable && (
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 hover:opacity-70 transition-opacity focus:outline-none"
        aria-label="Remove"
      >
        <X className="w-3 h-3" />
      </button>
    )}
  </span>
));

Badge.displayName = 'Badge';
export default Badge;
