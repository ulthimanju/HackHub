import { useMemo } from 'react';
import { useApi } from './useApi';
import eventService from '../services/eventService';

/**
 * Fetches the authenticated organizer's events and aggregates stats across all of them.
 *
 * @returns {{
 *   events: object[],
 *   statsMap: Record<string, object|null>,
 *   totals: { registrations: number, pending: number, submissions: number, evaluated: number },
 *   loading: boolean,
 * }}
 */
export function useOrganizerDashboard() {
  const { data, loading } = useApi(async () => {
    const evts = await eventService.getOrganizerEvents();
    const entries = await Promise.all(
      evts.map(async (e) => {
        try {
          const s = await eventService.getEventStats(e.id);
          return [e.id, s];
        } catch { return [e.id, null]; }
      })
    );
    return { evts, statsMap: Object.fromEntries(entries) };
  });

  const statsMap = data?.statsMap ?? {};
  const events   = data?.evts   ?? [];

  const totals = useMemo(() => Object.values(statsMap).reduce((acc, s) => {
    if (!s) return acc;
    acc.registrations += s.approvedRegistrations || 0;
    acc.pending       += s.pendingRegistrations  || 0;
    acc.submissions   += s.submittedTeams        || 0;
    acc.evaluated     += s.evaluatedTeams        || 0;
    return acc;
  }, { registrations: 0, pending: 0, submissions: 0, evaluated: 0 }), [statsMap]);

  return { events, statsMap, totals, loading };
}
