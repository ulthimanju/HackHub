import React from 'react';

const Button = ({ variant = 'primary', icon: Icon, children, ...props }) => {
  const variants = {
    primary: 'bg-orange-500 text-white hover:bg-orange-600',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
    outline: 'bg-white text-orange-600 border border-orange-500 hover:bg-orange-50'
  };

  return (
    <button 
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${variants[variant]}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

export default Button;
