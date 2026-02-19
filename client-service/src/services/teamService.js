import api from './api';

const teamService = {
  getTeamsByEvent: async (eventId, name) => {
    const response = await api.get(`/events/teams/${eventId}`, {
      params: name ? { name } : undefined,
    });
    return response.data;
  },

  getTeamByShortCode: async (shortCode) => {
    const response = await api.get(`/events/teams/code/${shortCode}`);
    return response.data;
  },

  createTeam: async (eventId, data) => {
    const response = await api.post(`/events/teams/${eventId}`, data);
    return response.data;
  },

  inviteMember: async (teamId, leaderId, data) => {
    const response = await api.post(`/events/teams/${teamId}/invite`, data, {
      params: { leaderId },
    });
    return response.data;
  },

  requestToJoin: async (teamId, data) => {
    const response = await api.post(`/events/teams/${teamId}/request`, data);
    return response.data;
  },

  respondToInvite: async (teamId, userId, accept) => {
    const response = await api.patch(`/events/teams/${teamId}/respond`, null, {
      params: { userId, accept },
    });
    return response.data;
  },

  dismantleTeam: async (teamId, leaderId) => {
    const response = await api.delete(`/events/teams/${teamId}`, {
      params: { leaderId },
    });
    return response.data;
  },

  transferLeadership: async (teamId, currentLeaderId, newLeaderId) => {
    const response = await api.patch(`/events/teams/${teamId}/transfer`, null, {
      params: { currentLeaderId, newLeaderId },
    });
    return response.data;
  },

  leaveTeam: async (teamId, userId) => {
    const response = await api.delete(`/events/teams/${teamId}/leave`, {
      params: { userId },
    });
    return response.data;
  },

  selectProblemStatement: async (teamId, leaderId, problemId) => {
    const response = await api.patch(`/events/teams/${teamId}/problem-statement`, null, {
      params: { leaderId, ...(problemId ? { problemId } : {}) },
    });
    return response.data;
  },

  submitProject: async (teamId, userId, data) => {
    const response = await api.post(`/events/teams/${teamId}/submit`, data, {
      params: { userId },
    });
    return response.data;
  },
};

export default teamService;
