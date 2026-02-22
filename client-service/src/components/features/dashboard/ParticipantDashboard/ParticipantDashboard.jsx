import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2, ArrowRight } from 'lucide-react';
import Button from '../../../common/Button/Button';
import { theme } from '../../../../utils/theme';
import { useParticipantDashboard } from '../../../../hooks/useParticipantDashboard';

const STATUS_COLORS = {
  UPCOMING:           'bg-blue-50 text-blue-700',
  REGISTRATION_OPEN:  'bg-green-50 text-green-700',
  ONGOING:            'bg-brand-50 text-brand-700',
  JUDGING:            'bg-purple-50 text-purple-700',
  RESULTS_ANNOUNCED:  'bg-teal-50 text-teal-700',
  COMPLETED:          'bg-surface-hover text-ink-muted',
};

const REG_STATUS_COLORS = {
  APPROVED: 'bg-green-50 text-green-700',
  PENDING:  'bg-amber-50 text-amber-700',
  REJECTED: 'bg-red-50 text-red-700',
};

export default function ParticipantDashboard({ user }) {
  const navigate = useNavigate();
  const { events, statusMap, loading } = useParticipantDashboard();

  return (
    <div className="w-full space-y-7">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display font-semibold text-2xl text-ink-primary">
            Welcome back, {user?.displayName || user?.username}
          </h2>
          <p className="text-sm text-ink-muted mt-1">Track your hackathon journey.</p>
        </div>
        <Button variant="outline" icon={BarChart2} onClick={() => navigate('/explore')}>
          Explore Events
        </Button>
      </div>

      {/* Events list */}
      <div>
        <p className="text-xs font-medium text-ink-muted uppercase tracking-widest mb-3">My Events</p>
        {loading ? (
          <div className="text-ink-muted text-sm py-8 text-center">Loading…</div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-surface-border py-10 flex flex-col items-center gap-3">
            <img
              src="https://illustrations.popsy.co/amber/work-from-home.svg"
              alt=""
              className="w-40 h-40 object-contain"
              onError={e => { e.target.style.display = 'none'; }}
            />
            <p className="text-ink-muted font-medium text-sm">You haven't joined any events yet</p>
            <Button variant="primary" size="sm" onClick={() => navigate('/explore')}>Browse Events</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {events.map((event) => {
              const regStatus = statusMap[event.id];
              return (
                <div
                  key={event.id}
                  className="bg-white rounded-xl border border-surface-border p-4 hover:border-brand-300 hover:shadow-card-hover transition-all cursor-pointer group shadow-card"
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-ink-primary group-hover:text-brand-600 transition-colors truncate pr-2 text-sm">
                      {event.name}
                    </h4>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md whitespace-nowrap ${STATUS_COLORS[event.status] ?? 'bg-surface-hover text-ink-muted'}`}>
                      {event.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted line-clamp-2 mb-3">{event.description}</p>
                  <div className="flex items-center justify-between">
                    {regStatus && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${REG_STATUS_COLORS[regStatus] ?? 'bg-surface-hover text-ink-muted'}`}>
                        {regStatus}
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
