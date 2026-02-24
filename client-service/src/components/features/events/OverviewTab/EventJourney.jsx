import React from 'react';
import {
  ClipboardList, CalendarCheck, Rocket, FlagTriangleRight, Trophy,
} from 'lucide-react';

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

/**
 * Props:
 *   event
 */
export default function EventJourney({ event }) {
  const currentMilestone = CURRENT_MILESTONE[event.status] ?? -1;
  const currentIdx = FLOW.findIndex(s => s.status === event.status);

  const milestones = [
    { icon: ClipboardList,     label: 'Registration Opens',   date: event.registrationStartDate },
    { icon: CalendarCheck,     label: 'Registration Closes',  date: event.registrationEndDate   },
    { icon: Rocket,            label: 'Event Starts',         date: event.startDate             },
    { icon: FlagTriangleRight, label: 'Submission Deadline',  date: event.endDate               },
    { icon: Trophy,            label: 'Results Announced',    date: event.resultsDate || null   },
  ];

  return (
    <div className="bg-white rounded-xl border border-surface-border shadow-card p-4 h-full flex flex-col">
      <p className="text-xxs font-semibold tracking-widest text-ink-muted uppercase mb-3">
        Event Journey
      </p>

      {/* Milestones */}
      <div className="relative space-y-0 flex-1">
        {milestones.map((m, idx) => {
          const isPast    = idx < currentMilestone;
          const isCurrent = idx === currentMilestone;
          const Icon = m.icon;

          return (
            <div key={idx} className="relative flex gap-2.5">
              {/* Vertical line */}
              {idx < milestones.length - 1 && (
                <div className={`absolute left-[13px] top-6 w-0.5 h-[calc(100%-2px)] ${
                  isPast ? 'bg-orange-200' : 'bg-surface-border'
                }`} />
              )}

              {/* Icon dot */}
              <div className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 mt-0.5 transition-all ${
                isPast    ? 'bg-orange-100 border-orange-300' :
                isCurrent ? 'bg-green-50 border-green-400 shadow-sm' :
                            'bg-white border-surface-border'
              }`}>
                <Icon className={`w-3 h-3 ${
                  isPast    ? 'text-orange-500' :
                  isCurrent ? 'text-green-500' :
                              'text-ink-disabled'
                }`} />
              </div>

              {/* Content */}
              <div className="pb-3 min-w-0">
                <p className={`text-xs font-medium leading-tight ${
                  isCurrent ? 'text-green-700 font-semibold' :
                  isPast    ? 'text-orange-600' :
                              'text-ink-disabled'
                }`}>
                  {m.label}
                  {isCurrent && (
                    <span className="ml-1.5 inline-block px-1.5 py-0.5 rounded text-xxs bg-green-50 text-green-600 font-semibold align-middle border border-green-200">
                      Now
                    </span>
                  )}
                </p>
                {m.date ? (
                  <p className={`text-xxs mt-0.5 ${isPast ? 'text-orange-400' : isCurrent ? 'text-green-600' : 'text-ink-disabled'}`}>
                    {formatDate(m.date)}
                    {formatTime(m.date) && <span className="ml-1">{formatTime(m.date)}</span>}
                  </p>
                ) : (
                  <p className="text-xxs mt-0.5 text-ink-disabled italic">TBD</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
