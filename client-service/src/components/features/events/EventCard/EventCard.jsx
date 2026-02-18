import React from 'react';
import { CalendarDays, MapPin, Users, Crown } from 'lucide-react';
import Badge from '../../../common/Badge/Badge';
import Button from '../../../common/Button/Button';

const EventCard = ({ event, onJoin, onManage }) => {
  const isOrganizer = event.organizerId === 'current_user_id'; // Placeholder for actual user check
  const eventStatus = event.status?.toLowerCase() || 'upcoming';

  const statusVariants = {
    upcoming: 'blue',
    'registration_open': 'success',
    ongoing: 'orange',
    completed: 'secondary',
    cancelled: 'danger'
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col transition-all hover:shadow-lg hover:border-orange-200">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-900 line-clamp-2">{event.name}</h3>
        <Badge variant={statusVariants[eventStatus] || 'info'}>
          {eventStatus.replace(/_/g, ' ')}
        </Badge>
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-3">{event.description || 'No description provided.'}</p>

      <div className="space-y-2 text-sm text-gray-700 mb-6">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-orange-500" />
          <span>{formatDate(event.startDate)} - {formatDate(event.endDate)}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-orange-500" />
          <span>{event.isVirtual ? 'Virtual' : event.location || 'Offline'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-orange-500" />
          <span>Team Size: {event.teamSize || 'N/A'}</span>
        </div>
        {isOrganizer && (
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-purple-500" />
            <span className="font-semibold text-purple-700">Organizer</span>
          </div>
        )}
      </div>

      <div className="mt-auto flex gap-3">
        {isOrganizer ? (
          <Button variant="secondary" fullWidth onClick={() => onManage(event.id)}>
            Manage Event
          </Button>
        ) : (
          <Button variant="primary" fullWidth onClick={() => onJoin(event.id)}>
            View Event Details
          </Button>
        )}
      </div>
    </div>
  );
};

export default EventCard;
