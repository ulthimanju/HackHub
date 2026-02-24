import api from './api';

/**
 * AI evaluation service.
 * Triggers server-side AI scoring for an entire event or a single team submission.
 */
const aiService = {
  evaluateEvent: (eventId) => api.post(`/ai/evaluate-event/${eventId}`),
  evaluateTeam:  (teamId)  => api.post(`/ai/evaluate/${teamId}`),
};

export default aiService;
