import React, { memo } from 'react';
import Button from '../../../common/Button/Button';

const EmptyState = memo(({ icon: Icon, title, message, actionLabel, onActionClick, illustrationSrc }) => {
  return (
    <div className="bg-white border border-dashed border-surface-border rounded-xl p-12 text-center space-y-5">
      {/* Illustration or icon fallback */}
      {illustrationSrc ? (
        <img
          src={illustrationSrc}
          alt=""
          className="w-44 h-44 mx-auto object-contain"
          onError={e => { e.target.style.display = 'none'; }}
        />
      ) : Icon ? (
        <div className="w-14 h-14 bg-surface-hover rounded-xl flex items-center justify-center text-ink-disabled mx-auto">
          <Icon className="w-7 h-7" />
        </div>
      ) : null}
      <div className="max-w-xs mx-auto space-y-1.5">
        <h3 className="font-display font-semibold text-base text-ink-primary">{title}</h3>
        <p className="text-ink-muted text-sm leading-relaxed">{message}</p>
      </div>
      {actionLabel && (
        <Button variant="outline" onClick={onActionClick}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
});
EmptyState.displayName = 'EmptyState';
export default EmptyState;
