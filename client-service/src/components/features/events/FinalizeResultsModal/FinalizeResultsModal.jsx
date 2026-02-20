import React from 'react';
import { Flag } from 'lucide-react';

/**
 * Props:
 *   open       – boolean
 *   finalizing – boolean
 *   error      – string
 *   onCancel   – () => void
 *   onConfirm  – async () => void  (parent handles API call + state update)
 */
export default function FinalizeResultsModal({ open, finalizing, error, onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        onClick={() => !finalizing && onCancel()}
      />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        {/* Header */}
        <div className="px-7 pt-7 pb-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
              <Flag className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Finalize Results</h3>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            This will publish the final leaderboard and set the event status to{' '}
            <span className="font-semibold text-gray-800">Results Announced</span>. All participants
            will be notified and the leaderboard will become publicly visible.
          </p>
          <div className="flex items-start gap-2 mt-4 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
            <span className="text-red-500 text-base leading-none mt-0.5">⚠</span>
            <p className="text-xs text-red-700 font-medium">
              This action is irreversible. Results cannot be unpublished once finalized.
            </p>
          </div>
          {error && <p className="mt-3 text-sm text-red-500 font-medium">{error}</p>}
        </div>
        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-7 pb-7">
          <button
            onClick={onCancel}
            disabled={finalizing}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={finalizing}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 transition-colors flex items-center gap-2"
          >
            {finalizing
              ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Finalizing…</>
              : <><Flag className="w-4 h-4" />Finalize Results</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
