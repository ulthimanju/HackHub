import { useApi } from './useApi';
import eventService from '../services/eventService';

export function useParticipantDashboard() {
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
