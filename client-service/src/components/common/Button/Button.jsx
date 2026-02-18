import React, { memo } from 'react';
import { theme } from '../../../utils/theme';

const Button = memo(({ variant = 'primary', size = 'md', fullWidth = false, icon: Icon, children, loading, className = '', ...props }) => {
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-5 py-2.5 text-sm', lg: 'px-8 py-3.5 text-base' };
  return (
    <button
      disabled={loading}
      className={`flex items-center justify-center gap-2 font-bold rounded-xl transition-all ${fullWidth ? 'w-full' : ''} ${theme.button[variant] || theme.button.primary} ${sizes[size]} ${loading ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (Icon && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />)}
      <span>{children}</span>
    </button>
  );
});
Button.displayName = 'Button';
export default Button;
