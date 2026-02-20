import React, { memo } from 'react';
import { CalendarDays, Globe, MapPin, Flag, Tag, Clock, CheckCircle2, XCircle } from 'lucide-react';

const STATUS_VARIANTS = {
  upcoming:           { label: 'Upcoming',           color: 'text-blue-600 border-blue-200 bg-blue-50' },
  registration_open:  { label: 'Registration Open',  color: 'text-green-600 border-green-200 bg-green-50' },
  ongoing:            { label: 'Ongoing',             color: 'text-orange-600 border-orange-200 bg-orange-50' },
  judging:            { label: 'Judging',             color: 'text-yellow-600 border-yellow-200 bg-yellow-50' },
  results_announced:  { label: 'Results Announced',  color: 'text-cyan-600 border-cyan-200 bg-cyan-50' },
  completed:          { label: 'Completed',           color: 'text-gray-500 border-gray-200 bg-gray-50' },
};

const REG_STATUS_CONFIG = {
  PENDING:  { label: 'Pending Approval', cls: 'text-yellow-600 bg-yellow-50 border-yellow-100', Icon: Clock },
  APPROVED: { label: 'Approved',         cls: 'text-green-600 bg-green-50 border-green-100',   Icon: CheckCircle2 },
  REJECTED: { label: 'Rejected',         cls: 'text-red-500 bg-red-50 border-red-100',         Icon: XCircle },
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

const getFirstPrize = (prizes) => prizes?.length ? prizes[0] : null;

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
  const prizeLabel = getFirstPrize(event.prizes);
  const location   = event.isVirtual ? 'Online' : (event.location || event.venue || 'Offline');
  const themes     = event.theme ? event.theme.split(',').map(t => t.trim()).filter(Boolean) : [];
  const regCfg     = registrationStatus ? (REG_STATUS_CONFIG[registrationStatus.status] || null) : null;

  return (
    <div
      className="bg-white border border-gray-100 rounded-3xl shadow-sm cursor-pointer hover:shadow-md hover:border-orange-200 transition-all overflow-hidden"
      onClick={() => isOrganizer ? onManage?.(event.id) : onJoin?.(event.id)}
    >
      <div className="flex">
        {/* ── Left column ── */}
        <div className="flex-1 p-5 space-y-3 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 leading-snug line-clamp-2">{event.name}</h3>

          {/* Days left + location */}
          <div className="flex items-center gap-3 flex-wrap">
            {daysLeft !== null && daysLeft > 0 ? (
              <span className="inline-flex items-center gap-1.5 bg-teal-500 text-white text-xs font-semibold px-3 py-1 rounded-full shrink-0">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
              </span>
            ) : daysLeft !== null && daysLeft <= 0 ? (
              <span className="inline-flex items-center gap-1.5 bg-gray-200 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full shrink-0">Ended</span>
            ) : null}
            <span className="flex items-center gap-1.5 text-sm text-gray-600">
              {event.isVirtual
                ? <Globe className="w-4 h-4 text-gray-400 shrink-0" />
                : <MapPin className="w-4 h-4 text-gray-400 shrink-0" />}
              {location}
            </span>
          </div>

          {/* Prizes + participants */}
          <div className="flex items-center gap-5 flex-wrap text-sm">
            {prizeLabel && (
              <span className="flex items-center gap-1 text-sm">
                <span className="font-bold text-gray-900">🏆</span>
                <span className="text-gray-700 truncate">{prizeLabel}</span>
              </span>
            )}
            {event.maxParticipants && (
              <span>
                <span className="font-bold text-gray-900">{event.registeredCount ?? 0}/{event.maxParticipants}</span>
                {' '}<span className="text-gray-500">participants</span>
              </span>
            )}
          </div>

          {/* Registration status */}
          {regCfg && (
            <div className={`inline-flex items-center gap-1 text-xs font-semibold border px-2 py-0.5 rounded-full ${regCfg.cls}`}>
              <regCfg.Icon className="w-3 h-3" />
              {regCfg.label}
            </div>
          )}

          {/* Register button */}
          {canRegister && (
            <div>
              <button
                onClick={e => { e.stopPropagation(); onRegister?.(); }}
                className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-full transition-colors"
              >
                Register Now
              </button>
            </div>
          )}
        </div>

        {/* ── Divider ── */}
        <div className="w-px bg-gray-100 self-stretch my-4" />

        {/* ── Right column ── */}
        <div className="w-52 shrink-0 p-5 space-y-3">
          {/* Status pill */}
          <div className="flex items-center gap-2">
            <Flag className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusCfg.color}`}>
              {statusCfg.label}
            </span>
          </div>

          {/* Date range */}
          <div className="flex items-start gap-2 text-gray-600">
            <CalendarDays className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
            <span className="text-xs leading-snug">{formatDateRange(event.startDate, event.endDate)}</span>
          </div>

          {/* Theme tags */}
          {themes.length > 0 && (
            <div className="flex items-start gap-2">
              <Tag className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
              <div className="flex flex-wrap gap-1">
                {themes.map(t => (
                  <span key={t} className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

EventCard.displayName = 'EventCard';
export default EventCard;
