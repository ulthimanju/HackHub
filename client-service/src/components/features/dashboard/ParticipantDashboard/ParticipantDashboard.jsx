import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, BarChart2, ArrowRight } from 'lucide-react';
import eventService from '../../../../services/eventService';
import Button from '../../../common/Button/Button';
import { theme } from '../../../../utils/theme';

const STATUS_COLORS = {
  UPCOMING: 'bg-blue-100 text-blue-700',
  REGISTRATION_OPEN: 'bg-green-100 text-green-700',
  ONGOING: 'bg-orange-100 text-orange-700',
  JUDGING: 'bg-purple-100 text-purple-700',
  RESULTS_ANNOUNCED: 'bg-teal-100 text-teal-700',
  COMPLETED: 'bg-gray-100 text-gray-600',
};

const REG_STATUS_COLORS = {
  APPROVED: 'bg-green-100 text-green-700',
  PENDING:  'bg-yellow-100 text-yellow-700',
  REJECTED: 'bg-red-100 text-red-700',
};

export default function ParticipantDashboard({ user }) {
  const navigate = useNavigate();
  const [events, setEvents]       = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      eventService.getParticipantEvents(),
      eventService.getMyRegistrationStatuses(),
    ]).then(([evts, statuses]) => {
      setEvents(evts);
      const map = {};
      statuses.forEach((r) => { map[r.eventId] = r.status; });
      setStatusMap(map);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-1">Welcome back, {user?.displayName || user?.username}!</h2>
          <p className="text-gray-500">Track your hackathon journey.</p>
        </div>
        <Button variant="outline" icon={BarChart2} onClick={() => navigate('/explore')}>
          Explore Events
        </Button>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">My Events</h3>
        {loading ? (
          <div className="text-gray-400 text-sm py-8 text-center">Loading…</div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 flex flex-col items-center gap-3">
            <Trophy className="w-10 h-10 text-gray-300" />
            <p className="text-gray-500 font-medium">You haven't joined any events yet</p>
            <Button variant="primary" onClick={() => navigate('/explore')}>Browse Events</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((event) => {
              const regStatus = statusMap[event.id];
              return (
                <div
                  key={event.id}
                  className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-orange-200 hover:shadow-sm transition-all cursor-pointer group"
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors truncate pr-2">{event.name}</h4>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-xl whitespace-nowrap ${STATUS_COLORS[event.status] || 'bg-gray-100 text-gray-600'}`}>
                      {event.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-3">{event.description}</p>
                  <div className="flex items-center justify-between">
                    {regStatus && (
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-xl ${REG_STATUS_COLORS[regStatus] || 'bg-gray-100 text-gray-500'}`}>
                        Registration: {regStatus}
                      </span>
                    )}
                    <span className={`text-xs font-medium ${theme.primary.text} flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity`}>
                      View <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
