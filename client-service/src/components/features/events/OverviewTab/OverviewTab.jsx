import React from 'react';
import {
  CalendarDays, MapPin, Users, Mail, Trophy, BookOpen, Clock,
  Globe, ArrowRight, Check, ChevronRight,
} from 'lucide-react';

const formatDateShort = (d) => {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatTime = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
};

const FLOW = [
  { status: 'UPCOMING',          label: 'Upcoming',          next: 'Open Registration', desc: 'Participants will be able to see and register for this event.' },
  { status: 'REGISTRATION_OPEN', label: 'Registration Open', next: 'Start Event',       desc: 'Registration will close and the event will officially begin. No new registrations will be accepted.' },
  { status: 'ONGOING',           label: 'Ongoing',           next: 'Start Judging',     desc: 'Submissions will close and the event will move to the judging phase. Teams will no longer be able to submit.' },
  { status: 'JUDGING',           label: 'Judging',           next: 'Publish Results',   desc: 'Scores will be published and the leaderboard will become visible to all participants.' },
  { status: 'RESULTS_ANNOUNCED', label: 'Results Announced', next: 'Mark Completed',    desc: 'The event will be marked as fully completed. This is the final stage.' },
  { status: 'COMPLETED',         label: 'Completed',         next: null,                desc: '' },
];

/**
 * Props:
 *   event           – eventDetails object
 *   permissions     – from useEventPermissions
 *   advancingStatus – boolean
 *   advanceError    – string
 *   setConfirmAdvance – setter for confirmAdvance state in parent
 *   copiedEmail     – boolean
 *   copyEmail       – () => void
 */
export default function OverviewTab({ event, permissions, advancingStatus, advanceError, setConfirmAdvance, copiedEmail, copyEmail }) {
  const currentIdx = FLOW.findIndex(s => s.status === event.status);
  const current = FLOW[currentIdx];
  const canAdvance = current && current.next !== null;

  return (
    <div className="space-y-6">
      {/* ── Status Flow (event owner only) ───────────────────────────── */}
      {permissions.isEventOwner && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Event Status Flow</h3>
            {advanceError && <span className="text-xs text-red-500">{advanceError}</span>}
          </div>

          {/* Timeline */}
          <div className="flex items-center gap-0 mb-5 overflow-x-auto pb-1">
            {FLOW.map((step, idx) => {
              const isPast    = idx < currentIdx;
              const isCurrent = idx === currentIdx;
              return (
                <React.Fragment key={step.status}>
                  <div className="flex flex-col items-center min-w-[80px]">
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold border-2 transition-all ${
                      isPast    ? 'bg-orange-500 border-orange-500 text-white' :
                      isCurrent ? 'bg-orange-500 border-orange-500 text-white ring-4 ring-orange-100' :
                                  'bg-white border-gray-200 text-gray-400'
                    }`}>
                      {isPast ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    <p className={`text-[10px] font-medium text-center mt-1.5 leading-tight max-w-[72px] ${
                      isCurrent ? 'text-orange-600' : isPast ? 'text-gray-500' : 'text-gray-300'
                    }`}>{step.label}</p>
                  </div>
                  {idx < FLOW.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-1 mb-5 min-w-[12px] rounded ${idx < currentIdx ? 'bg-orange-400' : 'bg-gray-100'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Advance button */}
          {canAdvance ? (
            <button
              disabled={advancingStatus}
              onClick={() => {
                const next = FLOW[currentIdx + 1];
                setConfirmAdvance({ open: true, currentLabel: current.label, nextLabel: next.label, desc: current.desc });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {advancingStatus ? 'Advancing…' : (
                <><ChevronRight className="w-4 h-4" /> Advance to {FLOW[currentIdx + 1]?.label}</>
              )}
            </button>
          ) : (
            <span className="text-xs text-gray-400 font-medium">Event is complete — no further transitions.</span>
          )}
        </div>
      )}

      {/* Section title */}
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 bg-orange-500 rounded-full" />
        <h3 className="text-lg font-bold text-gray-900">Key Information</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Description + Theme */}
        {(event.description || event.theme) && (
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm sm:col-span-2 lg:col-span-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4 text-orange-500" />
              </div>
              <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">Description</p>
            </div>
            {event.description && <p className="text-gray-700 leading-relaxed">{event.description}</p>}
            {event.theme && (
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                <Globe className="w-4 h-4 text-orange-500 shrink-0" />
                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mr-2">Theme</p>
                <p className="text-sm font-semibold text-gray-800">{event.theme}</p>
              </div>
            )}
          </div>
        )}

        {/* Registration Timeline */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-orange-500" />
            </div>
            <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">Registration Timeline</p>
          </div>
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-gray-400 mb-1">Opens</p>
              <p className="text-lg font-bold text-gray-900">{formatDateShort(event.registrationStartDate)}</p>
              <p className="text-sm text-gray-500">{formatTime(event.registrationStartDate)}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 shrink-0" />
            <div>
              <p className="text-xs text-gray-400 mb-1">Closes</p>
              <p className="text-lg font-bold text-gray-900">{formatDateShort(event.registrationEndDate)}</p>
              <p className="text-sm text-gray-500">{formatTime(event.registrationEndDate)}</p>
            </div>
          </div>
        </div>

        {/* Event Date */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
              <CalendarDays className="w-4 h-4 text-orange-500" />
            </div>
            <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">Event Date</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatDateShort(event.startDate)}</p>
          <div className="flex items-center gap-1.5 mt-2 text-sm text-orange-500">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>{formatTime(event.startDate)} - {formatTime(event.endDate)}</span>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-orange-500" />
            </div>
            <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">Location</p>
          </div>
          <p className="text-xl font-bold text-gray-900">{event.isVirtual ? 'Virtual' : 'Offline'}</p>
          {(event.location || event.venue) && (
            <p className="text-sm text-gray-500 mt-1">{event.location || event.venue}</p>
          )}
        </div>

        {/* Max Participants */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-orange-500" />
            </div>
            <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">Max Participants</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{event.maxParticipants || '∞'}</p>
          {event.maxParticipants && event.teamSize && (
            <p className="text-sm text-gray-500 mt-1">
              {Math.floor(event.maxParticipants / event.teamSize)} teams of {event.teamSize}
            </p>
          )}
        </div>

        {/* Team Size */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-orange-500" />
            </div>
            <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">Team Size</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {event.teamSize ? `${event.teamSize} member${event.teamSize > 1 ? 's' : ''}` : 'N/A'}
          </p>
          {event.teamSize && (
            <span className="inline-block mt-3 px-3 py-1 rounded-full text-sm font-semibold bg-orange-50 text-orange-600 border border-orange-100">
              {event.teamSize === 1 ? 'Solo' : event.teamSize === 2 ? 'Duo' : event.teamSize === 3 ? 'Trio' : 'Team'}
            </span>
          )}
        </div>

        {/* Contact Email */}
        {event.contactEmail && (
          <div
            onClick={copyEmail}
            title={copiedEmail ? 'Copied!' : 'Click to copy email'}
            className="relative bg-white rounded-2xl p-4 border border-gray-100 shadow-sm cursor-pointer hover:border-orange-200 hover:shadow-md transition-all"
          >
            {copiedEmail && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-green-50 rounded-full flex items-center justify-center">
                <Check className="w-3.5 h-3.5 text-green-600" />
              </div>
            )}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-orange-500" />
              </div>
              <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">Contact</p>
            </div>
            <p className={`font-medium break-all text-sm ${copiedEmail ? 'text-green-600' : 'text-gray-900'}`}>
              {event.contactEmail}
            </p>
          </div>
        )}
      </div>

      {/* Prizes */}
      {event.prizes && event.prizes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-orange-500 rounded-full" />
            <h3 className="text-lg font-bold text-gray-900">Prizes</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {event.prizes.map((prize, index) => (
              <div key={index} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                  <Trophy className="w-4 h-4 text-green-500" />
                </div>
                <span className="text-sm text-gray-700">{prize}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rules & Guidelines */}
      {event.rules && event.rules.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-orange-500 rounded-full" />
            <h3 className="text-lg font-bold text-gray-900">Rules & Guidelines</h3>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {event.rules.map((rule, index) => (
              <div key={index} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 text-purple-500" />
                </div>
                <span className="text-sm text-gray-700 leading-relaxed">{rule}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
