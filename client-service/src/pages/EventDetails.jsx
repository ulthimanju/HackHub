import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import eventService from '../services/eventService';
import Alert from '../components/common/Alert/Alert';
import Badge from '../components/common/Badge/Badge';
import Section from '../components/common/Section/Section';
import Button from '../components/common/Button/Button';
import Tabs from '../components/common/Tabs/Tabs'; // Import the new Tabs component
import { 
  CalendarDays, MapPin, Users, Mail, Trophy, BookOpen, Clock, Globe, Award, ShieldCheck, ArrowLeft 
} from 'lucide-react';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEventDetails = async () => {
      setLoading(true);
      try {
        const data = await eventService.getEventById(id);
        setEventDetails(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch event details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEventDetails();
    }
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const statusVariants = {
    upcoming: 'blue',
    'registration_open': 'success',
    ongoing: 'orange',
    completed: 'secondary',
    cancelled: 'danger'
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <Alert type="error" title="Error">{error}</Alert>;
  }

  if (!eventDetails) {
    return <Alert type="info" title="Not Found">Event details could not be loaded.</Alert>;
  }

  // Define tab content
  const tabs = [
    {
      label: 'Overview',
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Section title="Key Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <CalendarDays className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-semibold text-gray-700">Event Dates</p>
                    <p className="text-sm text-gray-500">{formatDate(eventDetails.startDate)} - {formatDate(eventDetails.endDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-semibold text-gray-700">Registration Period</p>
                    <p className="text-sm text-gray-500">{formatDate(eventDetails.registrationStartDate)} - {formatDate(eventDetails.registrationEndDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-semibold text-gray-700">Location</p>
                    <p className="text-sm text-gray-500">{eventDetails.isVirtual ? `Virtual: ${eventDetails.location}` : eventDetails.location || eventDetails.venue || 'Offline'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-semibold text-gray-700">Participation</p>
                    <p className="text-sm text-gray-500">Max Participants: {eventDetails.maxParticipants || 'Unlimited'}</p>
                    <p className="text-sm text-gray-500">Team Size: {eventDetails.teamSize || 'N/A'}</p>
                  </div>
                </div>
                {eventDetails.shortCode && (
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="font-semibold text-gray-700">Event Code</p>
                      <p className="text-sm text-gray-500">{eventDetails.shortCode}</p>
                    </div>
                  </div>
                )}
              </div>
            </Section>
          </div>
          <div className="space-y-8">
            {eventDetails.theme && (
              <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-100 text-center shadow-sm space-y-2">
                <Globe className="w-10 h-10 text-blue-600 mx-auto" />
                <p className="text-sm font-bold text-blue-800 uppercase tracking-widest">Theme</p>
                <p className="text-xl font-extrabold text-gray-900">{eventDetails.theme}</p>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      label: 'Details',
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {eventDetails.prizes && eventDetails.prizes.length > 0 && (
            <Section title="Prizes">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-3">
                {eventDetails.prizes.map((prize, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm text-gray-700">
                    <Trophy className="w-4 h-4 text-green-500 shrink-0" />
                    <span>{prize}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {eventDetails.rules && eventDetails.rules.length > 0 && (
            <Section title="Rules & Guidelines">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-3">
                {eventDetails.rules.map((rule, index) => (
                  <div key={index} className="flex items-start gap-3 text-sm text-gray-700">
                    <BookOpen className="w-4 h-4 text-purple-500 shrink-0 mt-1" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {eventDetails.problemStatements && eventDetails.problemStatements.length > 0 && (
            <Section title="Problem Statements">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                {eventDetails.problemStatements.map((problem, index) => (
                  <div key={problem.id || index} className="flex items-start gap-3">
                    <BookOpen className="w-5 h-5 text-blue-500 shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-800">Statement {index + 1}:</p>
                      <p className="text-gray-600 text-sm">{problem.statement}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/my-events')}>
          Back to My Events
        </Button>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex-1 space-y-2">
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">{eventDetails.name}</h2>
          <p className="text-lg text-gray-600 mt-2">{eventDetails.description}</p>
          <div className="flex items-center gap-2 text-gray-500 font-medium text-sm mt-3">
            <Mail className="w-4 h-4" />
            <span>{eventDetails.contactEmail}</span>
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-2">
          <Badge variant={statusVariants[eventDetails.status?.toLowerCase()] || 'info'} className="mb-2">
            {eventDetails.status?.replace(/_/g, ' ') || 'Status N/A'}
          </Badge>
          <div className="flex items-center justify-center w-24 h-24 bg-orange-50 rounded-full border-4 border-orange-100 text-orange-500">
            <Award className="w-12 h-12" />
          </div>
        </div>
      </div>

      <Tabs tabs={tabs} />
    </div>
  );
};

export default EventDetails;
