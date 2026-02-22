import React, { useState } from 'react';
import { Sparkles, UserPlus, RefreshCw } from 'lucide-react';
import { ALL_SKILLS } from '../../../../constants/skills';
import TagAutocomplete from '../../../common/TagAutocomplete/TagAutocomplete';
import Pagination from '../../../common/Pagination/Pagination';
import { useMatchmaking } from '../../../../hooks/useMatchmaking';

const PAGE_SIZE = 8;

/**
 * Props:
 *   team        – current team object (with id, skillsNeeded, members)
 *   onInvite    – fn(userId, username, userEmail) triggers invite flow in parent
 *   onSkillsSaved – fn() refresh team after skills update
 */
export default function MatchmakingPanel({ team, onInvite, onSkillsSaved }) {
  const {
    skills, setSkills, suggestions,
    loadingSuggest, loadingSave, skillsChanged,
    error, saveSkills, findMatches,
  } = useMatchmaking(team, onSkillsSaved);
  const [suggestPage, setSuggestPage] = useState(0);

  // Reset page when suggestions change
  React.useEffect(() => { setSuggestPage(0); }, [suggestions]);

  return (
    <div className="space-y-5">
      {/* Skills Needed */}
      <div className="bg-white rounded-xl border border-surface-border shadow-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-500" />
          <h4 className="text-xs font-medium text-ink-muted uppercase tracking-widest">Skills You're Looking For</h4>
        </div>
        <p className="text-xs text-ink-muted">Add skills your team needs — we'll suggest matching participants.</p>

        <TagAutocomplete
          items={ALL_SKILLS}
          selected={skills}
          onChange={setSkills}
          placeholder="Search skills to add…"
          emptyText="No skills added yet"
        />

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex gap-2">
          {skillsChanged && (
            <button
              onClick={saveSkills}
              disabled={loadingSave}
              className="px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {loadingSave ? 'Saving…' : 'Save Skills'}
            </button>
          )}
          <button
            onClick={findMatches}
            disabled={loadingSuggest || skills.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-ink-primary hover:bg-ink-secondary disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {loadingSuggest
              ? <><RefreshCw className="w-4 h-4 animate-spin" /> Finding…</>
              : <><Sparkles className="w-4 h-4" /> Find Teammates</>
            }
          </button>
        </div>
      </div>

      {/* Suggestions */}
      {suggestions !== null && (
        <div className="space-y-3">
          <p className="text-xs font-medium text-ink-muted uppercase tracking-widest">
            {suggestions.length === 0 ? 'No matches found' : `${suggestions.length} matching participant${suggestions.length !== 1 ? 's' : ''}`}
          </p>
          {suggestions.slice(suggestPage * PAGE_SIZE, (suggestPage + 1) * PAGE_SIZE).map((u) => {
            const userSkills = (u.skills ?? []).filter(s => skills.includes(s));
            return (
              <div key={u.id} className="bg-white rounded-xl border border-surface-border shadow-card p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 font-bold text-sm flex items-center justify-center uppercase">
                      {(u.displayName || u.username || '?')[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink-primary truncate">{u.displayName || u.username}</p>
                      <p className="text-xs text-ink-muted truncate">@{u.username}</p>
                    </div>
                  </div>
                  {userSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {userSkills.map(s => (
                        <span key={s} className="text-xxs bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-md font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onInvite(u.id, u.username, u.email)}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Invite
                </button>
              </div>
            );
          })}
          <Pagination
            page={suggestPage}
            totalPages={Math.ceil(suggestions.length / PAGE_SIZE)}
            onPageChange={setSuggestPage}
            totalItems={suggestions.length}
            pageSize={PAGE_SIZE}
          />
        </div>
      )}
    </div>
  );
}
