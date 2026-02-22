import React from 'react';

/**
 * Branded section title with an accent bar.
 * Used in tabs and card sections throughout the app.
 */
const SectionTitle = ({ children }) => (
  <div className="flex items-center gap-2.5">
    <div className="w-0.5 h-5 bg-brand-500 rounded-full" />
    <h3 className="text-base font-semibold text-ink-primary font-display">{children}</h3>
  </div>
);

export default SectionTitle;
