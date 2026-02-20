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

  inviteMember: async (teamId, _leaderId, data) => {
    const response = await api.post(`/events/teams/${teamId}/invite`, data);
    return response.data;
  },

  requestToJoin: async (teamId, data) => {
    const response = await api.post(`/events/teams/${teamId}/request`, data);
    return response.data;
  },

  respondToInvite: async (teamId, _userId, accept) => {
    const response = await api.patch(`/events/teams/${teamId}/respond`, null, {
      params: { accept },
    });
    return response.data;
  },

  dismantleTeam: async (teamId, _leaderId) => {
    const response = await api.delete(`/events/teams/${teamId}`);
    return response.data;
  },

  transferLeadership: async (teamId, _currentLeaderId, newLeaderId) => {
    const response = await api.patch(`/events/teams/${teamId}/transfer`, null, {
      params: { newLeaderId },
    });
    return response.data;
  },

  leaveTeam: async (teamId, _userId) => {
    const response = await api.delete(`/events/teams/${teamId}/leave`);
    return response.data;
  },

  selectProblemStatement: async (teamId, _leaderId, problemId) => {
    const response = await api.patch(`/events/teams/${teamId}/problem-statement`, null, {
      params: problemId ? { problemId } : {},
    });
    return response.data;
  },

  submitProject: async (teamId, _userId, data) => {
    const response = await api.post(`/events/teams/${teamId}/submit`, data);
    return response.data;
  },
};

export default teamService;
