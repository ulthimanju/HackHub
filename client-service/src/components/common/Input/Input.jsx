import React from 'react';

const Input = ({ label, icon: Icon, type = 'text', placeholder, ...props }) => {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="w-4 h-4 text-orange-500" />
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          {...props}
          className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${props.className || ''}`}
        />
      </div>
    </div>
  );
};

export default Input;
