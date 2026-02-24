import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import eventService from '@/services/eventService';
import { extractErrorMessage } from '@/services/api';
import { useEventCreation } from '@/context/EventCreationContext';
import EventForm from '@/components/features/events/EventForm/EventForm';
import Alert from '@/components/common/Alert/Alert';
import Button from '@/components/common/Button/Button';
import { ArrowLeft } from 'lucide-react';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state: creationState, startEdit, eventUpdated } = useEventCreation();

  const [eventDetails,   setEventDetails]   = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState('');
  const [updateLoading,  setUpdateLoading]  = useState(false);
  const [updateError,    setUpdateError]    = useState('');

  useEffect(() => {
    // Reuse cached data from context if it's for this event (avoids a redundant GET)
    if (creationState.mode === 'edit' && creationState.eventId === id && creationState.eventData) {
      setEventDetails(creationState.eventData);
      setLoading(false);
      return;
    }

    eventService.getEventById(id)
      .then(data => {
        setEventDetails(data);
        startEdit(id, data);
      })
      .catch(err  => setError(extractErrorMessage(err, 'Failed to fetch event details.')))
      .finally(()  => setLoading(false));
  }, [id]);

  const handleSubmit = async (formData) => {
    setUpdateLoading(true);
    setUpdateError('');
    try {
      const updated = await eventService.updateEvent(id, formData);
      // Cache whatever was returned (may be null/undefined if API returns no body)
      eventUpdated(updated ?? formData);
      navigate(`/events/${id}`);
    } catch (err) {
      setUpdateError(extractErrorMessage(err, 'Failed to update event.'));
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <Alert type="error" title="Error">{error}</Alert>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => navigate(`/events/${id}`)}>
          Back
        </Button>
        <h2 className="text-2xl font-bold text-gray-900">Edit Event</h2>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        {updateError && <Alert type="error" title="Update Failed" className="mb-6">{updateError}</Alert>}
        <EventForm
          initialData={eventDetails}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/events/${id}`)}
          loading={updateLoading}
        />
      </div>
    </div>
  );
};

export default EditEvent;
