import api from './api';

/**
 * Team service — full lifecycle management for hackathon teams.
 *
 * Covers: creation, membership (join requests, invitations, responses, transfers, leave, dismantle),
 * project submission, problem statement selection, skills/matchmaking, and judging/manual review.
 *
 * Note: several methods accept a `_leaderId` / `_userId` param that is currently unused by the API
 * (auth is enforced server-side via JWT) — kept for call-site clarity.
 */
const teamService = {
  getTeamsByEvent:      (eventId, name, params)    => api.get(`/events/teams/${eventId}`, { params: { ...(name ? { name } : {}), ...params } }).then(r => r?.content ?? r),
  getTeamByShortCode:   (shortCode)               => api.get(`/events/teams/code/${shortCode}`),
  createTeam:           (eventId, data)            => api.post(`/events/teams/${eventId}`, data),
  inviteMember:         (teamId, _leaderId, data)  => api.post(`/events/teams/${teamId}/invite`, data),
  requestToJoin:        (teamId, data)             => api.post(`/events/teams/${teamId}/request`, data),
  respondToInvite:      (teamId, _userId, accept)  => api.patch(`/events/teams/${teamId}/respond`, null, { params: { accept } }),
  dismantleTeam:        (teamId, _leaderId)        => api.delete(`/events/teams/${teamId}`),
  transferLeadership:   (teamId, _cLId, newLeaderId) => api.patch(`/events/teams/${teamId}/transfer`, null, { params: { newLeaderId } }),
  leaveTeam:            (teamId, _userId)          => api.delete(`/events/teams/${teamId}/leave`),
  selectProblemStatement:(teamId, _lId, problemId) => api.patch(`/events/teams/${teamId}/problem-statement`, null, { params: problemId ? { problemId } : {} }),
  submitProject:        (teamId, _userId, data)    => api.post(`/events/teams/${teamId}/submit`, data),
  updateSkillsNeeded:   (teamId, skills)           => api.patch(`/events/teams/${teamId}/skills-needed`, { skills }),
  suggestMembers:       (teamId, params)           => api.get(`/events/matchmaking/suggest-members/${teamId}`, { params }),
  // Judging / results (domain: team scoring)
  updateManualReview:   (teamId, data)             => api.patch(`/events/teams/${teamId}/manual-review`, data),
  finalizeResults:      (eventId)                  => api.patch(`/events/${eventId}/finalize-results`),
};

export default teamService;
