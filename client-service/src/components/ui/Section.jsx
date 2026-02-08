import React from 'react';

const Section = ({ title, children }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      {children}
    </div>
  );
};

export default Section;
