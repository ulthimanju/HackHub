import React, { memo } from 'react';
import { theme } from '../../../../utils/theme';

const Checkbox = memo(({ label, id, checked, onChange, ...props }) => (
  <div className="flex items-center gap-2">
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={onChange}
      className={`w-4 h-4 border-gray-300 rounded ${theme.primary.focus} focus:ring-2`}
      {...props}
    />
    {label && <label htmlFor={id} className={`text-sm cursor-pointer ${theme.text.label}`}>{label}</label>}
  </div>
));
Checkbox.displayName = 'Checkbox';
export default Checkbox;
