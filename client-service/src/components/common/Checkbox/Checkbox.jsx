import React, { memo } from 'react';
import { Check } from 'lucide-react';

const Checkbox = memo(({ label, id, checked, onChange, ...props }) => (
  <label htmlFor={id} className="flex items-center gap-2.5 cursor-pointer group select-none">
    <div className="relative flex-shrink-0">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="sr-only"
        {...props}
      />
      <div className={[
        'w-4 h-4 rounded border transition-all duration-150',
        checked
          ? 'bg-brand-500 border-brand-500'
          : 'bg-white border-surface-border group-hover:border-brand-400',
      ].join(' ')}>
        {checked && <Check className="w-3 h-3 text-white absolute top-0.5 left-0.5" strokeWidth={3} />}
      </div>
    </div>
    {label && (
      <span className="text-sm text-ink-secondary group-hover:text-ink-primary transition-colors">
        {label}
      </span>
    )}
  </label>
));

Checkbox.displayName = 'Checkbox';
export default Checkbox;
