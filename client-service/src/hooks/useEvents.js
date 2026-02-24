import { useState, useEffect, useMemo } from 'react';
import eventService from '../services/eventService';
import { extractErrorMessage } from '../services/api';

const PAGE_SIZE = 12;

/**
 * Fetches all public events and the current user's registration statuses, then applies
 * client-side filtering (by status tab, free-text search, and theme tags) and pagination.
 *
 * @param {object} options
 * @param {string}   options.search       - Free-text search term (from URL ?q=).
 * @param {string}   options.activeTab    - Active status filter tab value (default 'all').
 * @param {string[]} options.activeThemes - Array of selected theme strings.
 * @returns {{
 *   events: object[],
 *   filtered: object[],
 *   paginatedEvents: object[],
 *   loading: boolean,
 *   error: string,
 *   page: number,
 *   setPage: Function,
 *   totalPages: number,
 *   tabCounts: Record<string, number>,
 *   registeredIds: Set<string>,
 *   registrationStatuses: Record<string, object>,
 *   markRegistered: (eventId: string) => void,
 * }}
 */
export function useEvents({ search = '', activeTab = 'all', activeThemes = [] } = {}) {
  const [events, setEvents] = useState([]);
  const [registeredIds, setRegisteredIds] = useState(new Set());
  const [registrationStatuses, setRegistrationStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [all, myRegs] = await Promise.all([
          eventService.getAllEvents(),
          eventService.getMyRegistrationStatuses(),
        ]);
        if (cancelled) return;
        setEvents(all);
        const ids = new Set((myRegs || []).map(r => r.eventId));
        setRegisteredIds(ids);
        const statusMap = {};
        (myRegs || []).forEach(r => { statusMap[r.eventId] = r; });
        setRegistrationStatuses(statusMap);
      } catch (err) {
        if (!cancelled) setError(extractErrorMessage(err, 'Failed to load events.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Reset to page 0 whenever any filter changes
  useEffect(() => { setPage(0); }, [activeTab, search, activeThemes]);

  const filtered = useMemo(() => events.filter(e => {
    const matchesTab    = activeTab === 'all' || e.status?.toLowerCase() === activeTab;
    const q             = search.trim().toLowerCase();
    const matchesSearch = !q
      || e.name?.toLowerCase().includes(q)
      || e.description?.toLowerCase().includes(q)
      || e.theme?.toLowerCase().includes(q);
    const eventThemes   = e.theme ? e.theme.split(',').map(t => t.trim()) : [];
    const matchesTheme  = activeThemes.length === 0 || activeThemes.every(t => eventThemes.includes(t));
    return matchesTab && matchesSearch && matchesTheme;
  }), [events, activeTab, search, activeThemes]);

  const tabCounts = useMemo(() => {
    const counts = { all: events.length };
    events.forEach(e => {
      const s = e.status?.toLowerCase();
      if (s) counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [events]);

  const totalPages       = Math.ceil(filtered.length / PAGE_SIZE);
  const paginatedEvents  = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  /** Optimistically mark an event as registered (PENDING) after a successful registration call. */
  const markRegistered = (eventId) => {
    setRegisteredIds(prev => new Set([...prev, eventId]));
    setRegistrationStatuses(prev => ({ ...prev, [eventId]: { status: 'PENDING' } }));
  };

  return {
    events,
    filtered,
    paginatedEvents,
    loading,
    error,
    page,
    setPage,
    totalPages,
    tabCounts,
    registeredIds,
    registrationStatuses,
    markRegistered,
  };
}
