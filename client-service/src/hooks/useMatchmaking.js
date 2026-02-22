import { useState, useCallback } from 'react';
import teamService from '../services/teamService';

export function useMatchmaking(team) {
  const [skills, setSkills]               = useState(team.skillsNeeded ?? []);
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
      setError(e.response?.data?.message || 'Failed to save skills.');
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
      setError(e.response?.data?.message || 'Failed to fetch suggestions.');
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
