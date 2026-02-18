import React from 'react';

const Button = ({ 
  variant = 'primary', 
  size = 'md',
  fullWidth = false,
  icon: Icon, 
  children, 
  loading, 
  className = '', 
  ...props 
}) => {
  const variants = {
    primary: 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-200/50 active:scale-95',
    secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 active:scale-95',
    outline: 'bg-white text-orange-600 border border-orange-500 hover:bg-orange-50 active:scale-95',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 active:scale-95',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 active:scale-95'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base'
  };

  return (
    <button 
      disabled={loading}
      className={`
        flex items-center justify-center gap-2 font-bold rounded-xl transition-all 
        ${fullWidth ? 'w-full' : ''} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${loading ? 'opacity-70 cursor-not-allowed' : ''} 
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      ) : (
        Icon && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      )}
      <span>{children}</span>
    </button>
  );
};

export default Button;
