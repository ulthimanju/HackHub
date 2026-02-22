import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import eventService from '../services/eventService';

import EventsHeader from '../components/features/events/EventsHeader/EventsHeader';
import EmptyState from '../components/features/events/EmptyState/EmptyState';
import Alert from '../components/common/Alert/Alert';
import EventCard from '../components/features/events/EventCard/EventCard';
import EventFilters from '../components/common/EventFilters/EventFilters';
import { ALL_THEMES } from '../constants/themes';

const STATUS_TABS = [
  { label: 'All',                value: 'all' },
  { label: 'Upcoming',          value: 'upcoming' },
  { label: 'Registration Open', value: 'registration_open' },
  { label: 'Ongoing',           value: 'ongoing' },
  { label: 'Judging',           value: 'judging' },
  { label: 'Results',           value: 'results_announced' },
  { label: 'Completed',         value: 'completed' },
];

const MyEvents = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [registrationStatuses, setRegistrationStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(location.state?.success || '');
  const [activeTab, setActiveTab] = useState('all');
  const [activeThemes, setActiveThemes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const isOrganizer = user?.role === 'organizer';

  useEffect(() => {
    fetchEvents();
    if (location.state?.success) {
      setTimeout(() => setSuccess(''), 5000);
      window.history.replaceState({}, '');
    }
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      if (isOrganizer) {
        const data = await eventService.getOrganizerEvents();
        setEvents(data || []);
      } else {
        const [data, regs] = await Promise.all([
          eventService.getParticipantEvents(),
          eventService.getMyRegistrationStatuses(),
        ]);
        setEvents(data || []);
        const statusMap = {};
        (regs || []).forEach(r => { statusMap[r.eventId] = r; });
        setRegistrationStatuses(statusMap);
      }
    } catch (err) {
      setError('Failed to fetch events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const tabCounts = useMemo(() => STATUS_TABS.reduce((acc, t) => {
    acc[t.value] = t.value === 'all'
      ? events.length
      : events.filter(e => e.status?.toLowerCase() === t.value).length;
    return acc;
  }, {}), [events]);

  const filteredEvents = useMemo(() => events.filter(event => {
    const matchesTab = activeTab === 'all' || event.status?.toLowerCase() === activeTab;
    const matchesSearch = !searchQuery.trim() ||
      event.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const eventThemes = event.theme ? event.theme.split(',').map(t => t.trim()) : [];
    const matchesTheme = activeThemes.length === 0 || activeThemes.every(t => eventThemes.includes(t));
    return matchesTab && matchesSearch && matchesTheme;
  }), [events, activeTab, searchQuery, activeThemes]);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      <EventsHeader
        title="My Events"
        description="Manage and track your hackathon participations"
        showCreateButton={isOrganizer}
        onCreateClick={() => navigate('/my-events/create')}
      />

      {(error || success) && (
        <div className="animate-in slide-in-from-top-2">
          {error && <Alert type="error" title="Action Failed">{error}</Alert>}
          {success && <Alert type="success" title="Success">{success}</Alert>}
        </div>
      )}

      <EventFilters
        tabs={STATUS_TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabCounts={tabCounts}
        themeItems={ALL_THEMES}
        activeThemes={activeThemes}
        onThemesChange={setActiveThemes}
      />

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEvents.map(event => (
            <EventCard
              key={event.id}
              event={event}
              user={user}
              registrationStatus={registrationStatuses[event.id]}
              onJoin={(eventId) => navigate(`/events/${eventId}`)}
              onManage={(eventId) => navigate(`/events/${eventId}`)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          illustrationSrc={
            activeTab !== 'all' || activeThemes.length > 0
              ? 'https://illustrations.popsy.co/amber/digital-nomad.svg'
              : isOrganizer
                ? 'https://illustrations.popsy.co/amber/app-launch.svg'
                : 'https://illustrations.popsy.co/amber/work-from-home.svg'
          }
          title={activeTab !== 'all' || activeThemes.length > 0 ? 'No matches found' : 'No events found'}
          message={activeTab !== 'all' || activeThemes.length > 0
            ? 'Try a different filter.'
            : (isOrganizer
                ? "You haven't created any events yet. Start by creating your first hackathon!"
                : "You haven't joined any events yet. Explore the dashboard to find exciting hackathons!")
          }
        />
      )}
    </div>
  );
};

export default MyEvents;
