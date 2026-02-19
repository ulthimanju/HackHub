import React, { memo } from 'react';
import { CalendarDays, MapPin, Crown, Clock, CheckCircle2, XCircle } from 'lucide-react';
import Badge from '../../../common/Badge/Badge';

const REG_STATUS_CONFIG = {
  PENDING:  { label: 'Pending Approval', cls: 'text-yellow-600 bg-yellow-50 border-yellow-100', Icon: Clock },
  APPROVED: { label: 'Approved',         cls: 'text-green-600 bg-green-50 border-green-100',   Icon: CheckCircle2 },
  REJECTED: { label: 'Rejected',         cls: 'text-red-500 bg-red-50 border-red-100',         Icon: XCircle },
};

const statusVariants = {
  upcoming: 'blue',
  registration_open: 'success',
  ongoing: 'orange',
  judging: 'warning',
  results_announced: 'info',
  completed: 'secondary',
};

const formatDate = (dateString) => {
  if (!dateString) return 'TBD';
  return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const EventCard = memo(({ event, user, registrationStatus, onJoin, onManage }) => {
  const isOrganizer = event.organizerId === user?.id;
  const eventStatus = event.status?.toLowerCase() || 'upcoming';

  return (
    <div
      className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex flex-col cursor-pointer hover:shadow-md hover:border-orange-200 transition-all"
      onClick={() => isOrganizer ? onManage(event.id) : onJoin(event.id)}
    >
      {/* Title + statuses */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-snug">{event.name}</h3>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {!isOrganizer && registrationStatus && (() => {
            const cfg = REG_STATUS_CONFIG[registrationStatus.status] || REG_STATUS_CONFIG.PENDING;
            return (
              <div className={`flex items-center gap-1 text-xs font-semibold border px-2 py-0.5 rounded-full ${cfg.cls}`}>
                <cfg.Icon className="w-3 h-3" />
                {cfg.label}
              </div>
            );
          })()}
          <Badge variant={statusVariants[eventStatus] || 'info'}>
            {eventStatus.replace(/_/g, ' ')}
          </Badge>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
        {event.description || 'No description provided.'}
      </p>

      {/* Meta info */}
      <div className="space-y-1.5 text-sm text-gray-600 mb-5">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-orange-400 shrink-0" />
          <span className="truncate">{formatDate(event.startDate)}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
          <span className="truncate">{event.isVirtual ? 'Virtual' : event.location || event.venue || 'Offline'}</span>
        </div>
        {isOrganizer && (
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="font-semibold text-purple-600">Organizer</span>
          </div>
        )}
      </div>

      {/* Footer — organizer label only */}
      {isOrganizer && (
        <div className="mt-auto pt-3 border-t border-gray-100">
          <span className="text-xs font-semibold text-purple-500 uppercase tracking-wide">Your Event</span>
        </div>
      )}
    </div>
  );
});
EventCard.displayName = 'EventCard';
export default EventCard;
