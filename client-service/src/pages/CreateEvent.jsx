import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import EventForm from '@/components/features/events/EventForm/EventForm';
import Alert from '@/components/common/Alert/Alert';
import CreationStepIndicator from '@/components/features/events/CreationStepIndicator/CreationStepIndicator';
import { useEventCreation } from '@/context/EventCreationContext';
import eventService from '@/services/eventService';
import { extractErrorMessage } from '@/services/api';

const CreateEvent = () => {
  const navigate = useNavigate();
  const { startCreate, eventCreated } = useEventCreation();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // Mark context as a fresh creation flow on mount
  React.useEffect(() => { startCreate(); }, []);

  const handleSubmit = async (eventData) => {
    setLoading(true);
    setError('');
    try {
      const created = await eventService.createEvent(eventData);
      // Some backends return the created object; others return 201 with no body.
      const eventId = created?.id;

      if (eventId) {
        eventCreated(eventId, created.name ?? eventData.name);
        navigate(`/events/${eventId}/problems/add`);
      } else {
        // Backend didn't return the event body — fetch organizer events and pick the newest
        const events = await eventService.getOrganizerEvents();
        const newest = events?.sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))[0];
        if (newest?.id) {
          eventCreated(newest.id, newest.name);
          navigate(`/events/${newest.id}/problems/add`);
        } else {
          // Final fallback — go to dashboard with success message
          navigate('/', { state: { success: 'Event created successfully!' } });
        }
      }
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to create event. Please check your details.'));
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="p-1.5 rounded-lg text-ink-muted hover:text-ink-primary hover:bg-surface-hover transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="font-display font-semibold text-2xl text-ink-primary tracking-tight">
            Create New Hackathon
          </h2>
          <p className="text-sm text-ink-muted mt-0.5">Fill in the details to set up your event.</p>
        </div>
      </div>

      {/* Step indicator */}
      <CreationStepIndicator currentStep="details" />

      {error && <Alert type="error" title="Action Failed">{error}</Alert>}

      {/* Form card */}
      <div className="bg-white rounded-xl border border-surface-border shadow-card p-8">
        <EventForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/')}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default CreateEvent;
