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

// Returns which milestone index is "current" based on event status
const CURRENT_MILESTONE = {
  UPCOMING:          0,
  REGISTRATION_OPEN: 1,
  ONGOING:           2,
  JUDGING:           3,
  RESULTS_ANNOUNCED: 4,
  COMPLETED:         5,
};

/**
 * Props:
 *   event – eventDetails object
 */
export default function EventJourney({ event }) {
  const currentMilestone = CURRENT_MILESTONE[event.status] ?? -1;

  const milestones = [
    {
      icon: ClipboardList,
      label: 'Registration Opens',
      date: event.registrationStartDate,
    },
    {
      icon: CalendarCheck,
      label: 'Registration Closes',
      date: event.registrationEndDate,
    },
    {
      icon: Rocket,
      label: 'Event Starts',
      date: event.startDate,
    },
    {
      icon: FlagTriangleRight,
      label: 'Submission Deadline',
      date: event.endDate,
    },
    {
      icon: Trophy,
      label: 'Results Announced',
      date: event.resultsDate || null,
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-surface-border shadow-card p-5 h-full">
      <p className="text-xxs font-semibold tracking-widest text-ink-muted uppercase mb-4">
        Event Journey
      </p>
      <div className="relative space-y-0">
        {milestones.map((m, idx) => {
          const isPast    = idx < currentMilestone;
          const isCurrent = idx === currentMilestone;
          const Icon = m.icon;

          return (
            <div key={idx} className="relative flex gap-3">
              {/* Vertical line */}
              {idx < milestones.length - 1 && (
                <div className={`absolute left-[15px] top-7 w-0.5 h-[calc(100%-4px)] ${
                  isPast ? 'bg-brand-300' : 'bg-surface-border'
                }`} />
              )}

              {/* Icon dot */}
              <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 mt-0.5 transition-all ${
                isPast    ? 'bg-brand-500 border-brand-500' :
                isCurrent ? 'bg-white border-brand-500 shadow-sm' :
                            'bg-white border-surface-border'
              }`}>
                <Icon className={`w-3.5 h-3.5 ${
                  isPast    ? 'text-white' :
                  isCurrent ? 'text-brand-500' :
                              'text-ink-disabled'
                }`} />
              </div>

              {/* Content */}
              <div className="pb-5 min-w-0">
                <p className={`text-sm font-medium leading-tight ${
                  isCurrent ? 'text-ink-primary font-semibold' :
                  isPast    ? 'text-ink-muted line-through decoration-ink-disabled' :
                              'text-ink-secondary'
                }`}>
                  {m.label}
                  {isCurrent && (
                    <span className="ml-2 inline-block px-1.5 py-0.5 rounded text-xxs bg-brand-50 text-brand-600 font-semibold align-middle">
                      Now
                    </span>
                  )}
                </p>
                {m.date ? (
                  <p className={`text-xs mt-0.5 ${isPast ? 'text-ink-disabled' : 'text-ink-muted'}`}>
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
    </div>
  );
}
