import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, ClipboardList, AlertCircle, Plus, ArrowRight } from 'lucide-react';
import Button from '../../../common/Button/Button';
import { theme } from '../../../../utils/theme';
import { useOrganizerDashboard } from '../../../../hooks/useOrganizerDashboard';

const STATUS_COLORS = {
  UPCOMING:           'bg-blue-50 text-blue-700',
  REGISTRATION_OPEN:  'bg-green-50 text-green-700',
  ONGOING:            'bg-brand-50 text-brand-700',
  JUDGING:            'bg-purple-50 text-purple-700',
  RESULTS_ANNOUNCED:  'bg-teal-50 text-teal-700',
  COMPLETED:          'bg-surface-hover text-ink-muted',
};

function StatCard({ icon: Icon, label, value, alert, sub }) {
  return (
    <div className="bg-white rounded-xl border border-surface-border p-4 flex items-start gap-3 shadow-card">
      <div className={`p-2 rounded-lg ${alert ? 'bg-brand-50' : 'bg-surface-hover'}`}>
        <Icon className={`w-4 h-4 ${alert ? theme.primary.text : 'text-ink-muted'}`} />
      </div>
      <div>
        <p className="font-display font-semibold text-xl text-ink-primary leading-none">{value ?? '—'}</p>
        <p className="text-xs text-ink-muted mt-1">{label}</p>
        {sub && <p className={`text-xs font-medium mt-0.5 ${theme.primary.text}`}>{sub}</p>}
      </div>
    </div>
  );
}

export default function OrganizerDashboard({ user }) {
  const navigate = useNavigate();
  const { events, statsMap, totals, loading } = useOrganizerDashboard();

  return (
    <div className="w-full space-y-7">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display font-semibold text-2xl text-ink-primary">
            Welcome back, {user?.displayName || user?.username}
          </h2>
          <p className="text-sm text-ink-muted mt-1">Here's what's happening across your events.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => navigate('/my-events')}>
          New Event
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Calendar}      label="Total Events"         value={events.length} />
        <StatCard icon={Users}         label="Approved Participants" value={totals.registrations} />
        <StatCard
          icon={AlertCircle}
          label="Pending Approvals"
          value={totals.pending}
          alert={totals.pending > 0}
          sub={totals.pending > 0 ? 'Needs review' : null}
        />
        <StatCard
          icon={ClipboardList}
          label="Submissions"
          value={totals.submissions}
          sub={totals.evaluated > 0 ? `${totals.evaluated} evaluated` : null}
        />
      </div>

      {/* Events list */}
      <div>
        <p className="text-xs font-medium text-ink-muted uppercase tracking-widest mb-3">Your Events</p>
        {loading ? (
          <div className="text-ink-muted text-sm py-8 text-center">Loading events…</div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-surface-border py-10 flex flex-col items-center gap-3">
            <img
              src="https://illustrations.popsy.co/amber/app-launch.svg"
              alt=""
              className="w-40 h-40 object-contain"
              onError={e => { e.target.style.display = 'none'; }}
            />
            <p className="text-ink-muted font-medium text-sm">No events yet</p>
            <Button variant="primary" icon={Plus} size="sm" onClick={() => navigate('/my-events')}>
              Create your first event
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {events.map((event) => {
              const s = statsMap[event.id];
              return (
                <div
                  key={event.id}
                  className="bg-white rounded-xl border border-surface-border p-4 hover:border-brand-300 hover:shadow-card-hover transition-all cursor-pointer group shadow-card"
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 pr-3">
                      <h4 className="font-medium text-ink-primary truncate group-hover:text-brand-600 transition-colors text-sm">
                        {event.name}
                      </h4>
                      <p className="text-xs text-ink-muted mt-0.5 line-clamp-1">{event.description}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md whitespace-nowrap ${STATUS_COLORS[event.status] ?? 'bg-surface-hover text-ink-muted'}`}>
                      {event.status?.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {s ? (
                    <div className="grid grid-cols-4 gap-1.5 mt-2">
                      {[
                        { label: 'Registered', value: s.approvedRegistrations },
                        { label: 'Pending',    value: s.pendingRegistrations, alert: s.pendingRegistrations > 0 },
                        { label: 'Teams',      value: s.totalTeams },
                        { label: 'Submitted',  value: s.submittedTeams },
                      ].map(({ label, value, alert }) => (
                        <div key={label} className={`rounded-lg px-2 py-2 text-center ${alert ? 'bg-brand-50' : 'bg-surface-hover'}`}>
                          <p className={`text-sm font-semibold ${alert ? 'text-brand-600' : 'text-ink-primary'}`}>{value ?? 0}</p>
                          <p className="text-[10px] text-ink-muted mt-0.5">{label}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-10 mt-2 bg-surface-hover rounded-lg animate-pulse" />
                  )}

                  <div className="flex items-center justify-end mt-2">
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
