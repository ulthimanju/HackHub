import React, { memo, useMemo } from 'react';
import { Trophy, ExternalLink } from 'lucide-react';

const medals = ['🥇', '🥈', '🥉'];

const LeaderboardTab = memo(function LeaderboardTab({ eventStatus, teams, loading, problemStatements }) {
  const status = eventStatus?.toLowerCase();

  const ranked = useMemo(() => {
    if (!teams) return [];
    return [...teams]
      .map(t => ({ ...t, finalScore: t.manualScore ?? t.score }))
      .filter(t => t.finalScore != null)
      .sort((a, b) => b.finalScore - a.finalScore);
  }, [teams]);

  if (!['results_announced', 'completed'].includes(status)) {
    return (
      <div className="flex flex-col items-center py-16 gap-3 text-center">
        <Trophy className="w-10 h-10 text-gray-300" />
        <p className="font-semibold text-gray-500">Results not yet available</p>
        <p className="text-sm text-gray-400">The leaderboard will be visible once results are announced.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (ranked.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 gap-3 text-center">
        <Trophy className="w-10 h-10 text-gray-300" />
        <p className="font-semibold text-gray-500">No scored submissions yet</p>
        <p className="text-sm text-gray-400">Teams with evaluated scores will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {ranked.map((team, idx) => {
        const problem  = problemStatements?.find(p => p.id === team.problemStatementId);
        const accepted = team.members?.filter(m => m.status === 'ACCEPTED') ?? [];
        const borderClass = idx === 0
          ? 'border-yellow-300 ring-2 ring-yellow-100'
          : idx === 1 ? 'border-gray-300'
          : idx === 2 ? 'border-orange-200'
          : 'border-gray-100';
        const iconBg = idx === 0 ? 'bg-yellow-50' : idx === 1 ? 'bg-gray-100' : idx === 2 ? 'bg-orange-50' : 'bg-gray-50';

        return (
          <div key={team.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${borderClass}`}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${iconBg}`}>
                {medals[idx] || `#${idx + 1}`}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-gray-900 text-lg leading-tight">{team.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {accepted.map(m => (
                        <span key={m.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{m.username}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-black text-orange-600">{Number(team.finalScore).toFixed(1)}</p>
                    <p className="text-xs text-gray-400">/ 100</p>
                  </div>
                </div>
                {problem && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                    <span className="font-semibold text-gray-700">{problem.name}:</span> {problem.statement}
                  </p>
                )}
                {team.repoUrl && (
                  <a href={team.repoUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-2">
                    <ExternalLink className="w-3 h-3" /> View Project
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

LeaderboardTab.displayName = 'LeaderboardTab';
export default LeaderboardTab;
