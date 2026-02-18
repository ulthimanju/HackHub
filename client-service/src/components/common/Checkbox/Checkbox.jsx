import React from 'react';

const Checkbox = ({ label, id, checked, onChange, ...props }) => {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
        {...props}
      />
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-gray-700 cursor-pointer">
          {label}
        </label>
      )}
    </div>
  );
};

export default Checkbox;
