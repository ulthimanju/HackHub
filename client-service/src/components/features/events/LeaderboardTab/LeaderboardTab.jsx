import React, { memo, useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import Pagination from '../../../common/Pagination/Pagination';
import { sanitizeUrl } from '../../../../utils/sanitizeUrl';

const medals = ['🥇', '🥈', '🥉'];
const PAGE_SIZE = 10;

const LeaderboardTab = memo(function LeaderboardTab({ eventStatus, teams, loading, problemStatements }) {
  const status = eventStatus?.toLowerCase();
  const [page, setPage] = useState(0);

  const ranked = useMemo(() => {
    if (!teams) return [];
    return [...teams]
      .map(t => ({ ...t, finalScore: t.manualScore ?? t.score }))
      .filter(t => t.finalScore != null)
      .sort((a, b) => b.finalScore - a.finalScore);
  }, [teams]);

  if (!['results_announced', 'completed'].includes(status)) {
    return (
      <div className="flex flex-col items-center py-12 gap-3 text-center">
        <img
          src="https://illustrations.popsy.co/amber/success.svg"
          alt=""
          className="w-44 h-44 object-contain"
          onError={e => { e.target.style.display = 'none'; }}
        />
        <p className="font-semibold text-ink-muted">Results not yet available</p>
        <p className="text-sm text-ink-muted">The leaderboard will be visible once results are announced.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (ranked.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 gap-3 text-center">
        <img
          src="https://illustrations.popsy.co/amber/keynote-presentation.svg"
          alt=""
          className="w-44 h-44 object-contain"
          onError={e => { e.target.style.display = 'none'; }}
        />
        <p className="font-semibold text-ink-muted">No scored submissions yet</p>
        <p className="text-sm text-ink-muted">Teams with evaluated scores will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {ranked.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((team, idx) => {
        const globalIdx = page * PAGE_SIZE + idx;
        const problem  = problemStatements?.find(p => p.id === team.problemStatementId);
        const accepted = team.members?.filter(m => m.status === 'ACCEPTED') ?? [];
        const borderClass = globalIdx === 0
          ? 'border-yellow-300 ring-2 ring-yellow-100'
          : globalIdx === 1 ? 'border-surface-border'
          : globalIdx === 2 ? 'border-brand-200'
          : 'border-surface-border';
        const iconBg = globalIdx === 0 ? 'bg-yellow-50' : globalIdx === 1 ? 'bg-surface-hover' : globalIdx === 2 ? 'bg-brand-50' : 'bg-surface-hover';

        return (
          <div key={team.id} className={`bg-white rounded-xl border shadow-card p-5 ${borderClass}`}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${iconBg}`}>
                {medals[globalIdx] || `#${globalIdx + 1}`}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-ink-primary text-base leading-tight font-display">{team.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {accepted.map(m => (
                        <span key={m.id} className="text-xs bg-surface-hover text-ink-secondary px-2 py-0.5 rounded-md">{m.username}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-bold text-brand-600 font-display">{Number(team.finalScore).toFixed(1)}</p>
                    <p className="text-xs text-ink-muted">/ 100</p>
                  </div>
                </div>
                {problem && (
                  <p className="text-xs text-ink-muted mt-2 line-clamp-2">
                    <span className="font-semibold text-ink-secondary">{problem.name}:</span> {problem.statement}
                  </p>
                )}
                {team.repoUrl && (
                  <a href={sanitizeUrl(team.repoUrl)} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-2">
                    <ExternalLink className="w-3 h-3" /> View Project
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })}
      <Pagination
        page={page}
        totalPages={Math.ceil(ranked.length / PAGE_SIZE)}
        onPageChange={setPage}
        totalItems={ranked.length}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
});

LeaderboardTab.displayName = 'LeaderboardTab';
export default LeaderboardTab;
