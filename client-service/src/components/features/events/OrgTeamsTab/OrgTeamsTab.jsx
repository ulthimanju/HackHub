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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by team name…"
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
        </div>
      ) : error ? (
        <Alert type="error" message={error} />
      ) : teams.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3 text-center">
          <Users className="w-10 h-10 text-gray-300" />
          <p className="font-semibold text-gray-500">No teams formed yet</p>
          <p className="text-sm text-gray-400">Teams will appear here once participants create them.</p>
        </div>
      ) : (() => {
        const filtered = teams.filter(t =>
          !search || t.name?.toLowerCase().includes(search.toLowerCase())
        );
        if (!filtered.length) return (
          <div className="flex flex-col items-center py-12 gap-2 text-center">
            <Search className="w-8 h-8 text-gray-300" />
            <p className="text-sm text-gray-400">No teams match "<span className="font-medium text-gray-600">{search}</span>"</p>
          </div>
        );
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map(team => {
              const acceptedMembers = team.members?.filter(m => m.status === 'ACCEPTED') ?? [];
              const memberCount = acceptedMembers.length;
              const problem = problemStatements?.find(p => p.id === team.problemStatementId);
              return (
                <div key={team.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
                  {/* Team name */}
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-gray-900 text-base leading-tight">{team.name}</h4>
                    <span className="shrink-0 flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                      <Users className="w-3.5 h-3.5" />
                      {memberCount} {memberCount === 1 ? 'member' : 'members'}
                    </span>
                  </div>

                  {/* Members list */}
                  <div className="flex flex-col gap-1.5">
                    {acceptedMembers.map(m => (
                      <div key={m.id} className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${m.role === 'LEADER' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                          {m.username?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <span className="text-sm text-gray-800 font-medium truncate flex-1">{m.username}</span>
                        {m.role === 'LEADER' && (
                          <span className="flex items-center gap-0.5 text-xs font-semibold text-orange-500 shrink-0">
                            <Crown className="w-3 h-3" />
                            Leader
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Problem statement */}
                  <div className={`rounded-xl px-3 py-2.5 ${problem ? 'bg-orange-50 border border-orange-100' : 'bg-gray-50 border border-dashed border-gray-200'}`}>
                    {problem ? (
                      <>
                        <p className="text-xs font-semibold text-orange-600 mb-0.5">Selected Problem</p>
                        <p className="text-sm text-gray-700 leading-snug line-clamp-3">{problem.statement}</p>
                      </>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No problem statement selected yet</p>
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
