import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Users, Calendar, ClipboardList, AlertCircle, Plus, ArrowRight,
         CalendarDays, Globe, MapPin, Tag } from 'lucide-react';
import Button from '../../../common/Button/Button';
import { theme } from '../../../../utils/theme';
import { useOrganizerDashboard } from '../../../../hooks/useOrganizerDashboard';
import EventFilters from '../../../common/EventFilters/EventFilters';
import { ALL_THEMES } from '../../../../constants/themes';

const STATUS_TABS = [
  { label: 'All',                value: 'all' },
  { label: 'Upcoming',          value: 'upcoming' },
  { label: 'Registration Open', value: 'registration_open' },
  { label: 'Ongoing',           value: 'ongoing' },
  { label: 'Judging',           value: 'judging' },
  { label: 'Results',           value: 'results_announced' },
  { label: 'Completed',         value: 'completed' },
];

const STATUS_VARIANTS = {
  upcoming:           { label: 'Upcoming',           color: 'text-blue-600 border-blue-100 bg-blue-50' },
  registration_open:  { label: 'Registration Open',  color: 'text-green-600 border-green-100 bg-green-50' },
  ongoing:            { label: 'Ongoing',             color: 'text-brand-600 border-brand-100 bg-brand-50' },
  judging:            { label: 'Judging',             color: 'text-amber-600 border-amber-100 bg-amber-50' },
  results_announced:  { label: 'Results Announced',  color: 'text-teal-600 border-teal-100 bg-teal-50' },
  completed:          { label: 'Completed',           color: 'text-ink-muted border-surface-border bg-surface-hover' },
};

const formatDateRange = (start, end) => {
  const opts = { day: 'numeric', month: 'short', year: 'numeric' };
  const s = start ? new Date(start).toLocaleDateString('en-GB', opts) : 'TBD';
  const e = end   ? new Date(end).toLocaleDateString('en-GB', opts)   : 'TBD';
  return `${s} – ${e}`;
};

const getDaysLeft = (endDate) => {
  if (!endDate) return null;
  return Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
};

function DashboardEventCard({ event, stats, onClick }) {
  const eventStatus = event.status?.toLowerCase() || 'upcoming';
  const statusCfg   = STATUS_VARIANTS[eventStatus] || STATUS_VARIANTS.upcoming;
  const daysLeft    = getDaysLeft(event.endDate);
  const location    = event.isVirtual ? 'Online' : (event.location || event.venue || 'Offline');
  const themes      = event.theme ? event.theme.split(',').map(t => t.trim()).filter(Boolean) : [];

  return (
    <div
      className="bg-white border border-surface-border rounded-xl shadow-card cursor-pointer hover:shadow-card-hover hover:border-brand-200 transition-all group"
      onClick={onClick}
    >
      <div className="p-5 space-y-3">
        {/* Title + status */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-ink-primary font-display leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors flex-1">
            {event.name}
          </h3>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-md border shrink-0 ${statusCfg.color}`}>
            {statusCfg.label}
          </span>
        </div>

        {/* Location + days left */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1.5 text-sm text-ink-secondary">
            {event.isVirtual
              ? <Globe className="w-3.5 h-3.5 text-ink-muted shrink-0" />
              : <MapPin className="w-3.5 h-3.5 text-ink-muted shrink-0" />}
            {location}
          </span>
          {daysLeft !== null && daysLeft > 0 ? (
            <span className="inline-flex items-center gap-1 bg-teal-500 text-white text-xs font-medium px-2.5 py-0.5 rounded-md shrink-0">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              {daysLeft}d left
            </span>
          ) : daysLeft !== null && daysLeft <= 0 ? (
            <span className="inline-flex items-center gap-1 bg-surface-hover text-ink-muted text-xs font-medium px-2.5 py-0.5 rounded-md shrink-0">Ended</span>
          ) : null}
        </div>

        {/* Date range */}
        <div className="flex items-center gap-1.5 text-ink-muted text-xs">
          <CalendarDays className="w-3.5 h-3.5 shrink-0" />
          <span>{formatDateRange(event.startDate, event.endDate)}</span>
        </div>

        {/* Participants */}
        {event.maxParticipants && (
          <div className="text-sm text-ink-muted">
            <span className="font-medium text-ink-primary">{event.registeredCount ?? 0}/{event.maxParticipants}</span>
            {' '}participants
          </div>
        )}

        {/* Theme tags */}
        {themes.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Tag className="w-3.5 h-3.5 text-ink-muted shrink-0" />
            {themes.map(t => (
              <span key={t} className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-md">
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Metric counters — dashboard only */}
        {stats ? (
          <div className="grid grid-cols-4 gap-1.5 pt-1 border-t border-surface-border">
            {[
              { label: 'Registered', value: stats.approvedRegistrations },
              { label: 'Pending',    value: stats.pendingRegistrations, alert: stats.pendingRegistrations > 0 },
              { label: 'Teams',      value: stats.totalTeams },
              { label: 'Submitted',  value: stats.submittedTeams },
            ].map(({ label, value, alert }) => (
              <div key={label} className={`rounded-lg px-2 py-2 text-center ${alert ? 'bg-brand-50' : 'bg-surface-hover'}`}>
                <p className={`text-sm font-semibold ${alert ? 'text-brand-600' : 'text-ink-primary'}`}>{value ?? 0}</p>
                <p className="text-xxs text-ink-muted mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-14 bg-surface-hover rounded-lg animate-pulse" />
        )}

        {/* Footer */}
        <div className="flex items-center justify-end pt-1">
          <span className={`text-xs font-medium ${theme.primary.text} flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
            Manage <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
}

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

  const [searchParams] = useSearchParams();
  const search = searchParams.get('q') || '';

  const [activeTab, setActiveTab]     = useState('all');
  const [activeThemes, setActiveThemes] = useState([]);

  const tabCounts = useMemo(() => STATUS_TABS.reduce((acc, t) => {
    acc[t.value] = t.value === 'all'
      ? events.length
      : events.filter(e => e.status?.toLowerCase() === t.value).length;
    return acc;
  }, {}), [events]);

  const filteredEvents = useMemo(() => events.filter(e => {
    const matchesTab    = activeTab === 'all' || e.status?.toLowerCase() === activeTab;
    const matchesSearch = !search.trim() ||
      e.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.description?.toLowerCase().includes(search.toLowerCase());
    const eventThemes   = e.theme ? e.theme.split(',').map(t => t.trim()) : [];
    const matchesTheme  = activeThemes.length === 0 || activeThemes.every(t => eventThemes.includes(t));
    return matchesTab && matchesSearch && matchesTheme;
  }), [events, activeTab, search, activeThemes]);

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
        <Button variant="primary" icon={Plus} onClick={() => navigate('/my-events/create')}>
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
      <div className="space-y-4">
        <EventFilters
          tabs={STATUS_TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabCounts={tabCounts}
          themeItems={ALL_THEMES}
          activeThemes={activeThemes}
          onThemesChange={setActiveThemes}
        />

        <p className="text-xs font-medium text-ink-muted uppercase tracking-widest">
          {activeTab === 'all' && !search && activeThemes.length === 0
            ? 'Your Events'
            : `${filteredEvents.length} result${filteredEvents.length !== 1 ? 's' : ''}`}
        </p>

        {loading ? (
          <div className="text-ink-muted text-sm py-8 text-center">Loading events…</div>
        ) : filteredEvents.length === 0 && events.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-surface-border py-10 flex flex-col items-center gap-3">
            <img
              src="https://illustrations.popsy.co/amber/app-launch.svg"
              alt=""
              className="w-40 h-40 object-contain"
              onError={e => { e.target.style.display = 'none'; }}
            />
            <p className="text-ink-muted font-medium text-sm">No events yet</p>
            <Button variant="primary" icon={Plus} size="sm" onClick={() => navigate('/my-events/create')}>
              Create your first event
            </Button>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-surface-border py-10 flex flex-col items-center gap-3">
            <p className="text-ink-muted font-medium text-sm">No events match your filters</p>
            <button
              onClick={() => { setActiveTab('all'); setActiveThemes([]); }}
              className="text-xs text-brand-500 hover:text-brand-600 font-medium transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredEvents.map(event => (
              <DashboardEventCard
                key={event.id}
                event={event}
                stats={statsMap[event.id]}
                onClick={() => navigate(`/events/${event.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
