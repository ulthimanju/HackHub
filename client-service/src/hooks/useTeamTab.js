import { useState, useCallback } from 'react';
import teamService from '../services/teamService';

export function useTeamTab(eventId, user) {
  const [teams, setTeams]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [actionError, setActionError] = useState('');

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await teamService.getTeamsByEvent(eventId);
      setTeams(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load teams.');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  const withAction = useCallback(async (key, fn) => {
    setActionLoading(key);
    setActionError('');
    try {
      await fn();
      await fetchTeams();
    } catch (err) {
      setActionError(err.response?.data?.message || err.response?.data || 'Action failed.');
    } finally {
      setActionLoading('');
    }
  }, [fetchTeams]);

  const createTeam = (name) => withAction('create', () =>
    teamService.createTeam(eventId, {
      name,
      userId:    user.id,
      username:  user.username,
      userEmail: user.email,
    })
  );

  const requestToJoin = (teamId) => withAction(`req-${teamId}`, () =>
    teamService.requestToJoin(teamId, {
      userId:    user.id,
      username:  user.username,
      userEmail: user.email,
    })
  );

  const respondToInvite = (teamId, targetUserId, accept) =>
    withAction(`rsp-${targetUserId}`, () =>
      teamService.respondToInvite(teamId, targetUserId, accept)
    );

  const leaveTeam = (teamId) => withAction('leave', () =>
    teamService.leaveTeam(teamId, user.id)
  );

  const dismantleTeam = (teamId) => withAction('dismantle', () =>
    teamService.dismantleTeam(teamId, user.id)
  );

  const inviteMember = (teamId, payload) => withAction('invite', () =>
    teamService.inviteMember(teamId, user.id, payload)
  );

  const submitProject = (teamId, payload) => withAction('submit', () =>
    teamService.submitProject(teamId, user.id, payload)
  );

  const selectProblemStatement = (teamId, problemId) => withAction('problem', () =>
    teamService.selectProblemStatement(teamId, user.id, problemId || null)
  );

  const transferLeadership = (teamId, newLeaderId) => withAction('transfer', () =>
    teamService.transferLeadership(teamId, user.id, newLeaderId)
  );

  return {
    teams, loading, error,
    actionLoading, actionError,
    fetchTeams,
    handlers: {
      createTeam, requestToJoin, respondToInvite,
      leaveTeam, dismantleTeam, inviteMember,
      submitProject, selectProblemStatement, transferLeadership,
    },
  };
}
