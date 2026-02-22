import React, { memo } from 'react';

const Section = memo(({ title, description, action, children }) => (
  <div>
    {(title || action) && (
      <div className="flex items-center justify-between mb-4">
        <div>
          {title && (
            <p className="text-xs font-medium text-ink-muted uppercase tracking-widest">
              {title}
            </p>
          )}
          {description && (
            <p className="text-sm text-ink-muted mt-0.5">{description}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    )}
    {children}
  </div>
));

Section.displayName = 'Section';
export default Section;
