import React from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';

/**
 * Props:
 *   confirm        – { open, currentLabel, nextLabel, desc }
 *   advancing      – boolean
 *   error          – string
 *   onCancel       – () => void
 *   onConfirm      – async () => void  (parent handles API call + state update)
 */
export default function AdvanceStatusModal({ confirm, advancing, error, onCancel, onConfirm }) {
  if (!confirm.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        onClick={() => !advancing && onCancel()}
      />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        {/* Header */}
        <div className="px-7 pt-7 pb-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center shrink-0">
              <ChevronRight className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Advance Event Status</h3>
          </div>
          {/* Transition arrow */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3 mb-4">
            <span className="text-sm font-semibold text-gray-500 truncate">{confirm.currentLabel}</span>
            <ArrowRight className="w-4 h-4 text-orange-500 shrink-0" />
            <span className="text-sm font-bold text-orange-600 truncate">{confirm.nextLabel}</span>
          </div>
          {/* Description */}
          <p className="text-sm text-gray-600 leading-relaxed">{confirm.desc}</p>
          {/* Warning */}
          <div className="flex items-start gap-2 mt-4 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
            <span className="text-amber-500 text-base leading-none mt-0.5">⚠</span>
            <p className="text-xs text-amber-700 font-medium">
              This action is irreversible. The event status cannot be rolled back.
            </p>
          </div>
          {error && <p className="mt-3 text-sm text-red-500 font-medium">{error}</p>}
        </div>
        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-7 pb-7">
          <button
            onClick={onCancel}
            disabled={advancing}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={advancing}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-60 transition-colors flex items-center gap-2"
          >
            {advancing
              ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Advancing…</>
              : <><ChevronRight className="w-4 h-4" />Confirm Advance</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
