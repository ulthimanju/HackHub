import api from './api';

const aiService = {
  evaluateEvent: (eventId) => api.post(`/ai/evaluate-event/${eventId}`),
  evaluateTeam:  (teamId)  => api.post(`/ai/evaluate/${teamId}`),
};

export default aiService;
