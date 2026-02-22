import React, { memo } from 'react';
import Badge from '../../../common/Badge/Badge';

const UserProfileCard = memo(({ username, role, email, accountId }) => {
  return (
    <div className="bg-white border border-surface-border rounded-xl p-8">
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl font-bold text-brand-600 font-display">{username.charAt(0).toUpperCase()}</span>
        </div>
        
        <h4 className="text-xl font-semibold text-ink-primary font-display mb-2">{username}</h4>
        
        <Badge>{role}</Badge>
        
        <div className="w-full border-t border-surface-border my-4"></div>
        
        <div className="w-full space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-surface-hover rounded-md flex items-center justify-center">
              <svg className="w-4 h-4 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-left flex-1">
              <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-1">Email</p>
              <p className="text-sm font-medium text-ink-primary">{email}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-surface-hover rounded-md flex items-center justify-center">
              <svg className="w-4 h-4 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
            </div>
            <div className="text-left flex-1">
              <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-1">Account ID</p>
              <p className="text-sm font-medium text-ink-primary">{accountId}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
UserProfileCard.displayName = 'UserProfileCard';
export default UserProfileCard;
