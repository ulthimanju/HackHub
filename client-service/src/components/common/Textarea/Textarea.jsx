import React, { memo } from 'react';
import { theme } from '../../../utils/theme';

const Textarea = memo(({ label, rows = 3, error, className = '', ...props }) => (
  <div>
    {label && <label className={`block mb-2 ${theme.text.label}`}>{label}</label>}
    <textarea
      rows={rows}
      {...props}
      className={`w-full px-4 py-3 bg-white border ${error ? 'border-red-400' : 'border-gray-300'} rounded-xl text-sm text-gray-900 placeholder-gray-400 ${theme.focus} transition-all resize-none ${className}`}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
));
Textarea.displayName = 'Textarea';
export default Textarea;
