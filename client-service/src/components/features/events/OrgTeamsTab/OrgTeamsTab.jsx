import React, { useState } from 'react';
import { Users, Search, Crown } from 'lucide-react';
import Alert from '../../../common/Alert/Alert';

/**
 * Props:
 *   teams            – orgTeams array
 *   loading          – boolean
 *   error            – string
 *   problemStatements – eventDetails.problemStatements array
 */
export default function OrgTeamsTab({ teams, loading, error, problemStatements }) {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by team name…"
          className="w-full pl-9 pr-4 py-2 border border-surface-border rounded-lg text-sm text-ink-primary placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : error ? (
        <Alert type="error" message={error} />
      ) : teams.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3 text-center">
          <Users className="w-10 h-10 text-ink-disabled" />
          <p className="font-semibold text-ink-muted">No teams formed yet</p>
          <p className="text-sm text-ink-muted">Teams will appear here once participants create them.</p>
        </div>
      ) : (() => {
        const filtered = teams.filter(t =>
          !search || t.name?.toLowerCase().includes(search.toLowerCase())
        );
        if (!filtered.length) return (
          <div className="flex flex-col items-center py-12 gap-2 text-center">
            <Search className="w-8 h-8 text-ink-disabled" />
            <p className="text-sm text-ink-muted">No teams match "<span className="font-medium text-ink-secondary">{search}</span>"</p>
          </div>
        );
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map(team => {
              const acceptedMembers = team.members?.filter(m => m.status === 'ACCEPTED') ?? [];
              const memberCount = acceptedMembers.length;
              const problem = problemStatements?.find(p => p.id === team.problemStatementId);
              return (
                <div key={team.id} className="bg-white rounded-xl border border-surface-border shadow-card p-5 flex flex-col gap-3">
                  {/* Team name */}
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-ink-primary text-base leading-tight font-display">{team.name}</h4>
                    <span className="shrink-0 flex items-center gap-1 text-xs font-medium text-ink-muted bg-surface-hover px-2.5 py-1 rounded-md">
                      <Users className="w-3.5 h-3.5" />
                      {memberCount} {memberCount === 1 ? 'member' : 'members'}
                    </span>
                  </div>

                  {/* Members list */}
                  <div className="flex flex-col gap-1.5">
                    {acceptedMembers.map(m => (
                      <div key={m.id} className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${m.role === 'LEADER' ? 'bg-brand-100 text-brand-600' : 'bg-surface-hover text-ink-muted'}`}>
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

                  {/* Problem statement */}
                  <div className={`rounded-lg px-3 py-2.5 ${problem ? 'bg-brand-50 border border-brand-100' : 'bg-surface-hover border border-dashed border-surface-border'}`}>
                    {problem ? (
                      <>
                        <p className="text-xs font-semibold text-brand-600 mb-0.5">Selected Problem</p>
                        <p className="text-sm text-ink-secondary leading-snug line-clamp-3">{problem.statement}</p>
                      </>
                    ) : (
                      <p className="text-xs text-ink-muted italic">No problem statement selected yet</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
}
