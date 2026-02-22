import React, { memo } from 'react';
import { theme } from '../../../utils/theme';

const Textarea = memo(({ label, rows = 4, error, hint, className = '', ...props }) => (
  <div className="space-y-2">
    {label && (
      <label className={`${theme.text.label} inline-block mb-0.5`}>
        {label}
        {props.required && <span className="text-red-500 ml-1 font-bold">*</span>}
      </label>
    )}
    <textarea
      rows={rows}
      {...props}
      className={[
        'w-full bg-white border rounded-lg px-3 py-2 text-sm text-ink-secondary placeholder-ink-muted/60',
        'resize-y transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500',
        'disabled:bg-surface-hover disabled:text-ink-muted disabled:cursor-not-allowed',
        error ? 'border-red-400 focus:border-red-500 focus:ring-red-400/25' : 'border-surface-border',
        className,
      ].filter(Boolean).join(' ')}
    />
    {error && <p className="text-xs text-red-600">{error}</p>}
    {hint && !error && <p className="text-xs text-ink-muted">{hint}</p>}
  </div>
));

Textarea.displayName = 'Textarea';
export default Textarea;
