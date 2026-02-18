import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import eventService from '../services/eventService';

// Reusable Components
import EventsHeader from '../components/features/events/EventsHeader/EventsHeader';
import EventsFilters from '../components/features/events/EventsFilters/EventsFilters';
import EmptyState from '../components/features/events/EmptyState/EmptyState';
import Modal from '../components/common/Modal/Modal';
import EventForm from '../components/features/events/EventForm/EventForm';
import Alert from '../components/common/Alert/Alert';
import EventCard from '../components/features/events/EventCard/EventCard'; // Corrected import

const MyEvents = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState([]);

  const isOrganizer = user?.role === 'organizer';

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = isOrganizer 
        ? await eventService.getOrganizerEvents()
        : await eventService.getParticipantEvents();
      setEvents(data || []);
    } catch (err) {
      setError('Failed to fetch events. Please try again later.');
    }
    finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          event.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatuses.length === 0 || 
                          selectedStatuses.includes(event.status?.toLowerCase() || '');
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateEvent = async (eventData) => {
    setCreateLoading(true);
    setError('');
    try {
      await eventService.createEvent(eventData);
      setSuccess('Event created successfully!');
      setIsModalOpen(false);
      fetchEvents(); // Refresh list
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event. Please check your details.');
    }
    finally {
      setCreateLoading(false);
    }
  };

  const handleStatusChange = (status, checked) => {
    const s = status.toLowerCase();
    setSelectedStatuses(prev => 
      checked ? [...prev, s] : prev.filter(item => item !== s)
    );
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="space-y-6">
          <EventsFilters 
            onSearchChange={setSearchQuery}
            onStatusChange={handleStatusChange}
          />
        </div>

        {/* Events Content */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredEvents.map(event => (
                <EventCard 
                  key={event.id} 
                  event={event}
                  user={user}
                  onJoin={(eventId) => navigate(`/events/${eventId}`)} 
                  onManage={() => console.log('Manage', event.id)} // TODO: Implement manage logic
                />
              ))}
            </div>
          ) : (
            <EmptyState 
              icon={Calendar}
              title={searchQuery || selectedStatuses.length > 0 ? "No matches found" : "No events found"}
              message={searchQuery || selectedStatuses.length > 0 
                ? "Try adjusting your filters or search query to find what you're looking for."
                : (isOrganizer 
                    ? "You haven't created any events yet. Start by creating your first hackathon!" 
                    : "You haven't joined any events yet. Explore the dashboard to find exciting hackathons!")
              }
              actionLabel={!isOrganizer && !searchQuery && selectedStatuses.length === 0 ? "Explore Events" : null}
              onActionClick={() => console.log('Explore')}
            />
          )}
        </div>
      </div>

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
