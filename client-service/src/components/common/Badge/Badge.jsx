import React from 'react';
import { X } from 'lucide-react';

const Badge = ({ children, variant = 'info', removable, onRemove, className = '', ...props }) => {
  const variants = {
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    secondary: 'bg-gray-50 text-gray-700 border-gray-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200'
  };

  const variantClass = variants[variant] || variants.info;

  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase border transition-all ${variantClass} ${className}`} 
      {...props}
    >
      {children}
      {removable && (
        <X className="w-3 h-3 cursor-pointer hover:opacity-70 transition-opacity" onClick={onRemove} />
      )}
    </span>
  );
};

export default Badge;
