/**
 * eventPhases.js — Single Source of Truth for Event Phase Policy
 *
 * Defines per-phase capabilities, metadata, and helpers used throughout
 * the application to determine what is allowed in each event phase.
 *
 * Usage:
 *   import { getPhasePolicy, STATUS_ORDER, STATUS_META, ADVANCE_INFO } from '@/constants/eventPhases';
 *   const policy = getPhasePolicy(event.status);
 *   if (policy.canSubmit) { ... }
 */

// ─── Status Constants ─────────────────────────────────────────────────────────

export const EVENT_STATUSES = /** @type {const} */ ({
  UPCOMING:           'UPCOMING',
  REGISTRATION_OPEN:  'REGISTRATION_OPEN',
  ONGOING:            'ONGOING',
  JUDGING:            'JUDGING',
  RESULTS_ANNOUNCED:  'RESULTS_ANNOUNCED',
  COMPLETED:          'COMPLETED',
});

/** Ordered list of statuses used for timeline / journey rendering. */
export const STATUS_ORDER = [
  EVENT_STATUSES.UPCOMING,
  EVENT_STATUSES.REGISTRATION_OPEN,
  EVENT_STATUSES.ONGOING,
  EVENT_STATUSES.JUDGING,
  EVENT_STATUSES.RESULTS_ANNOUNCED,
  EVENT_STATUSES.COMPLETED,
];

// ─── Display Metadata ─────────────────────────────────────────────────────────

/**
 * Display metadata for each status.
 * shortLabel is used in compact timelines / journeys.
 */
export const STATUS_META = {
  UPCOMING:           { label: 'Upcoming',          shortLabel: 'Upcoming',      order: 0 },
  REGISTRATION_OPEN:  { label: 'Registration Open', shortLabel: 'Registration',  order: 1 },
  ONGOING:            { label: 'Ongoing',           shortLabel: 'Ongoing',       order: 2 },
  JUDGING:            { label: 'Judging',           shortLabel: 'Judging',       order: 3 },
  RESULTS_ANNOUNCED:  { label: 'Results Announced', shortLabel: 'Results',       order: 4 },
  COMPLETED:          { label: 'Completed',         shortLabel: 'Completed',     order: 5 },
};

/**
 * Advance-action copy shown in AdvanceStatusModal / SettingsTab.
 * next:  button label for the next phase action.
 * desc:  confirmation description shown to the organizer.
 */
export const ADVANCE_INFO = {
  UPCOMING:           { next: 'Open Registration',  desc: 'Participants will be able to see and register for this event.' },
  REGISTRATION_OPEN:  { next: 'Start Event',        desc: 'Registration will close and the event will officially begin.' },
  ONGOING:            { next: 'Start Judging',      desc: 'Submissions will close and the event will move to the judging phase.' },
  JUDGING:            { next: 'Publish Results',    desc: 'Scores will be published and the leaderboard will become visible to all.' },
  RESULTS_ANNOUNCED:  { next: 'Mark Completed',     desc: 'The event will be marked as fully completed. This is the final stage.' },
};

// ─── Phase Policy Matrix ──────────────────────────────────────────────────────

/**
 * PHASE_POLICY — the authoritative capability matrix.
 *
 * Each key is a phase (EVENT_STATUSES value). Each value is a flat object of
 * boolean capability flags. These are PHASE-level flags — they do NOT factor in
 * user role or ownership. useEventPermissions combines these with role checks.
 *
 * Organizer capabilities:
 *   canEditEvent            — organizer may update event logistics.
 *   canManageProblems       — organizer may add / edit / delete problem statements.
 *   canManageRegistrations  — organizer may approve / reject registrations.
 *   canEvaluate             — organizer may trigger AI evaluation.
 *   canManualReview         — organizer may set manual scores / notes.
 *   canFinalize             — organizer may publish results (finalize).
 *   canAdvanceStatus        — organizer may advance to the next phase.
 *
 * Participant capabilities:
 *   canRegister             — participant may register for the event.
 *   canCreateTeam           — participant may create a new team (backend enforces event start).
 *   canJoinTeam             — participant may join an existing team.
 *   canEditTeamRoster       — leader may invite / accept / remove members.
 *   canSubmit               — team leader may submit project URLs.
 *
 * General phase state flags (role-agnostic):
 *   isReadOnly              — no mutations allowed for anyone.
 *   isLeaderboardPublic     — leaderboard scores are visible to all participants.
 *   areSubmissionsLocked    — project submission endpoints are closed.
 *   areProblemsLocked       — problem statement mutations are blocked.
 *   areTeamsLocked          — team roster mutations are blocked.
 */
export const PHASE_POLICY = {

  // ── UPCOMING ────────────────────────────────────────────────────────────────
  // Event created but registration hasn't opened. Organizer can prepare;
  // participants cannot register yet but teams can be pre-formed.
  UPCOMING: {
    canEditEvent:            true,
    canManageProblems:       true,
    canManageRegistrations:  false,
    canEvaluate:             false,
    canManualReview:         false,
    canFinalize:             false,
    canAdvanceStatus:        true,

    canRegister:             false,
    canCreateTeam:           true,
    canJoinTeam:             true,
    canEditTeamRoster:       true,
    canSubmit:               false,

    isReadOnly:              false,
    isLeaderboardPublic:     false,
    areSubmissionsLocked:    true,
    areProblemsLocked:       false,
    areTeamsLocked:          false,
  },

  // ── REGISTRATION_OPEN ───────────────────────────────────────────────────────
  // Participants can register; organizer manages registrations and problems.
  REGISTRATION_OPEN: {
    canEditEvent:            true,
    canManageProblems:       true,
    canManageRegistrations:  true,
    canEvaluate:             false,
    canManualReview:         false,
    canFinalize:             false,
    canAdvanceStatus:        true,

    canRegister:             true,
    canCreateTeam:           true,
    canJoinTeam:             true,
    canEditTeamRoster:       true,
    canSubmit:               false,

    isReadOnly:              false,
    isLeaderboardPublic:     false,
    areSubmissionsLocked:    true,
    areProblemsLocked:       false,
    areTeamsLocked:          false,
  },

  // ── ONGOING ─────────────────────────────────────────────────────────────────
  // Hackathon is live. Submissions open; problems and new registrations locked.
  // Team roster edits are technically allowed until first submission (backend enforces).
  ONGOING: {
    canEditEvent:            true,
    canManageProblems:       false,
    canManageRegistrations:  false,
    canEvaluate:             false,
    canManualReview:         false,
    canFinalize:             false,
    canAdvanceStatus:        true,

    canRegister:             false,
    canCreateTeam:           false,
    canJoinTeam:             true,
    canEditTeamRoster:       true,
    canSubmit:               true,

    isReadOnly:              false,
    isLeaderboardPublic:     false,
    areSubmissionsLocked:    false,
    areProblemsLocked:       true,
    areTeamsLocked:          false,
  },

  // ── JUDGING ─────────────────────────────────────────────────────────────────
  // Submissions closed. Organizer evaluates; everything else is locked.
  JUDGING: {
    canEditEvent:            true,
    canManageProblems:       false,
    canManageRegistrations:  false,
    canEvaluate:             true,
    canManualReview:         true,
    canFinalize:             true,
    canAdvanceStatus:        true,

    canRegister:             false,
    canCreateTeam:           false,
    canJoinTeam:             false,
    canEditTeamRoster:       false,
    canSubmit:               false,

    isReadOnly:              false,
    isLeaderboardPublic:     false,
    areSubmissionsLocked:    true,
    areProblemsLocked:       true,
    areTeamsLocked:          true,
  },

  // ── RESULTS_ANNOUNCED ───────────────────────────────────────────────────────
  // Results are public. Leaderboard is visible to all. Read-only for most actions.
  // Organizer can still advance to COMPLETED.
  RESULTS_ANNOUNCED: {
    canEditEvent:            false,
    canManageProblems:       false,
    canManageRegistrations:  false,
    canEvaluate:             false,
    canManualReview:         false,
    canFinalize:             false,
    canAdvanceStatus:        true,

    canRegister:             false,
    canCreateTeam:           false,
    canJoinTeam:             false,
    canEditTeamRoster:       false,
    canSubmit:               false,

    isReadOnly:              true,
    isLeaderboardPublic:     true,
    areSubmissionsLocked:    true,
    areProblemsLocked:       true,
    areTeamsLocked:          true,
  },

  // ── COMPLETED ───────────────────────────────────────────────────────────────
  // Terminal state. Everything is read-only and the leaderboard remains public.
  COMPLETED: {
    canEditEvent:            false,
    canManageProblems:       false,
    canManageRegistrations:  false,
    canEvaluate:             false,
    canManualReview:         false,
    canFinalize:             false,
    canAdvanceStatus:        false,

    canRegister:             false,
    canCreateTeam:           false,
    canJoinTeam:             false,
    canEditTeamRoster:       false,
    canSubmit:               false,

    isReadOnly:              true,
    isLeaderboardPublic:     true,
    areSubmissionsLocked:    true,
    areProblemsLocked:       true,
    areTeamsLocked:          true,
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the policy object for a given event status string.
 * Case-insensitive. Falls back to the most restrictive policy (COMPLETED)
 * for unknown or missing values.
 *
 * @param {string|undefined|null} status
 * @returns {typeof PHASE_POLICY[keyof typeof PHASE_POLICY]}
 */
export function getPhasePolicy(status) {
  const key = status?.toUpperCase();
  return PHASE_POLICY[key] ?? PHASE_POLICY.COMPLETED;
}

/**
 * Returns the 0-based index of a status in STATUS_ORDER.
 * Returns -1 if not found.
 *
 * @param {string|undefined|null} status
 */
export function getStatusIndex(status) {
  return STATUS_ORDER.indexOf(status?.toUpperCase());
}

/**
 * Returns true if targetStatus comes after currentStatus in STATUS_ORDER.
 *
 * @param {string} currentStatus
 * @param {string} targetStatus
 */
export function isStatusAfter(currentStatus, targetStatus) {
  return getStatusIndex(targetStatus) > getStatusIndex(currentStatus);
}
