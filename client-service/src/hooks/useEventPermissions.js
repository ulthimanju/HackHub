import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { useAbility } from './useAbility';
import { getPhasePolicy } from '../constants/eventPhases';

/**
 * Centralises all permission checks for EventDetails.
 * Reads phase capabilities from the PHASE_POLICY matrix in eventPhases.js,
 * then combines them with role/ownership checks.
 *
 * Gets user context internally — no need to pass user as a prop.
 * Returns a stable object — components destructure what they need.
 */
export function useEventPermissions(eventDetails) {
  const { user } = useAuth();
  const { isOrganizer } = useAbility();

  return useMemo(() => {
    if (!eventDetails || !user) return {};

    const isEventOwner = isOrganizer && eventDetails.organizerId === user.id;
    const policy = getPhasePolicy(eventDetails.status);

    return {
      isOrganizer,
      isEventOwner,

      // ── Organizer-gated (phase policy + ownership) ──────────────────────
      canEditEvent:           isEventOwner && policy.canEditEvent,
      canAddProblem:          isEventOwner && policy.canManageProblems,
      canDeleteProblem:       isEventOwner && policy.canManageProblems,
      canEditProblem:         isEventOwner && !policy.areProblemsLocked,
      canManageRegistrations: isEventOwner && policy.canManageRegistrations,
      canFinalizeResults:     isEventOwner && policy.canFinalize,
      canEvaluate:            isEventOwner && policy.canEvaluate,
      canManualReview:        isEventOwner && policy.canManualReview,
      canAdvanceStatus:       isEventOwner && policy.canAdvanceStatus,

      // ── Participant-gated (phase policy + non-organizer) ─────────────────
      canRegister:            !isOrganizer && policy.canRegister,
      canCreateTeam:          !isOrganizer && policy.canCreateTeam,
      canJoinTeam:            !isOrganizer && policy.canJoinTeam,
      canEditTeamRoster:      !isOrganizer && policy.canEditTeamRoster,
      canSubmit:              !isOrganizer && policy.canSubmit,

      // ── Phase state flags (role-agnostic) ────────────────────────────────
      isReadOnly:             policy.isReadOnly,
      isLeaderboardPublic:    policy.isLeaderboardPublic,
      areSubmissionsLocked:   policy.areSubmissionsLocked,
      areProblemsLocked:      policy.areProblemsLocked,
      areTeamsLocked:         policy.areTeamsLocked,

      // Backward-compat aliases used by existing components
      isLocked:           policy.areTeamsLocked,
      registrationEnded:  !policy.canRegister,
    };
  }, [eventDetails, user, isOrganizer]);
}
