import { useState, useCallback } from 'react';
import teamService from '../services/teamService';
import { extractErrorMessage } from '../services/api';

/**
 * Full team lifecycle management for an event's TeamTab.
 * Loads teams for the event and exposes all team actions (create, join, leave, submit, etc.)
 * with shared loading/error state via the internal `withAction` helper.
 *
 * @param {string} eventId - The event to manage teams for.
 * @param {{ id: string, username: string, email: string }} user - The authenticated user.
 * @returns {{
 *   teams: object[],
 *   loading: boolean,
 *   error: string,
 *   actionLoading: string,
 *   actionError: string,
 *   fetchTeams: () => Promise<void>,
 *   handlers: {
 *     createTeam: (name: string) => Promise<void>,
 *     requestToJoin: (teamId: string) => Promise<void>,
 *     respondToInvite: (teamId: string, targetUserId: string, accept: boolean) => Promise<void>,
 *     leaveTeam: (teamId: string) => Promise<void>,
 *     dismantleTeam: (teamId: string) => Promise<void>,
 *     inviteMember: (teamId: string, payload: object) => Promise<void>,
 *     submitProject: (teamId: string, payload: object) => Promise<void>,
 *     selectProblemStatement: (teamId: string, problemId: string|null) => Promise<void>,
 *     transferLeadership: (teamId: string, newLeaderId: string) => Promise<void>,
 *   },
 * }}
 */
export function useTeamTab(eventId, user) {
  const [teams, setTeams]= useState([]);
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
      setError(extractErrorMessage(err, 'Failed to load teams.'));
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
      setActionError(extractErrorMessage(err, 'Action failed.'));
    } finally {
      setActionLoading('');
    }
  }, [fetchTeams]);

  const createTeam = (name) => withAction('create', () =>
    teamService.createTeam(eventId, {
      name,
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

  const respondToJoinRequest = (teamId, requestingUserId, accept) =>
    withAction(`rsp-${requestingUserId}`, () =>
      teamService.respondToJoinRequest(teamId, requestingUserId, accept)
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
      createTeam, requestToJoin, respondToInvite, respondToJoinRequest,
      leaveTeam, dismantleTeam, inviteMember,
      submitProject, selectProblemStatement, transferLeadership,
    },
  };
}
