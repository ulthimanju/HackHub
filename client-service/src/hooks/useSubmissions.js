import { useState, useCallback } from 'react';
import teamService from '../services/teamService';
import aiService from '../services/aiService';

export function useSubmissions(eventId, onTeamsRefresh) {
  const [evaluating, setEvaluating]     = useState(false);
  const [evaluateMsg, setEvaluateMsg]   = useState('');
  const [reviewOpen, setReviewOpen]     = useState({});
  const [reviewData, setReviewData]     = useState({});
  const [reviewSaving, setReviewSaving] = useState({});
  const [reviewMsg, setReviewMsg]       = useState({});

  const handleReviewSave = useCallback(async (teamId) => {
    const data = reviewData[teamId] || {};
    setReviewSaving(prev => ({ ...prev, [teamId]: true }));
    setReviewMsg(prev => ({ ...prev, [teamId]: '' }));
    try {
      await teamService.updateManualReview(teamId, {
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
  }, [reviewData, onTeamsRefresh]);

  const handleAiEvaluate = useCallback(async () => {
    setEvaluating(true);
    setEvaluateMsg('');
    try {
      await aiService.evaluateEvent(eventId);
      setEvaluateMsg('AI evaluation started. Refresh to see results.');
      await onTeamsRefresh();
    } catch (e) {
      setEvaluateMsg(e.response?.data?.message || 'AI evaluation failed.');
    } finally {
      setEvaluating(false);
    }
  }, [eventId, onTeamsRefresh]);

  const toggleReviewOpen = useCallback((teamId) => {
    setReviewOpen(prev => ({ ...prev, [teamId]: !prev[teamId] }));
  }, []);

  const updateReviewField = useCallback((teamId, field, value) => {
    setReviewData(prev => ({
      ...prev,
      [teamId]: { ...(prev[teamId] || {}), [field]: value },
    }));
  }, []);

  return {
    evaluating, evaluateMsg,
    reviewOpen, reviewData, reviewSaving, reviewMsg,
    handlers: {
      saveReview: handleReviewSave,
      evaluateAll: handleAiEvaluate,
      toggleReview: toggleReviewOpen,
      updateReviewField,
    },
  };
}
