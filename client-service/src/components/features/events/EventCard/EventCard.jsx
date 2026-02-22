import React, { memo } from 'react';
import { CalendarDays, Globe, MapPin, Flag, Tag, ArrowRight } from 'lucide-react';

const STATUS_VARIANTS = {
  upcoming:           { label: 'Upcoming',           color: 'text-blue-600 border-blue-100 bg-blue-50' },
  registration_open:  { label: 'Registration Open',  color: 'text-green-600 border-green-100 bg-green-50' },
  ongoing:            { label: 'Ongoing',             color: 'text-brand-600 border-brand-100 bg-brand-50' },
  judging:            { label: 'Judging',             color: 'text-amber-600 border-amber-100 bg-amber-50' },
  results_announced:  { label: 'Results Announced',  color: 'text-teal-600 border-teal-100 bg-teal-50' },
  completed:          { label: 'Completed',           color: 'text-ink-muted border-surface-border bg-surface-hover' },
};

const formatDateRange = (start, end) => {
  const opts = { day: 'numeric', month: 'short', year: 'numeric' };
  const s = start ? new Date(start).toLocaleDateString('en-GB', opts) : 'TBD';
  const e = end   ? new Date(end).toLocaleDateString('en-GB', opts)   : 'TBD';
  return `${s} – ${e}`;
};

const getDaysLeft = (endDate) => {
  if (!endDate) return null;
  return Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
};

/**
 * Props:
 *   event             – EventResponse object
 *   user              – current user
 *   registrationStatus – { status: 'PENDING'|'APPROVED'|'REJECTED' } or null
 *   onJoin            – fn(eventId) navigate to event
 *   onManage          – fn(eventId) navigate to event (organizer)
 *   canRegister       – boolean — show Register Now button
 *   onRegister        – fn() open registration modal
 */
const EventCard = memo(({ event, user, registrationStatus, onJoin, onManage, canRegister, onRegister }) => {
  const isOrganizer = event.organizerId === user?.id;
  const eventStatus = event.status?.toLowerCase() || 'upcoming';
  const statusCfg   = STATUS_VARIANTS[eventStatus] || STATUS_VARIANTS.upcoming;

  const daysLeft   = getDaysLeft(event.endDate);
  const location   = event.isVirtual ? 'Online' : (event.location || event.venue || 'Offline');
  const themes     = event.theme ? event.theme.split(',').map(t => t.trim()).filter(Boolean) : [];

  return (
    <div
      className="bg-white border border-surface-border rounded-xl shadow-card cursor-pointer hover:shadow-card-hover hover:border-brand-200 transition-all group"
      onClick={() => isOrganizer ? onManage?.(event.id) : onJoin?.(event.id)}
    >
      <div className="p-5 space-y-3">
        {/* Header: title + status */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-ink-primary font-display leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors flex-1">
            {event.name}
          </h3>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-md border shrink-0 ${statusCfg.color}`}>
            {statusCfg.label}
          </span>
        </div>

        {/* Location + days left */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1.5 text-sm text-ink-secondary">
            {event.isVirtual
              ? <Globe className="w-3.5 h-3.5 text-ink-muted shrink-0" />
              : <MapPin className="w-3.5 h-3.5 text-ink-muted shrink-0" />}
            {location}
          </span>
          {daysLeft !== null && daysLeft > 0 ? (
            <span className="inline-flex items-center gap-1 bg-teal-500 text-white text-xs font-medium px-2.5 py-0.5 rounded-md shrink-0">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              {daysLeft}d left
            </span>
          ) : daysLeft !== null && daysLeft <= 0 ? (
            <span className="inline-flex items-center gap-1 bg-surface-hover text-ink-muted text-xs font-medium px-2.5 py-0.5 rounded-md shrink-0">Ended</span>
          ) : null}
        </div>

        {/* Date range */}
        <div className="flex items-center gap-1.5 text-ink-muted text-xs">
          <CalendarDays className="w-3.5 h-3.5 shrink-0" />
          <span>{formatDateRange(event.startDate, event.endDate)}</span>
        </div>

        {/* Participants */}
        {event.maxParticipants && (
          <div className="flex items-center gap-4 flex-wrap text-sm">
            <span className="text-ink-muted">
              <span className="font-medium text-ink-primary">{event.registeredCount ?? 0}/{event.maxParticipants}</span>
              {' '}participants
            </span>
          </div>
        )}

        {/* Theme tags */}
        {themes.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Tag className="w-3.5 h-3.5 text-ink-muted shrink-0" />
            {themes.map(t => (
              <span key={t} className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-md">
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Footer: register or view arrow */}
        <div className="flex items-center justify-between pt-1">
          {canRegister ? (
            <button
              onClick={e => { e.stopPropagation(); onRegister?.(); }}
              className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-medium rounded-lg transition-colors active:scale-[0.98]"
            >
              Register Now
            </button>
          ) : (
            <span />
          )}
          <span className="text-xs text-brand-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
            {isOrganizer ? 'Manage' : 'View'} <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
});

EventCard.displayName = 'EventCard';
export default EventCard;
