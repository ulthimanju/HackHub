import React, { useState, useCallback } from 'react';
import { Sparkles, UserPlus, RefreshCw } from 'lucide-react';
import { ALL_SKILLS } from '../../../../constants/skills';
import TagAutocomplete from '../../../common/TagAutocomplete/TagAutocomplete';
import teamService from '../../../../services/teamService';

/**
 * Props:
 *   team        – current team object (with id, skillsNeeded, members)
 *   onInvite    – fn(userId, username, userEmail) triggers invite flow in parent
 *   onSkillsSaved – fn() refresh team after skills update
 */
export default function MatchmakingPanel({ team, onInvite, onSkillsSaved }) {
  const [skills, setSkills] = useState(team.skillsNeeded ?? []);
  const [suggestions, setSuggestions] = useState(null);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [error, setError] = useState('');

  const saveSkills = async () => {
    setLoadingSave(true);
    setError('');
    try {
      await teamService.updateSkillsNeeded(team.id, skills);
      onSkillsSaved?.();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save skills.');
    } finally {
      setLoadingSave(false);
    }
  };

  const findMatches = useCallback(async () => {
    setLoadingSuggest(true);
    setError('');
    setSuggestions(null);
    try {
      const data = await teamService.suggestMembers(team.id);
      setSuggestions(data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to fetch suggestions.');
    } finally {
      setLoadingSuggest(false);
    }
  }, [team.id]);

  const skillsChanged = JSON.stringify(skills) !== JSON.stringify(team.skillsNeeded ?? []);

  return (
    <div className="space-y-5">
      {/* Skills Needed */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-orange-500" />
          <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Skills You're Looking For</h4>
        </div>
        <p className="text-xs text-gray-500">Add skills your team needs — we'll suggest matching participants.</p>

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
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {loadingSave ? 'Saving…' : 'Save Skills'}
            </button>
          )}
          <button
            onClick={findMatches}
            disabled={loadingSuggest || skills.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
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
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {suggestions.length === 0 ? 'No matches found' : `${suggestions.length} matching participant${suggestions.length !== 1 ? 's' : ''}`}
          </p>
          {suggestions.map((u) => {
            const userSkills = (u.skills ?? []).filter(s => skills.includes(s));
            return (
              <div key={u.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 font-bold text-sm flex items-center justify-center uppercase">
                      {(u.displayName || u.username || '?')[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{u.displayName || u.username}</p>
                      <p className="text-xs text-gray-400 truncate">@{u.username}</p>
                    </div>
                  </div>
                  {userSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {userSkills.map(s => (
                        <span key={s} className="text-[10px] bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onInvite(u.id, u.username, u.email)}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Invite
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
