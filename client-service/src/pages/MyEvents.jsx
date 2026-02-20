import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import eventService from '../services/eventService';

import EventsHeader from '../components/features/events/EventsHeader/EventsHeader';
import EmptyState from '../components/features/events/EmptyState/EmptyState';
import Modal from '../components/common/Modal/Modal';
import EventForm from '../components/features/events/EventForm/EventForm';
import Alert from '../components/common/Alert/Alert';
import EventCard from '../components/features/events/EventCard/EventCard';

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
  const [events, setEvents] = useState([]);
  const [registrationStatuses, setRegistrationStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const isOrganizer = user?.role === 'organizer';

  useEffect(() => {
    fetchEvents();
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

  const filteredEvents = events.filter(event => {
    const matchesTab = activeTab === 'all' || event.status?.toLowerCase() === activeTab;
    const matchesSearch = !searchQuery.trim() ||
      event.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const tabCounts = STATUS_TABS.reduce((acc, t) => {
    acc[t.value] = t.value === 'all'
      ? events.length
      : events.filter(e => e.status?.toLowerCase() === t.value).length;
    return acc;
  }, {});

  const handleCreateEvent = async (eventData) => {
    setCreateLoading(true);
    setError('');
    try {
      await eventService.createEvent(eventData);
      setSuccess('Event created successfully!');
      setIsModalOpen(false);
      fetchEvents();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event. Please check your details.');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      <EventsHeader
        title="My Events"
        description="Manage and track your hackathon participations"
        showCreateButton={isOrganizer}
        onCreateClick={() => setIsModalOpen(true)}
      />

      {(error || success) && (
        <div className="animate-in slide-in-from-top-2">
          {error && <Alert type="error" title="Action Failed">{error}</Alert>}
          {success && <Alert type="success" title="Success">{success}</Alert>}
        </div>
      )}

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map(tab => {
          const count = tabCounts[tab.value] ?? 0;
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                isActive
                  ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
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
          title={activeTab !== 'all' ? 'No matches found' : 'No events found'}
          message={activeTab !== 'all'
            ? 'Try a different status filter.'
            : (isOrganizer
                ? "You haven't created any events yet. Start by creating your first hackathon!"
                : "You haven't joined any events yet. Explore the dashboard to find exciting hackathons!")
          }
        />
      )}

      {/* Create Event Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Hackathon"
      >
        <EventForm
          onSubmit={handleCreateEvent}
          onCancel={() => setIsModalOpen(false)}
          loading={createLoading}
        />
      </Modal>
    </div>
  );
};

export default MyEvents;
