import React, { useState, useCallback } from 'react';
import { Sparkles, UserPlus, Search, X, RefreshCw } from 'lucide-react';
import { ALL_SKILLS } from '../../../../constants/skills';
import teamService from '../../../../services/teamService';

/**
 * Props:
 *   team        – current team object (with id, skillsNeeded, members)
 *   onInvite    – fn(userId, username, userEmail) triggers invite flow in parent
 *   onSkillsSaved – fn() refresh team after skills update
 */
export default function MatchmakingPanel({ team, onInvite, onSkillsSaved }) {
  const [skills, setSkills] = useState(team.skillsNeeded ?? []);
  const [skillInput, setSkillInput] = useState('');
  const [suggestions, setSuggestions] = useState(null); // null = not fetched
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [error, setError] = useState('');

  const filteredOptions = skillInput.trim()
    ? ALL_SKILLS.filter(
        s => s.toLowerCase().includes(skillInput.toLowerCase()) && !skills.includes(s)
      ).slice(0, 8)
    : [];

  const addSkill = (s) => {
    if (!skills.includes(s)) setSkills(prev => [...prev, s]);
    setSkillInput('');
  };

  const removeSkill = (s) => setSkills(prev => prev.filter(x => x !== s));

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

        {/* Skill chips */}
        <div className="flex flex-wrap gap-2 min-h-[36px]">
          {skills.map(s => (
            <span key={s} className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 border border-orange-100 px-3 py-1 rounded-full text-xs font-semibold">
              {s}
              <button onClick={() => removeSkill(s)} className="hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {skills.length === 0 && <span className="text-xs text-gray-400 italic">No skills added yet</span>}
        </div>

        {/* Autocomplete input */}
        <div className="relative">
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-orange-300 focus-within:border-orange-400">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              className="flex-1 text-sm outline-none placeholder-gray-400"
              placeholder="Search skills to add…"
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
            />
          </div>
          {filteredOptions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
              {filteredOptions.map(s => (
                <button key={s} onClick={() => addSkill(s)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

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
