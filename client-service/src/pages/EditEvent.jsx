import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import eventService from '../services/eventService';
import EventForm from '../components/features/events/EventForm/EventForm';
import Alert from '../components/common/Alert/Alert';
import { PageSpinner } from '../components/common/Spinner/Spinner';
import { ArrowLeft } from 'lucide-react';

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [eventData, setEventData] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    eventService.getEventById(id)
      .then(setEventData)
      .catch(() => setError('Failed to load event details.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (formData) => {
    setSubmitLoading(true);
    setError('');
    try {
      await eventService.updateEvent(id, formData);
      navigate(`/events/${id}`, { state: { tab: 'Overview' } });
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update event.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <PageSpinner />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-surface-hover text-ink-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-display font-semibold text-2xl text-ink-primary">Edit Event</h1>
          <p className="text-sm text-ink-muted mt-0.5">Update the details for this hackathon.</p>
        </div>
      </div>

      {error && <Alert type="error" title="Error">{error}</Alert>}

      <div className="bg-white border border-surface-border rounded-xl shadow-card p-6">
        {eventData && (
          <EventForm
            initialData={eventData}
            onSubmit={handleSubmit}
            onCancel={() => navigate(-1)}
            loading={submitLoading}
          />
        )}
      </div>
    </div>
  );
}
