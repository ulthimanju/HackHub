import React from 'react';

/**
 * Reusable spinner component.
 * @param {string} size   - 'sm' | 'md' (default) | 'lg'
 * @param {string} className - additional classes
 */
const Spinner = ({ size = 'md', className = '' }) => {
  const sizeMap = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-4',
  };
  return (
    <div
      className={[
        sizeMap[size] ?? sizeMap.md,
        'border-brand-200 border-t-brand-500 rounded-full animate-spin',
        className,
      ].filter(Boolean).join(' ')}
    />
  );
};

/** Full-page centered spinner */
export const PageSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface-page">
    <Spinner size="lg" />
  </div>
);

export default Spinner;
