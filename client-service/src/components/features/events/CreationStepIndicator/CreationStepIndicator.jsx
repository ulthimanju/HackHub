import React from 'react';
import { Check } from 'lucide-react';

const STEPS = [
  { id: 'details',  label: 'Event Details' },
  { id: 'problems', label: 'Problem Statements' },
  { id: 'complete', label: 'Done' },
];

/**
 * Horizontal step indicator for the event creation wizard.
 *
 * @param {{ currentStep: 'details'|'problems'|'complete' }} props
 */
export default function CreationStepIndicator({ currentStep }) {
  const currentIdx = STEPS.findIndex(s => s.id === currentStep);

  return (
    <div className="flex items-center">
      {STEPS.map((step, idx) => {
        const isCompleted = idx < currentIdx;
        const isActive    = idx === currentIdx;

        return (
          <React.Fragment key={step.id}>
            <div className="flex items-center gap-2 shrink-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                isCompleted ? 'bg-brand-500 text-white' :
                isActive    ? 'bg-brand-100 text-brand-600 ring-2 ring-brand-400' :
                              'bg-surface-hover text-ink-disabled'
              }`}>
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${
                isActive    ? 'text-ink-primary' :
                isCompleted ? 'text-ink-secondary' :
                              'text-ink-disabled'
              }`}>
                {step.label}
              </span>
            </div>

            {idx < STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-3 min-w-8 transition-colors ${
                idx < currentIdx ? 'bg-brand-400' : 'bg-surface-border'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
