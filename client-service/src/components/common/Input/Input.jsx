import React, { memo } from 'react';
import { theme } from '../../../utils/theme';

const Input = memo(({ label, icon: Icon, error, hint, className = '', ...props }) => (
  <div className="space-y-2">
    {label && (
      <label className={`${theme.text.label} inline-block mb-0.5`}>
        {label}
        {props.required && <span className="text-red-500 ml-1 font-bold">*</span>}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="w-4 h-4 text-ink-muted" />
        </div>
      )}
      <input
        {...props}
        className={[
          'w-full bg-white border rounded-lg text-sm text-ink-secondary placeholder-ink-muted/60',
          'transition-all duration-150',
          'focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500',
          'disabled:bg-surface-hover disabled:text-ink-muted disabled:cursor-not-allowed',
          Icon ? 'pl-9 pr-3 py-2' : 'px-3 py-2',
          error ? 'border-red-400 focus:border-red-500 focus:ring-red-400/25' : 'border-surface-border',
          className,
        ].filter(Boolean).join(' ')}
      />
    </div>
    {error && <p className="text-xs text-red-600">{error}</p>}
    {hint && !error && <p className="text-xs text-ink-muted">{hint}</p>}
  </div>
));

Input.displayName = 'Input';
export default Input;
