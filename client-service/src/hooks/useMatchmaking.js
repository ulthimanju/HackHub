import { useState, useCallback } from 'react';
import teamService from '../services/teamService';
import { extractErrorMessage } from '../services/api';

/**
 * Manages matchmaking state for a team — skill-tag editing and AI member suggestions.
 *
 * @param {{ id: string, skillsNeeded: string[] }} team - The team object to manage skills for.
 * @returns {{
 *   skills: string[],
 *   setSkills: Function,
 *   suggestions: object[]|null,
 *   loadingSuggest: boolean,
 *   loadingSave: boolean,
 *   skillsChanged: boolean,
 *   error: string,
 *   saveSkills: (onSaved?: Function) => Promise<void>,
 *   findMatches: () => Promise<void>,
 * }}
 */
export function useMatchmaking(team) {
  const [skills, setSkills]= useState(team.skillsNeeded ?? []);
  const [suggestions, setSuggestions]     = useState(null);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [loadingSave, setLoadingSave]     = useState(false);
  const [error, setError]                 = useState('');

  const saveSkills = useCallback(async (onSaved) => {
    setLoadingSave(true);
    setError('');
    try {
      await teamService.updateSkillsNeeded(team.id, skills);
      onSaved?.();
    } catch (e) {
      setError(extractErrorMessage(e, 'Failed to save skills.'));
    } finally {
      setLoadingSave(false);
    }
  }, [team.id, skills]);

  const findMatches = useCallback(async () => {
    setLoadingSuggest(true);
    setError('');
    setSuggestions(null);
    try {
      const data = await teamService.suggestMembers(team.id);
      setSuggestions(data);
    } catch (e) {
      setError(extractErrorMessage(e, 'Failed to fetch suggestions.'));
    } finally {
      setLoadingSuggest(false);
    }
  }, [team.id]);

  const skillsChanged = JSON.stringify(skills) !== JSON.stringify(team.skillsNeeded ?? []);

  return {
    skills, setSkills,
    suggestions,
    loadingSuggest, loadingSave,
    skillsChanged, error,
    saveSkills, findMatches,
  };
}
