import React, { useState } from 'react';
import {
  ClipboardList, CalendarCheck, Rocket, FlagTriangleRight, Trophy,
  ChevronRight, CheckCircle2, ToggleLeft, ToggleRight,
} from 'lucide-react';
import eventService from '../../../../services/eventService';

const formatDate = (d) => {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatTime = (d) => {
  if (!d) return null;
  return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
};

const CURRENT_MILESTONE = {
  UPCOMING:          0,
  REGISTRATION_OPEN: 1,
  ONGOING:           2,
  JUDGING:           3,
  RESULTS_ANNOUNCED: 4,
  COMPLETED:         5,
};

const FLOW = [
  { status: 'UPCOMING',          shortLabel: 'Upcoming' },
  { status: 'REGISTRATION_OPEN', shortLabel: 'Registration' },
  { status: 'ONGOING',           shortLabel: 'Ongoing' },
  { status: 'JUDGING',           shortLabel: 'Judging' },
  { status: 'RESULTS_ANNOUNCED', shortLabel: 'Results' },
  { status: 'COMPLETED',         shortLabel: 'Completed' },
];

const ADVANCE_INFO = {
  UPCOMING:          { desc: 'Participants will be able to see and register for this event.' },
  REGISTRATION_OPEN: { desc: 'Registration will close and the event will officially begin.' },
  ONGOING:           { desc: 'Submissions will close and the event will move to the judging phase.' },
  JUDGING:           { desc: 'Scores will be published and the leaderboard will become visible to all.' },
  RESULTS_ANNOUNCED: { desc: 'The event will be marked as fully completed. This is the final stage.' },
};

/**
 * Props:
 *   event, permissions
 *   advancingStatus, advanceError, setConfirmAdvance
 */
export default function EventJourney({ event, permissions, advancingStatus, advanceError, setConfirmAdvance }) {
  const currentMilestone = CURRENT_MILESTONE[event.status] ?? -1;
  const currentIdx = FLOW.findIndex(s => s.status === event.status);
  const canAdvance = currentIdx >= 0 && currentIdx < FLOW.length - 1;
  const advanceInfo = ADVANCE_INFO[event.status];

  const [judgingEnabled, setJudgingEnabled] = useState(event.judging !== false);
  const [togglingJudging, setTogglingJudging] = useState(false);
  const handleToggleJudging = async () => {
    setTogglingJudging(true);
    try {
      const result = await eventService.toggleJudging(event.id);
      setJudgingEnabled(result === 'JUDGING_ENABLED');
    } catch { /* ignore */ } finally { setTogglingJudging(false); }
  };

  const milestones = [
    { icon: ClipboardList,     label: 'Registration Opens',   date: event.registrationStartDate },
    { icon: CalendarCheck,     label: 'Registration Closes',  date: event.registrationEndDate   },
    { icon: Rocket,            label: 'Event Starts',         date: event.startDate             },
    { icon: FlagTriangleRight, label: 'Submission Deadline',  date: event.endDate               },
    { icon: Trophy,            label: 'Results Announced',    date: event.resultsDate || null   },
  ];

  return (
    <div className="bg-white rounded-xl border border-surface-border shadow-card p-5 h-full flex flex-col">
      <p className="text-xxs font-semibold tracking-widest text-ink-muted uppercase mb-4">
        Event Journey
      </p>

      {/* Milestones */}
      <div className="relative space-y-0 flex-1">
        {milestones.map((m, idx) => {
          const isPast    = idx < currentMilestone;
          const isCurrent = idx === currentMilestone;
          const Icon = m.icon;

          return (
            <div key={idx} className="relative flex gap-3">
              {/* Vertical line */}
              {idx < milestones.length - 1 && (
                <div className={`absolute left-[15px] top-7 w-0.5 h-[calc(100%-4px)] ${
                  isPast ? 'bg-orange-200' : 'bg-surface-border'
                }`} />
              )}

              {/* Icon dot */}
              <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 mt-0.5 transition-all ${
                isPast    ? 'bg-orange-100 border-orange-300' :
                isCurrent ? 'bg-green-50 border-green-400 shadow-sm' :
                            'bg-white border-surface-border'
              }`}>
                <Icon className={`w-3.5 h-3.5 ${
                  isPast    ? 'text-orange-500' :
                  isCurrent ? 'text-green-500' :
                              'text-ink-disabled'
                }`} />
              </div>

              {/* Content */}
              <div className="pb-5 min-w-0">
                <p className={`text-sm font-medium leading-tight ${
                  isCurrent ? 'text-green-700 font-semibold' :
                  isPast    ? 'text-orange-600' :
                              'text-ink-disabled'
                }`}>
                  {m.label}
                  {isCurrent && (
                    <span className="ml-2 inline-block px-1.5 py-0.5 rounded text-xxs bg-green-50 text-green-600 font-semibold align-middle border border-green-200">
                      Now
                    </span>
                  )}
                </p>
                {m.date ? (
                  <p className={`text-xs mt-0.5 ${isPast ? 'text-orange-400' : isCurrent ? 'text-green-600' : 'text-ink-disabled'}`}>
                    {formatDate(m.date)}
                    {formatTime(m.date) && <span className="ml-1.5">{formatTime(m.date)}</span>}
                  </p>
                ) : (
                  <p className="text-xs mt-0.5 text-ink-disabled italic">TBD</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Advance controls — organizer only */}
      {permissions?.isEventOwner && (
        <div className="pt-3 mt-1 border-t border-surface-border">
          {canAdvance && advanceInfo ? (
            <div className="flex flex-col gap-2">
              {advanceError && <span className="text-xs text-red-500">{advanceError}</span>}
              <div className="flex items-center gap-2 flex-wrap">
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
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  {advancingStatus
                    ? 'Advancing…'
                    : <><ChevronRight className="w-3.5 h-3.5" /> Advance to {FLOW[currentIdx + 1]?.shortLabel}</>}
                </button>

                {event.status === 'ONGOING' && (
                  <button
                    disabled={togglingJudging}
                    onClick={handleToggleJudging}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors disabled:opacity-60 ${
                      judgingEnabled
                        ? 'border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100'
                        : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    {judgingEnabled
                      ? <><ToggleRight className="w-3.5 h-3.5" /> Judging: On</>
                      : <><ToggleLeft className="w-3.5 h-3.5" /> Judging: Off</>}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-ink-muted font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              Event complete — no further transitions.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
