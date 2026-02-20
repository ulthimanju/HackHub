import { useMemo } from 'react';

/**
 * Centralises all permission checks for EventDetails.
 * Returns a stable object — components destructure what they need.
 */
export function useEventPermissions(eventDetails, user) {
  return useMemo(() => {
    if (!eventDetails || !user) return {};

    const isOrganizer = user.role === 'organizer';
    const isEventOwner = isOrganizer && eventDetails.organizerId === user.id;
    const status = eventDetails.status?.toLowerCase() ?? '';

    const registrationEnded = !['upcoming', 'registration_open'].includes(status);
    const isLocked = ['judging', 'results_announced', 'completed'].includes(status);

    return {
      isOrganizer,
      isEventOwner,
      canAddProblem:      isEventOwner && !registrationEnded,
      canDeleteProblem:   isEventOwner && !registrationEnded,
      canEditProblem:     isEventOwner,
      canFinalizeResults: isEventOwner && status === 'judging',
      canEvaluate:        isEventOwner && status === 'judging',
      canAdvanceStatus:   isEventOwner,
      canManualReview:    isEventOwner,
      isLocked,
      registrationEnded,
    };
  }, [eventDetails, user]);
}
