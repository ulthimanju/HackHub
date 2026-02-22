import { useState, useEffect } from 'react';
import eventService from '../services/eventService';

export function useParticipantDashboard() {
  const [events, setEvents]     = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      eventService.getParticipantEvents(),
      eventService.getMyRegistrationStatuses(),
    ]).then(([evts, statuses]) => {
      if (cancelled) return;
      setEvents(evts);
      const map = {};
      statuses.forEach((r) => { map[r.eventId] = r.status; });
      setStatusMap(map);
    }).catch(() => {}).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { events, statusMap, loading };
}
