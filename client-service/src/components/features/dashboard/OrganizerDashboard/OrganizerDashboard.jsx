import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, ClipboardList, AlertCircle, Plus, ArrowRight } from 'lucide-react';
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

function StatCard({ icon: Icon, label, value, accent, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4">
      <div className={`p-2.5 rounded-xl ${accent || theme.primary.bgLight}`}>
        <Icon className={`w-5 h-5 ${theme.primary.text}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 leading-none">{value ?? '—'}</p>
        <p className="text-sm text-gray-500 mt-1">{label}</p>
        {sub && <p className="text-xs text-orange-500 font-medium mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function OrganizerDashboard({ user }) {
  const navigate = useNavigate();
  const [events, setEvents]     = useState([]);
  const [statsMap, setStatsMap] = useState({});
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    eventService.getOrganizerEvents()
      .then(async (evts) => {
        setEvents(evts);
        const entries = await Promise.all(
          evts.map(async (e) => {
            try {
              const s = await eventService.getEventStats(e.id);
              return [e.id, s];
            } catch { return [e.id, null]; }
          })
        );
        setStatsMap(Object.fromEntries(entries));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totals = Object.values(statsMap).reduce((acc, s) => {
    if (!s) return acc;
    acc.registrations += s.approvedRegistrations || 0;
    acc.pending       += s.pendingRegistrations || 0;
    acc.submissions   += s.submittedTeams || 0;
    acc.evaluated     += s.evaluatedTeams || 0;
    return acc;
  }, { registrations: 0, pending: 0, submissions: 0, evaluated: 0 });

  return (
    <div className="w-full space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-1">Welcome back, {user?.displayName || user?.username}!</h2>
          <p className="text-gray-500">Here's what's happening across your events.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => navigate('/my-events')}>
          New Event
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Calendar} label="Total Events" value={events.length} />
        <StatCard icon={Users} label="Approved Participants" value={totals.registrations} />
        <StatCard
          icon={AlertCircle}
          label="Pending Approvals"
          value={totals.pending}
          sub={totals.pending > 0 ? 'Needs review' : null}
          accent={totals.pending > 0 ? 'bg-orange-100' : undefined}
        />
        <StatCard icon={ClipboardList} label="Submissions" value={totals.submissions} sub={totals.evaluated > 0 ? `${totals.evaluated} evaluated` : null} />
      </div>

      {/* Events list */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Events</h3>
        {loading ? (
          <div className="text-gray-400 text-sm py-8 text-center">Loading events…</div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 flex flex-col items-center gap-3">
            <Calendar className="w-10 h-10 text-gray-300" />
            <p className="text-gray-500 font-medium">No events yet</p>
            <Button variant="primary" icon={Plus} onClick={() => navigate('/my-events')}>Create your first event</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((event) => {
              const s = statsMap[event.id];
              return (
                <div
                  key={event.id}
                  className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-orange-200 hover:shadow-sm transition-all cursor-pointer group"
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 pr-3">
                      <h4 className="font-semibold text-gray-900 truncate group-hover:text-orange-600 transition-colors">{event.name}</h4>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{event.description}</p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-xl whitespace-nowrap ${STATUS_COLORS[event.status] || 'bg-gray-100 text-gray-600'}`}>
                      {event.status?.replace('_', ' ')}
                    </span>
                  </div>

                  {s ? (
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      {[
                        { label: 'Registered', value: s.approvedRegistrations },
                        { label: 'Pending',    value: s.pendingRegistrations, alert: s.pendingRegistrations > 0 },
                        { label: 'Teams',      value: s.totalTeams },
                        { label: 'Submitted',  value: s.submittedTeams },
                      ].map(({ label, value, alert }) => (
                        <div key={label} className={`rounded-xl px-2 py-2 text-center ${alert ? 'bg-orange-50' : 'bg-gray-50'}`}>
                          <p className={`text-sm font-bold ${alert ? 'text-orange-600' : 'text-gray-800'}`}>{value ?? 0}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-12 mt-3 bg-gray-50 rounded-xl animate-pulse" />
                  )}

                  <div className="flex items-center justify-end mt-3">
                    <span className={`text-xs font-medium ${theme.primary.text} flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                      Manage <ArrowRight className="w-3 h-3" />
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
