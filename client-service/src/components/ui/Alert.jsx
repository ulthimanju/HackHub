import React from 'react';
import { Check } from 'lucide-react';

const Alert = ({ type = 'info', title, children }) => {
  const icon = type === 'success' ? (
    <Check className="w-5 h-5 text-orange-600" />
  ) : (
    <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
      <span className="text-white text-xs">{type === 'warning' ? '!' : 'i'}</span>
    </div>
  );

  return (
    <div className="flex gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-orange-900 mb-1">{title}</h4>
        <p className="text-sm text-orange-800">{children}</p>
      </div>
    </div>
  );
};

export default Alert;
