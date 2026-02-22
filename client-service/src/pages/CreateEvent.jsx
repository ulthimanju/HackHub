import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import EventForm from '../components/features/events/EventForm/EventForm';
import Alert from '../components/common/Alert/Alert';
import eventService from '../services/eventService';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (eventData) => {
    setLoading(true);
    setError('');
    try {
      await eventService.createEvent(eventData);
      navigate('/my-events', { state: { success: 'Event created successfully!' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event. Please check your details.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/my-events')}
          className="p-1.5 rounded-lg text-ink-muted hover:text-ink-primary hover:bg-surface-hover transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="font-display font-semibold text-2xl text-ink-primary tracking-tight">
            Create New Hackathon
          </h2>
          <p className="text-sm text-ink-muted mt-0.5">Fill in the details to set up your event.</p>
        </div>
      </div>

      {error && (
        <Alert type="error" title="Action Failed">{error}</Alert>
      )}

      {/* Form card */}
      <div className="bg-white rounded-xl border border-surface-border shadow-card p-8">
        <EventForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/my-events')}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default CreateEvent;
