import React, { memo } from 'react';
import { X } from 'lucide-react';
import { theme } from '../../../utils/theme';

const Badge = memo(({ children, variant = 'info', removable, onRemove, className = '', ...props }) => (
  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase border transition-all ${theme.badge[variant] || theme.badge.info} ${className}`} {...props}>
    {children}
    {removable && <X className="w-3 h-3 cursor-pointer hover:opacity-70 transition-opacity" onClick={onRemove} />}
  </span>
));
Badge.displayName = 'Badge';
export default Badge;
