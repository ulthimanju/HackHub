import React, { useState } from 'react';
import { Trophy, ExternalLink, Pencil, ChevronUp, Flag, Save } from 'lucide-react';
import Button from '../../../common/Button/Button';
import Pagination from '../../../common/Pagination/Pagination';
import { useSubmissions } from '../../../../hooks/useSubmissions';

const PAGE_SIZE = 10;

/**
 * Props:
 *   teams            – orgTeams array
 *   loading          – boolean
 *   eventStatus      – string (eventDetails.status)
 *   eventId          – string
 *   problemStatements – eventDetails.problemStatements array
 *   permissions      – from useEventPermissions
 *   onTeamsRefresh   – async () => void  (parent re-fetches teams)
 *   onFinalizeClick  – () => void        (opens FinalizeResultsModal in parent)
 */
export default function SubmissionsTab({ teams, loading, eventStatus, eventId, problemStatements, permissions, onTeamsRefresh, onFinalizeClick }) {
  const {
    evaluating, evaluateMsg,
    reviewOpen, reviewData, reviewSaving, reviewMsg,
    handlers,
  } = useSubmissions(eventId, onTeamsRefresh);

  const [localReviewData, setLocalReviewData] = useState({});
  const [page, setPage] = useState(0);

  const submitted    = [...teams.filter(t => t.repoUrl)].sort((a, b) => {
    const scoreA = a.manualScore ?? a.score ?? -1;
    const scoreB = b.manualScore ?? b.score ?? -1;
    return scoreB - scoreA;
  });
  const notSubmitted = teams.filter(t => !t.repoUrl);

  const totalPages = Math.ceil(submitted.length / PAGE_SIZE);
  const paginatedSubmitted = submitted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      ) : teams.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3 text-center">
          <Trophy className="w-9 h-9 text-ink-disabled" />
          <p className="font-medium text-ink-muted">No teams yet</p>
          <p className="text-sm text-ink-muted">Submissions will appear here once teams submit their projects.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-ink-primary">{submitted.length} submitted</span>
              <span className="text-ink-disabled">·</span>
              <span className="text-sm text-ink-muted">{notSubmitted.length} pending</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {permissions.canFinalizeResults && (
                <Button size="sm" variant="outline" icon={Flag} onClick={onFinalizeClick}>
                  Finalize Results
                </Button>
              )}
              {evaluateMsg && (
                <span className={`text-xs font-medium ${evaluateMsg.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>
                  {evaluateMsg}
                </span>
              )}
              {permissions.canEvaluate && (
                <Button
                  size="sm"
                  disabled={evaluating || submitted.length === 0}
                  onClick={handlers.evaluateAll}
                >
                  {evaluating ? 'Queuing…' : 'Evaluate All'}
                </Button>
              )}
            </div>
          </div>

          {submitted.length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-3 text-center">
              <Trophy className="w-9 h-9 text-ink-disabled" />
              <p className="font-medium text-ink-muted">No submissions yet</p>
              <p className="text-sm text-ink-muted">Teams haven't submitted their projects yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedSubmitted.map((team, idx) => {
                const globalIdx = page * PAGE_SIZE + idx;
                const problem    = problemStatements?.find(p => p.id === team.problemStatementId);
                const aiScore    = team.score;
                const manualScore = team.manualScore;
                const finalScore = manualScore ?? aiScore;
                const hasScore   = finalScore != null;
                const isOpen     = reviewOpen[team.id] || false;
                const rd         = localReviewData[team.id] || { manualScore: team.manualScore ?? '', organizerNotes: team.organizerNotes || '' };

                return (
                  <div key={team.id} className="bg-white rounded-xl border border-surface-border shadow-card overflow-hidden">
                    <div className="p-5 flex flex-col gap-3">
                      {/* Header row */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-ink-muted w-6 text-center">#{globalIdx + 1}</span>
                          <h4 className="font-semibold text-ink-primary font-display">{team.name}</h4>
                          {team.shortCode && (
                            <span className="text-xs font-mono text-ink-muted bg-surface-hover px-2 py-0.5 rounded-md">{team.shortCode}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {hasScore ? (
                            <span className={`text-sm font-semibold px-3 py-1 rounded-lg font-display ${
                              finalScore >= 80 ? 'bg-green-50 text-green-700' :
                              finalScore >= 60 ? 'bg-amber-50 text-amber-700' :
                                                 'bg-red-50 text-red-600'
                            }`}>
                              {Math.round(finalScore)}/100
                            </span>
                          ) : (
                            <span className="text-xs text-ink-muted bg-surface-hover px-2.5 py-1 rounded-md">Not scored</span>
                          )}
                        </div>
                      </div>

                      {/* Score row */}
                      {(aiScore != null || manualScore != null) && (
                        <div className="flex gap-2">
                          {aiScore != null && (
                            <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-md font-medium">
                              AI: {Math.round(aiScore)}/100
                            </span>
                          )}
                          {manualScore != null && (
                            <span className="text-xs bg-brand-50 text-brand-600 border border-brand-100 px-2.5 py-1 rounded-md font-medium">
                              Manual: {Math.round(manualScore)}/100 ✓
                            </span>
                          )}
                        </div>
                      )}

                      {/* AI Summary */}
                      {team.aiSummary && (
                        <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5">
                          <p className="text-xs font-medium text-blue-600 mb-0.5">AI Evaluation</p>
                          <p className="text-sm text-ink-secondary leading-snug">{team.aiSummary}</p>
                        </div>
                      )}

                      {/* Organizer notes if set and panel closed */}
                      {team.organizerNotes && !isOpen && (
                        <div className="bg-brand-50 border border-brand-100 rounded-lg px-3 py-2.5">
                          <p className="text-xs font-medium text-brand-600 mb-0.5">Organizer Notes</p>
                          <p className="text-sm text-ink-secondary leading-snug">{team.organizerNotes}</p>
                        </div>
                      )}

                      {/* Problem */}
                      <div className={`rounded-lg px-3 py-2.5 ${problem ? 'bg-brand-50 border border-brand-100' : 'bg-surface-hover border border-dashed border-surface-border'}`}>
                        {problem ? (
                          <>
                            <p className="text-xs font-medium text-brand-600 mb-0.5">Problem Statement</p>
                            <p className="text-sm font-medium text-ink-primary">{problem.name}</p>
                          </>
                        ) : (
                          <p className="text-xs text-ink-muted italic">No problem selected</p>
                        )}
                      </div>

                      {/* Links */}
                      <a href={team.repoUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium underline underline-offset-2 break-all">
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        {team.repoUrl}
                      </a>
                      {team.demoUrl && (
                        <a href={team.demoUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-ink-secondary hover:text-ink-primary underline underline-offset-2 break-all">
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          Demo: {team.demoUrl}
                        </a>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        {team.submissionTime && (
                          <p className="text-xs text-ink-muted">Submitted {new Date(team.submissionTime).toLocaleString()}</p>
                        )}
                        {permissions.canManualReview && (
                          <button
                            onClick={() => handlers.toggleReview(team.id)}
                            className="ml-auto flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors"
                          >
                            {isOpen
                              ? <><ChevronUp className="w-3.5 h-3.5" /> Close Review</>
                              : <><Pencil className="w-3.5 h-3.5" /> Manual Review</>}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Manual review panel */}
                    {isOpen && (
                      <div className="border-t border-surface-border bg-brand-50/40 px-5 py-4 space-y-3">
                        <p className="text-xs font-medium text-brand-700 uppercase tracking-widest">Manual Review</p>
                        <div className="flex gap-3">
                          <div className="w-28">
                            <label className="text-xs text-ink-muted block mb-1">Score (0–100)</label>
                            <input
                              type="number" min={0} max={100}
                              value={rd.manualScore}
                              onChange={e => setLocalReviewData(prev => ({ ...prev, [team.id]: { ...rd, manualScore: e.target.value } }))}
                              className="w-full px-3 py-2 rounded-lg border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 bg-white"
                              placeholder="e.g. 85"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-xs text-ink-muted block mb-1">Notes</label>
                            <textarea
                              rows={2}
                              value={rd.organizerNotes}
                              onChange={e => setLocalReviewData(prev => ({ ...prev, [team.id]: { ...rd, organizerNotes: e.target.value } }))}
                              className="w-full px-3 py-2 rounded-lg border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 bg-white resize-none"
                              placeholder="Add notes for this team…"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button size="sm" icon={Save} disabled={reviewSaving[team.id]}
                            onClick={() => handlers.saveReview(team.id, rd)}>
                            {reviewSaving[team.id] ? 'Saving…' : 'Save Review'}
                          </Button>
                          {reviewMsg[team.id] && (
                            <span className={`text-xs font-medium ${reviewMsg[team.id].startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>
                              {reviewMsg[team.id]}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={submitted.length}
            pageSize={PAGE_SIZE}
          />
        </>
      )}
    </div>
  );
}
