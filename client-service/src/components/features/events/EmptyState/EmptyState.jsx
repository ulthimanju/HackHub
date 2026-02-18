import React from 'react';
import Button from '../../../common/Button/Button';

const EmptyState = ({ icon: Icon, title, message, actionLabel, onActionClick }) => {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center space-y-4 shadow-sm">
      {Icon && (
        <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 mx-auto border-4 border-orange-100">
          <Icon className="w-10 h-10" />
        </div>
      )}
      <div className="max-w-xs mx-auto space-y-2">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{message}</p>
      </div>
      {actionLabel && (
        <Button variant="outline" className="rounded-xl px-8" onClick={onActionClick}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
