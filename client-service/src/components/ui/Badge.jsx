import React from 'react';
import { X } from 'lucide-react';

const Badge = ({ children, removable, onRemove, ...props }) => {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white text-orange-700 border border-orange-300" {...props}>
      {children}
      {removable && (
        <X className="w-3 h-3 cursor-pointer hover:text-orange-900" onClick={onRemove} />
      )}
    </span>
  );
};

export default Badge;
