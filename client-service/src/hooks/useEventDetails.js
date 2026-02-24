import { useState, useEffect, useCallback } from 'react';
import eventService from '../services/eventService';
import teamService from '../services/teamService';
import { extractErrorMessage } from '../services/api';

/**
 * Loads and manages all state for the EventDetails page.
 * Handles: event data, registrations, organizer teams, participant registration,
 * leaderboard, status advancement, result finalization, and problem statement CRUD.
 *
 * @param {string}  id           - The event ID from the URL.
 * @param {boolean} isOrganizer  - Whether the current user is an organizer.
 * @returns {{
 *   eventDetails: object|null,
 *   loading: boolean,
 *   error: string,
 *   setEventDetails: Function,
 *   registrations: object[],
 *   registrationsLoading: boolean,
 *   registrationsError: string,
 *   updatingId: string|null,
 *   statusUpdateError: string,
 *   myRegistration: object|null,
 *   orgTeams: object[],
 *   orgTeamsLoading: boolean,
 *   orgTeamsError: string,
 *   advancingStatus: boolean,
 *   advanceError: string,
 *   confirmAdvance: object,
 *   setConfirmAdvance: Function,
 *   confirmFinalize: boolean,
 *   setConfirmFinalize: Function,
 *   finalizeError: string,
 *   leaderboardTeams: object[],
 *   leaderboardLoading: boolean,
 *   handlers: {
 *     handleStatusUpdate: (registrationId: string, status: string) => Promise<void>,
 *     refreshTeams: () => Promise<void>,
 *     handleAdvanceConfirm: () => Promise<void>,
 *     handleFinalizeConfirm: () => Promise<void>,
 *     handleUpdateProblem: (problemId: string, data: object) => Promise<void>,
 *     handleDeleteProblem: (problemId: string) => Promise<void>,
 *   },
 * }}
 */
/**
 * @returns {{
 *   ...existing,
 *   handlers: {
 *     ...existing,
 *     handleUpdateEvent: (data: object) => Promise<void>,
 *     handleDeleteEvent: (navigate: Function) => Promise<void>,
 *   },
 * }}
 */
export function useEventDetails(id, isOrganizer) {
  const [eventDetails,          setEventDetails]          = useState(null);
  const [loading,               setLoading]               = useState(true);
  const [error,                 setError]                 = useState('');

  const [registrations,         setRegistrations]         = useState([]);
  const [registrationsLoading,  setRegistrationsLoading]  = useState(false);
  const [registrationsError,    setRegistrationsError]    = useState('');
  const [updatingId,            setUpdatingId]            = useState(null);
  const [statusUpdateError,     setStatusUpdateError]     = useState('');

  const [myRegistration,        setMyRegistration]        = useState(null);

  const [orgTeams,              setOrgTeams]              = useState([]);
  const [orgTeamsLoading,       setOrgTeamsLoading]       = useState(false);
  const [orgTeamsError,         setOrgTeamsError]         = useState('');

  const [advancingStatus,       setAdvancingStatus]       = useState(false);
  const [advanceError,          setAdvanceError]          = useState('');
  const [confirmAdvance,        setConfirmAdvance]        = useState({ open: false, currentLabel: '', nextLabel: '', desc: '' });
  const [confirmFinalize,       setConfirmFinalize]       = useState(false);
  const [finalizeError,         setFinalizeError]         = useState('');

  const [leaderboardTeams,      setLeaderboardTeams]      = useState([]);
  const [leaderboardLoading,    setLeaderboardLoading]    = useState(false);

  // ── Initial data load ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;

    setLoading(true);
    eventService.getEventById(id)
      .then(data => setEventDetails(data))
      .catch(err  => setError(extractErrorMessage(err, 'Failed to fetch event details.')))
      .finally(()  => setLoading(false));

    if (isOrganizer) {
      setRegistrationsLoading(true);
      eventService.getEventRegistrations(id)
        .then(data => setRegistrations(data))
        .catch(err  => setRegistrationsError(extractErrorMessage(err, 'Failed to load participants.')))
        .finally(()  => setRegistrationsLoading(false));

      setOrgTeamsLoading(true);
      teamService.getTeamsByEvent(id)
        .then(data => setOrgTeams(data))
        .catch(err  => setOrgTeamsError(extractErrorMessage(err, 'Failed to load teams.')))
        .finally(()  => setOrgTeamsLoading(false));
    } else {
      eventService.getMyRegistrationStatuses()
        .then(statuses => {
          const reg = statuses.find(r => r.eventId === id);
          if (reg) setMyRegistration(reg);
        })
        .catch(() => {});
    }
  }, [id, isOrganizer]);

  // ── Leaderboard (participant view, once results are public) ───────────────────
  useEffect(() => {
    if (!eventDetails || isOrganizer) return;
    const status = eventDetails.status?.toLowerCase();
    if (['results_announced', 'completed'].includes(status)) {
      setLeaderboardLoading(true);
      teamService.getTeamsByEvent(id)
        .then(data => setLeaderboardTeams(data))
        .catch(() => {})
        .finally(() => setLeaderboardLoading(false));
    }
  }, [eventDetails?.status, id, isOrganizer]);

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleStatusUpdate = useCallback(async (registrationId, status) => {
    setUpdatingId(registrationId);
    setStatusUpdateError('');
    try {
      await eventService.updateRegistrationStatus(registrationId, status);
      setRegistrations(prev => prev.map(r => r.id === registrationId ? { ...r, status } : r));
      if (status === 'REJECTED') {
        teamService.getTeamsByEvent(id).then(data => setOrgTeams(data)).catch(() => {});
      }
    } catch (err) {
      setStatusUpdateError(extractErrorMessage(err, 'Failed to update status.'));
    } finally {
      setUpdatingId(null);
    }
  }, [id]);

  const refreshTeams = useCallback(async () => {
    const data = await teamService.getTeamsByEvent(id);
    setOrgTeams(data);
  }, [id]);

  const handleAdvanceConfirm = useCallback(async () => {
    setAdvancingStatus(true);
    setAdvanceError('');
    try {
      await eventService.advanceEventStatus(id);
      const updated = await eventService.getEventById(id);
      setEventDetails(updated);
      setConfirmAdvance(s => ({ ...s, open: false }));
    } catch (e) {
      setAdvanceError(extractErrorMessage(e, 'Failed to advance status.'));
    } finally {
      setAdvancingStatus(false);
    }
  }, [id]);

  const handleFinalizeConfirm = useCallback(async () => {
    setAdvancingStatus(true);
    setFinalizeError('');
    try {
      await teamService.finalizeResults(id);
      const updated = await eventService.getEventById(id);
      setEventDetails(updated);
      setConfirmFinalize(false);
    } catch (e) {
      setFinalizeError(extractErrorMessage(e, 'Failed to finalize results.'));
    } finally {
      setAdvancingStatus(false);
    }
  }, [id]);

  const handleUpdateProblem = useCallback(async (problemId, data) => {
    await eventService.updateProblemStatement(problemId, data);
    setEventDetails(prev => ({
      ...prev,
      problemStatements: prev.problemStatements.map(p => p.id === problemId ? { ...p, ...data } : p),
    }));
  }, []);

  const handleDeleteProblem = useCallback(async (problemId) => {
    await eventService.deleteProblemStatement(problemId);
    setEventDetails(prev => ({
      ...prev,
      problemStatements: prev.problemStatements.filter(p => p.id !== problemId),
    }));
  }, []);

  const handleUpdateEvent = useCallback(async (data) => {
    const updated = await eventService.updateEvent(id, data);
    // Backend may return the updated object or nothing — merge whichever is available
    setEventDetails(prev => ({ ...prev, ...(updated ?? data) }));
  }, [id]);

  const handleDeleteEvent = useCallback(async (navigate) => {
    await eventService.deleteEvent(id);
    navigate('/');
  }, [id]);

  return {
    eventDetails,
    loading,
    error,
    setEventDetails,
    registrations,
    registrationsLoading,
    registrationsError,
    updatingId,
    statusUpdateError,
    myRegistration,
    orgTeams,
    orgTeamsLoading,
    orgTeamsError,
    advancingStatus,
    advanceError,
    confirmAdvance,
    setConfirmAdvance,
    confirmFinalize,
    setConfirmFinalize,
    finalizeError,
    leaderboardTeams,
    leaderboardLoading,
    handlers: {
      handleStatusUpdate,
      refreshTeams,
      handleAdvanceConfirm,
      handleFinalizeConfirm,
      handleUpdateProblem,
      handleDeleteProblem,
      handleUpdateEvent,
      handleDeleteEvent,
    },
  };
}
