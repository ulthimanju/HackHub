import { useState, useEffect } from 'react';
import eventService from '../services/eventService';

export function useOrganizerDashboard() {
  const [events, setEvents]     = useState([]);
  const [statsMap, setStatsMap] = useState({});
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    let cancelled = false;
    eventService.getOrganizerEvents()
      .then(async (evts) => {
        if (cancelled) return;
        setEvents(evts);
        const entries = await Promise.all(
          evts.map(async (e) => {
            try {
              const s = await eventService.getEventStats(e.id);
              return [e.id, s];
            } catch { return [e.id, null]; }
          })
        );
        if (!cancelled) setStatsMap(Object.fromEntries(entries));
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const totals = Object.values(statsMap).reduce((acc, s) => {
    if (!s) return acc;
    acc.registrations += s.approvedRegistrations || 0;
    acc.pending       += s.pendingRegistrations  || 0;
    acc.submissions   += s.submittedTeams        || 0;
    acc.evaluated     += s.evaluatedTeams        || 0;
    return acc;
  }, { registrations: 0, pending: 0, submissions: 0, evaluated: 0 });

  return { events, statsMap, totals, loading };
}
