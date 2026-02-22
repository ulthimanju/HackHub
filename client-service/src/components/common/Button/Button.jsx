import React, { memo } from 'react';
import { theme } from '../../../utils/theme';

const SIZE = {
  xs: 'px-2.5 py-1 text-xs gap-1.5',
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-sm gap-2',
};

const ICON_SIZE = { xs: 'w-3 h-3', sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-4 h-4' };

const Button = memo(({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon: Icon,
  children,
  loading,
  className = '',
  ...props
}) => (
  <button
    disabled={loading || props.disabled}
    className={[
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
      fullWidth ? 'w-full' : '',
      theme.button[variant] ?? theme.button.primary,
      SIZE[size] ?? SIZE.md,
      className,
    ].filter(Boolean).join(' ')}
    {...props}
  >
    {loading
      ? <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      : Icon && <Icon className={ICON_SIZE[size] ?? ICON_SIZE.md} />}
    {children && <span>{children}</span>}
  </button>
));

Button.displayName = 'Button';
export default Button;
