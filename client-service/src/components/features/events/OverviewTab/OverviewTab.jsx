import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Users, Mail, BookOpen,
  Clock, Globe, Check, ArrowRight, Copy, Pencil,
} from 'lucide-react';
import EventJourney from './EventJourney';

const fmt = (d) => {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};
const fmtTime = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
};

function InfoCard({ icon: Icon, iconColor = 'bg-brand-50', iconText = 'text-brand-500', label, children, onClick, copied, className = '' }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-4 border border-surface-border shadow-card h-full ${onClick ? 'cursor-pointer hover:border-brand-200 hover:shadow-card-hover transition-all' : ''} ${className}`}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div className={`w-7 h-7 ${iconColor} rounded-lg flex items-center justify-center shrink-0`}>
          <Icon className={`w-3.5 h-3.5 ${iconText}`} />
        </div>
        <p className="text-xxs font-semibold tracking-widest text-ink-muted uppercase">{label}</p>
        {copied !== undefined && (
          <div className={`ml-auto w-5 h-5 rounded-full flex items-center justify-center transition-all ${copied ? 'bg-green-50' : 'bg-transparent'}`}>
            {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-ink-disabled" />}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

/**
 * Props:
 *   event, permissions, myRegistration
 *   advancingStatus, advanceError, setConfirmAdvance
 *   copiedEmail, copyEmail, onEditClick, onSwitchToTeamTab
 *   registrations, orgTeams
 */
export default function OverviewTab({
  event,
  permissions,
  myRegistration,
  advancingStatus,
  advanceError,
  setConfirmAdvance,
  copiedEmail,
  copyEmail,
  onSwitchToTeamTab,
}) {
  const navigate = useNavigate();
  return (
    <div className="space-y-5">

      {/* ── LAYER 1: The Narrative ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Description — large block (2/3) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-surface-border shadow-card p-5 h-full">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
                <BookOpen className="w-3.5 h-3.5 text-brand-500" />
              </div>
              <p className="text-xxs font-semibold tracking-widest text-ink-muted uppercase">Mission Objective</p>
              {permissions.isEventOwner && (
                <button
                  onClick={() => navigate(`/events/${event.id}/edit`)}
                  className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-600 border border-brand-200 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
                >
                  <Pencil className="w-3 h-3" /> Edit Event
                </button>
              )}
            </div>
            {event.description ? (
              <p className="text-ink-secondary leading-relaxed text-sm">{event.description}</p>
            ) : (
              <p className="text-sm text-ink-disabled italic">No description provided.</p>
            )}
            {event.theme && (
              <div className="mt-4 pt-4 border-t border-surface-border flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-brand-400 shrink-0" />
                <span className="text-xxs font-semibold tracking-widest text-ink-muted uppercase mr-2">Theme</span>
                <span className="text-sm font-semibold text-ink-primary">{event.theme}</span>
              </div>
            )}
          </div>
        </div>

        {/* Event Journey — medium block (1/3) */}
        <div className="lg:col-span-1">
          <EventJourney
            event={event}
            permissions={permissions}
            advancingStatus={advancingStatus}
            advanceError={advanceError}
            setConfirmAdvance={setConfirmAdvance}
          />
        </div>
      </div>

      {/* ── LAYER 3: Logistics Bento ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Location */}
        <InfoCard icon={MapPin} label="Location">
          <p className="text-lg font-bold text-ink-primary font-display">
            {event.isVirtual ? 'Virtual' : 'In-Person'}
          </p>
          {(event.location || event.venue) && (
            <p className="text-xs text-ink-secondary mt-1 line-clamp-2">{event.location || event.venue}</p>
          )}
        </InfoCard>

        {/* Team Size */}
        <InfoCard icon={Users} label="Team Size">
          <p className="text-2xl font-bold text-ink-primary font-display">
            {event.teamSize ?? '—'}
          </p>
          {event.teamSize && (
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-md text-xs font-medium bg-brand-50 text-brand-600 border border-brand-100">
              {event.teamSize === 1 ? 'Solo' : event.teamSize === 2 ? 'Duo' : event.teamSize === 3 ? 'Trio' : 'Team'}
            </span>
          )}
        </InfoCard>

        {/* Registration Window */}
        <InfoCard icon={Clock} label="Registration">
          <div className="flex items-start gap-3 text-sm">
            <div>
              <p className="text-xxs text-ink-muted mb-0.5">Opens</p>
              <p className="font-semibold text-ink-primary text-xs">{fmt(event.registrationStartDate)}</p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-ink-disabled shrink-0 mt-3" />
            <div>
              <p className="text-xxs text-ink-muted mb-0.5">Closes</p>
              <p className="font-semibold text-ink-primary text-xs">{fmt(event.registrationEndDate)}</p>
            </div>
          </div>
        </InfoCard>

        {/* Contact (click to copy) */}
        {event.contactEmail ? (
          <InfoCard
            icon={Mail}
            label="Contact"
            onClick={copyEmail}
            copied={copiedEmail}
          >
            <p className={`text-sm font-medium break-all leading-tight ${copiedEmail ? 'text-green-600' : 'text-ink-primary'}`}>
              {copiedEmail ? 'Copied!' : event.contactEmail}
            </p>
          </InfoCard>
        ) : (
          <InfoCard icon={Users} label="Max Participants">
            <p className="text-3xl font-bold text-ink-primary font-display">
              {event.maxParticipants || '∞'}
            </p>
            {event.maxParticipants && event.teamSize && (
              <p className="text-xs text-ink-secondary mt-1">
                ≈ {Math.floor(event.maxParticipants / event.teamSize)} teams
              </p>
            )}
          </InfoCard>
        )}
      </div>

      {/* ── ACTION LAYER ────────────────────────────────────────────────────── */}
      {/* Participant next steps */}
      {!permissions.isOrganizer && (
        <div className="bg-white rounded-xl border border-surface-border shadow-card p-4">
          <p className="text-xxs font-semibold tracking-widest text-ink-muted uppercase mb-3">Your Progress</p>
          <div className="flex items-center gap-4 flex-wrap">
            {[
              {
                label: 'Register',
                done: !!myRegistration,
                active: event.status === 'REGISTRATION_OPEN' && !myRegistration,
              },
              {
                label: 'Get Approved',
                done: myRegistration?.status === 'APPROVED',
                active: myRegistration?.status === 'PENDING',
              },
              {
                label: 'Join / Form Team',
                done: false,
                active: myRegistration?.status === 'APPROVED',
              },
            ].map((step, idx) => (
              <React.Fragment key={idx}>
                <div className={`flex items-center gap-2 text-sm font-medium ${
                  step.done   ? 'text-green-600' :
                  step.active ? 'text-brand-600' :
                                'text-ink-disabled'
                }`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    step.done   ? 'bg-green-500 border-green-500' :
                    step.active ? 'border-brand-400' :
                                  'border-surface-border'
                  }`}>
                    {step.done && <Check className="w-3 h-3 text-white" />}
                  </div>
                  {step.label}
                </div>
                {idx < 2 && <ArrowRight className="w-3.5 h-3.5 text-ink-disabled shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

