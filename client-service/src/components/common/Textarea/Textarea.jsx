import React from 'react';

const Textarea = ({ label, placeholder, rows = 3, className = '', ...props }) => {
  return (
    <div>
      {label && (
        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        placeholder={placeholder}
        {...props}
        className={`w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none ${className}`}
      />
    </div>
  );
};

export default Textarea;
