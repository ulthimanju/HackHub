import { useAuth } from './useAuth';

/**
 * Central authorization policy hook.
 * Translates raw user roles into specific functional abilities.
 * Update this one file to change what each role can do across the entire app.
 */
export function useAbility() {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase();

  return {
    // Role identity
    isOrganizer:   role === 'organizer',
    isParticipant: role === 'participant',

    // Functional abilities
    canCreateEvent:   role === 'organizer',
    canManageEvent:   (ownerId) => role === 'organizer' && user?.id === ownerId,
    canEvaluateEvent: role === 'organizer',
    canJoinTeam:      role === 'participant',

    // Generic helper used by Guard component
    isRole: (roles) => !!role && roles.map((r) => r.toLowerCase()).includes(role),
  };
}
