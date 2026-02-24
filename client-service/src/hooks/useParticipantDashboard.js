import { useApi } from './useApi';
import eventService from '../services/eventService';

/**
 * Fetches the authenticated participant's registered events and their registration statuses.
 *
 * @returns {{
 *   events: object[],
 *   statusMap: Record<string, string>,
 *   loading: boolean,
 * }}
 */
  const { data, loading } = useApi(async () => {
    const [evts, statuses] = await Promise.all([
      eventService.getParticipantEvents(),
      eventService.getMyRegistrationStatuses(),
    ]);
    const statusMap = {};
    statuses.forEach((r) => { statusMap[r.eventId] = r.status; });
    return { evts, statusMap };
  });

  return {
    events:    data?.evts      ?? [],
    statusMap: data?.statusMap ?? {},
    loading,
  };
}
