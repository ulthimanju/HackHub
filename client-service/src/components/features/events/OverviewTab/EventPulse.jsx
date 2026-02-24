import React, { useState, useEffect } from 'react';
import {
  Clock, CheckCircle2, ChevronRight, ToggleLeft, ToggleRight,
} from 'lucide-react';
import Button from '../../../common/Button/Button';
import eventService from '../../../../services/eventService';
import { STATUS_ORDER, STATUS_META, ADVANCE_INFO } from '@/constants/eventPhases';

const FLOW = STATUS_ORDER.map(s => ({ status: s, shortLabel: STATUS_META[s].shortLabel }));


const STATUS_COLORS = {
  UPCOMING:          { accent: 'bg-blue-400',   badge: 'bg-blue-50 text-blue-700 border-blue-200',   dot: 'bg-blue-500'   },
  REGISTRATION_OPEN: { accent: 'bg-green-400',  badge: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500'  },
  ONGOING:           { accent: 'bg-orange-400', badge: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  JUDGING:           { accent: 'bg-yellow-400', badge: 'bg-yellow-50 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500' },
  RESULTS_ANNOUNCED: { accent: 'bg-purple-400', badge: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  COMPLETED:         { accent: 'bg-gray-300',   badge: 'bg-gray-50 text-gray-600 border-gray-200',   dot: 'bg-gray-400'   },
};

function getCountdownInfo(event) {
  const map = {
    UPCOMING:          { label: 'Registration opens in', date: event.registrationStartDate },
    REGISTRATION_OPEN: { label: 'Registration closes in', date: event.registrationEndDate },
    ONGOING:           { label: 'Submissions close in', date: event.endDate },
  };
  return map[event.status] || null;
}

function getRemaining(targetDate) {
  if (!targetDate) return null;
  const diff = new Date(targetDate) - Date.now();
  if (diff <= 0) return null;
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  };
}

function CountdownUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center min-w-[44px]">
      <span className="text-2xl font-bold text-ink-primary font-display tabular-nums leading-none">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-xxs text-ink-muted uppercase tracking-wider mt-0.5">{label}</span>
    </div>
  );
}

/**
 * Props:
 *   event, permissions, myRegistration
 *   advancingStatus, advanceError, setConfirmAdvance
 *   onEditClick, onSwitchToTeamTab
 */
export default function EventPulse({
  event,
  permissions,
  myRegistration,
  advancingStatus,
  advanceError,
  setConfirmAdvance,
  onEditClick,
  onSwitchToTeamTab,
}) {
  const currentIdx = FLOW.findIndex(s => s.status === event.status);
  const colors = STATUS_COLORS[event.status] || STATUS_COLORS.COMPLETED;
  const canAdvance = currentIdx >= 0 && currentIdx < FLOW.length - 1;
  const advanceInfo = ADVANCE_INFO[event.status];

  // Judging toggle
  const [judgingEnabled, setJudgingEnabled] = useState(event.judging !== false);
  const [togglingJudging, setTogglingJudging] = useState(false);
  const handleToggleJudging = async () => {
    setTogglingJudging(true);
    try {
      const result = await eventService.toggleJudging(event.id);
      setJudgingEnabled(result === 'JUDGING_ENABLED');
    } catch { /* ignore */ } finally { setTogglingJudging(false); }
  };

  // Countdown
  const countdownInfo = getCountdownInfo(event);
  const [remaining, setRemaining] = useState(() =>
    countdownInfo ? getRemaining(countdownInfo.date) : null
  );
  useEffect(() => {
    if (!countdownInfo?.date) return;
    setRemaining(getRemaining(countdownInfo.date));
    const interval = setInterval(() => setRemaining(getRemaining(countdownInfo.date)), 1000);
    return () => clearInterval(interval);
  }, [countdownInfo?.date]);

  // Participant smart CTA
  const participantCTA = () => {
    if (event.status === 'REGISTRATION_OPEN' && !myRegistration) {
      return <Button size="sm" onClick={onSwitchToTeamTab}>Register Now</Button>;
    }
    if (myRegistration?.status === 'PENDING') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-50 text-yellow-700 border border-yellow-200 text-sm font-medium">
          <Clock className="w-3.5 h-3.5" /> Registration Pending
        </span>
      );
    }
    if (myRegistration?.status === 'APPROVED') {
      return <Button size="sm" onClick={onSwitchToTeamTab}>Go to My Team</Button>;
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-surface-border shadow-card overflow-hidden">
      {/* Status accent top bar */}
      <div className={`h-1 w-full ${colors.accent}`} />

      <div className="p-5 space-y-4">
        {/* Row 1: Status badge + participant CTA */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-semibold ${colors.badge}`}>
            <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
            {event.status?.replace(/_/g, ' ')}
          </div>

          {!permissions.isEventOwner && (
            <div className="flex items-center gap-2 flex-wrap">
              {participantCTA()}
            </div>
          )}
        </div>

        {/* Row 2: Countdown */}
        {countdownInfo && remaining ? (
          <div className="flex items-center gap-5 flex-wrap pt-1">
            <div className="flex items-center gap-1.5 text-xs text-ink-muted min-w-fit">
              <Clock className="w-3.5 h-3.5 text-brand-400" />
              <span className="font-medium">{countdownInfo.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <CountdownUnit value={remaining.d} label="days" />
              <span className="text-lg font-bold text-ink-muted">:</span>
              <CountdownUnit value={remaining.h} label="hrs" />
              <span className="text-lg font-bold text-ink-muted">:</span>
              <CountdownUnit value={remaining.m} label="min" />
              <span className="text-lg font-bold text-ink-muted">:</span>
              <CountdownUnit value={remaining.s} label="sec" />
            </div>
          </div>
        ) : event.status === 'COMPLETED' ? (
          <p className="text-xs text-green-600 font-medium flex items-center gap-1.5 pt-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> This event has concluded.
          </p>
        ) : null}

        {/* Row 4: Organizer advance controls */}
        {permissions.isEventOwner && (
          <div className="pt-2 border-t border-surface-border">
            {canAdvance && advanceInfo ? (
              <div className="flex items-center gap-3 flex-wrap">
                {advanceError && <span className="text-xs text-red-500 w-full">{advanceError}</span>}
                <button
                  disabled={advancingStatus}
                  onClick={() => {
                    const next = FLOW[currentIdx + 1];
                    setConfirmAdvance({
                      open: true,
                      currentLabel: FLOW[currentIdx].shortLabel,
                      nextLabel: next.shortLabel,
                      desc: advanceInfo.desc,
                    });
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  {advancingStatus
                    ? 'Advancing…'
                    : <><ChevronRight className="w-4 h-4" /> Advance to {FLOW[currentIdx + 1]?.shortLabel}</>}
                </button>

                {event.status === 'ONGOING' && (
                  <button
                    disabled={togglingJudging}
                    onClick={handleToggleJudging}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors disabled:opacity-60 ${
                      judgingEnabled
                        ? 'border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100'
                        : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    {judgingEnabled
                      ? <><ToggleRight className="w-4 h-4" /> Judging: On</>
                      : <><ToggleLeft className="w-4 h-4" /> Judging: Off</>}
                  </button>
                )}
              </div>
            ) : (
              <p className="text-xs text-ink-muted font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                Event is complete — no further transitions.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
