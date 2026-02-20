import React, { useState } from 'react';
import { Trophy, ExternalLink, Pencil, ChevronUp, Flag, Save } from 'lucide-react';
import Button from '../../../common/Button/Button';
import eventService from '../../../../services/eventService';
import aiService from '../../../../services/aiService';
import teamService from '../../../../services/teamService';

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
  const [evaluating, setEvaluating]   = useState(false);
  const [evaluateMsg, setEvaluateMsg] = useState('');
  const [reviewOpen, setReviewOpen]   = useState({});
  const [reviewData, setReviewData]   = useState({});
  const [reviewSaving, setReviewSaving] = useState({});
  const [reviewMsg, setReviewMsg]     = useState({});

  const submitted    = [...teams.filter(t => t.repoUrl)].sort((a, b) => {
    const scoreA = a.manualScore ?? a.score ?? -1;
    const scoreB = b.manualScore ?? b.score ?? -1;
    return scoreB - scoreA;
  });
  const notSubmitted = teams.filter(t => !t.repoUrl);
  const status       = eventStatus?.toLowerCase();

  const handleReviewSave = async (teamId) => {
    const data = reviewData[teamId] || {};
    setReviewSaving(prev => ({ ...prev, [teamId]: true }));
    setReviewMsg(prev => ({ ...prev, [teamId]: '' }));
    try {
      await eventService.updateManualReview(teamId, {
        manualScore:    data.manualScore != null ? Number(data.manualScore) : null,
        organizerNotes: data.organizerNotes || null,
      });
      setReviewMsg(prev => ({ ...prev, [teamId]: '✓ Saved' }));
      await onTeamsRefresh();
    } catch {
      setReviewMsg(prev => ({ ...prev, [teamId]: 'Save failed' }));
    } finally {
      setReviewSaving(prev => ({ ...prev, [teamId]: false }));
    }
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
        </div>
      ) : teams.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3 text-center">
          <Trophy className="w-10 h-10 text-gray-300" />
          <p className="font-semibold text-gray-500">No teams yet</p>
          <p className="text-sm text-gray-400">Submissions will appear here once teams submit their projects.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">{submitted.length} submitted</span>
              <span className="text-gray-300">·</span>
              <span className="text-sm text-gray-400">{notSubmitted.length} pending</span>
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
                  onClick={async () => {
                    setEvaluating(true);
                    setEvaluateMsg('');
                    try {
                      await aiService.evaluateEvent(eventId);
                      setEvaluateMsg('✓ Evaluation queued for all teams');
                    } catch (e) {
                      setEvaluateMsg(e.response?.data || 'Evaluation failed');
                    } finally {
                      setEvaluating(false);
                    }
                  }}
                >
                  {evaluating ? 'Queuing…' : 'Evaluate All'}
                </Button>
              )}
            </div>
          </div>

          {submitted.length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-3 text-center">
              <Trophy className="w-10 h-10 text-gray-300" />
              <p className="font-semibold text-gray-500">No submissions yet</p>
              <p className="text-sm text-gray-400">Teams haven't submitted their projects yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {submitted.map((team, idx) => {
                const problem    = problemStatements?.find(p => p.id === team.problemStatementId);
                const aiScore    = team.score;
                const manualScore = team.manualScore;
                const finalScore = manualScore ?? aiScore;
                const hasScore   = finalScore != null;
                const isOpen     = reviewOpen[team.id] || false;
                const rd         = reviewData[team.id] || { manualScore: team.manualScore ?? '', organizerNotes: team.organizerNotes || '' };

                return (
                  <div key={team.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-5 flex flex-col gap-3">
                      {/* Header row */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-400 w-6 text-center">#{idx + 1}</span>
                          <h4 className="font-bold text-gray-900 text-base">{team.name}</h4>
                          {team.shortCode && (
                            <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded-lg">{team.shortCode}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {hasScore ? (
                            <span className={`text-sm font-bold px-3 py-1 rounded-xl ${
                              finalScore >= 80 ? 'bg-green-100 text-green-700' :
                              finalScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                                 'bg-red-100 text-red-600'
                            }`}>
                              {Math.round(finalScore)}/100
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-xl">Not scored</span>
                          )}
                        </div>
                      </div>

                      {/* Score row */}
                      {(aiScore != null || manualScore != null) && (
                        <div className="flex gap-2">
                          {aiScore != null && (
                            <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-lg font-medium">
                              AI: {Math.round(aiScore)}/100
                            </span>
                          )}
                          {manualScore != null && (
                            <span className="text-xs bg-orange-50 text-orange-600 border border-orange-100 px-2.5 py-1 rounded-lg font-medium">
                              Manual: {Math.round(manualScore)}/100 ✓
                            </span>
                          )}
                        </div>
                      )}

                      {/* AI Summary */}
                      {team.aiSummary && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
                          <p className="text-xs font-semibold text-blue-600 mb-0.5">AI Evaluation</p>
                          <p className="text-sm text-gray-700 leading-snug">{team.aiSummary}</p>
                        </div>
                      )}

                      {/* Organizer notes if set and panel closed */}
                      {team.organizerNotes && !isOpen && (
                        <div className="bg-orange-50 border border-orange-100 rounded-xl px-3 py-2.5">
                          <p className="text-xs font-semibold text-orange-600 mb-0.5">Organizer Notes</p>
                          <p className="text-sm text-gray-700 leading-snug">{team.organizerNotes}</p>
                        </div>
                      )}

                      {/* Problem */}
                      <div className={`rounded-xl px-3 py-2.5 ${problem ? 'bg-orange-50 border border-orange-100' : 'bg-gray-50 border border-dashed border-gray-200'}`}>
                        {problem ? (
                          <>
                            <p className="text-xs font-semibold text-orange-600 mb-0.5">Problem Statement</p>
                            <p className="text-sm font-medium text-gray-800">{problem.name}</p>
                          </>
                        ) : (
                          <p className="text-xs text-gray-400 italic">No problem selected</p>
                        )}
                      </div>

                      {/* Links */}
                      <a href={team.repoUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium underline underline-offset-2 break-all">
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        {team.repoUrl}
                      </a>
                      {team.demoUrl && (
                        <a href={team.demoUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2 break-all">
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          Demo: {team.demoUrl}
                        </a>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        {team.submissionTime && (
                          <p className="text-xs text-gray-400">Submitted {new Date(team.submissionTime).toLocaleString()}</p>
                        )}
                        {permissions.canManualReview && (
                          <button
                            onClick={() => setReviewOpen(prev => ({ ...prev, [team.id]: !isOpen }))}
                            className="ml-auto flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700 transition-colors"
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
                      <div className="border-t border-gray-100 bg-orange-50/40 px-5 py-4 space-y-3">
                        <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Manual Review</p>
                        <div className="flex gap-3">
                          <div className="w-28">
                            <label className="text-xs text-gray-500 block mb-1">Score (0–100)</label>
                            <input
                              type="number" min={0} max={100}
                              value={rd.manualScore}
                              onChange={e => setReviewData(prev => ({ ...prev, [team.id]: { ...rd, manualScore: e.target.value } }))}
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
                              placeholder="e.g. 85"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-xs text-gray-500 block mb-1">Notes</label>
                            <textarea
                              rows={2}
                              value={rd.organizerNotes}
                              onChange={e => setReviewData(prev => ({ ...prev, [team.id]: { ...rd, organizerNotes: e.target.value } }))}
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white resize-none"
                              placeholder="Add notes for this team…"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button size="sm" icon={Save} disabled={reviewSaving[team.id]} onClick={() => handleReviewSave(team.id)}>
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
        </>
      )}
    </div>
  );
}
