import React, { memo } from 'react';
import { theme } from '../../../utils/theme';

const Input = memo(({ label, icon: Icon, error, ...props }) => (
  <div>
    {label && <label className={`block mb-2 ${theme.text.label}`}>{label}</label>}
    <div className="relative">
      {Icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Icon className={`w-4 h-4 ${theme.primary.icon}`} /></div>}
      <input
        {...props}
        className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2 bg-white border ${error ? 'border-red-400' : 'border-gray-300'} rounded-xl text-sm text-gray-900 placeholder-gray-400 ${theme.focus} transition-all ${props.className || ''}`}
      />
    </div>
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
));
Input.displayName = 'Input';
export default Input;
