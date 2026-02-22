import React from 'react';
import { Crown } from 'lucide-react';

/**
 * Renders a list of team members with avatar initials and a leader crown.
 * @param {Array}  members - array of member objects with { id, userId, username, role, status }
 * @param {string} filter  - optional status to filter by (e.g. 'ACCEPTED')
 */
const TeamMemberList = ({ members = [], filter }) => {
  const visible = filter ? members.filter(m => m.status === filter) : members;

  return (
    <div className="flex flex-col gap-1.5">
      {visible.map(m => (
        <div key={m.id ?? m.userId} className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold
            ${m.role === 'LEADER' ? 'bg-brand-100 text-brand-600' : 'bg-surface-hover text-ink-muted'}`}>
            {m.username?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <span className="text-sm text-ink-primary font-medium truncate flex-1">{m.username}</span>
          {m.role === 'LEADER' && (
            <span className="flex items-center gap-0.5 text-xs font-medium text-brand-500 shrink-0">
              <Crown className="w-3 h-3" />
              Leader
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default TeamMemberList;
