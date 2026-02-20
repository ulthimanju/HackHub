import React, { useState } from 'react';
import { Users, UserCheck, UserX } from 'lucide-react';
import Alert from '../../../common/Alert/Alert';

const formatDateShort = (d) => {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const STATUS_CONFIG = {
  PENDING:  { label: 'Pending',  cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  APPROVED: { label: 'Approved', cls: 'bg-green-50 text-green-700 border-green-200' },
  REJECTED: { label: 'Rejected', cls: 'bg-red-50 text-red-600 border-red-200' },
};

const FILTERS = [
  { label: 'All',      value: 'all' },
  { label: 'Pending',  value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
];

/**
 * Props:
 *   registrations      – array
 *   loading            – boolean
 *   error              – string
 *   updatingId         – string|null
 *   statusUpdateError  – string
 *   onStatusUpdate     – async (registrationId, status) => void
 */
export default function RegistrationsTab({ registrations, loading, error, updatingId, statusUpdateError, onStatusUpdate }) {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? registrations : registrations.filter(r => r.status === filter);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 bg-orange-500 rounded-full" />
        <h3 className="text-lg font-bold text-gray-900">Participants</h3>
        {!loading && (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-orange-600 border border-orange-100">
            {registrations.length}
          </span>
        )}
      </div>

      {statusUpdateError && <Alert type="error" className="mb-2">{statusUpdateError}</Alert>}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
        </div>
      ) : error ? (
        <Alert type="error">{error}</Alert>
      ) : registrations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center">
            <Users className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-lg font-semibold text-gray-500">No participants yet</p>
          <p className="text-sm text-gray-400 max-w-xs">No one has registered for this event yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Filter tabs */}
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map((tab) => {
              const count = tab.value === 'all' ? registrations.length : registrations.filter(r => r.status === tab.value).length;
              const isActive = filter === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                    isActive
                      ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600'
                  }`}
                >
                  {tab.label}
                  {count > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Participant grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((reg) => {
              const sc = STATUS_CONFIG[reg.status] || STATUS_CONFIG.PENDING;
              const isUpdating = updatingId === reg.id;
              return (
                <div key={reg.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-orange-600">
                      {reg.username?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{reg.username || 'Unknown'}</p>
                    <p className="text-sm text-gray-400 truncate">{reg.userEmail}</p>
                  </div>
                  {/* Registered at */}
                  <div className="hidden sm:block text-right shrink-0">
                    <p className="text-xs text-gray-400">Registered</p>
                    <p className="text-xs font-medium text-gray-600">{formatDateShort(reg.registrationTime)}</p>
                  </div>
                  {/* Status badge */}
                  <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold border ${sc.cls}`}>
                    {sc.label}
                  </span>
                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {reg.status !== 'APPROVED' && (
                      <button
                        onClick={() => onStatusUpdate(reg.id, 'APPROVED')}
                        disabled={isUpdating}
                        title="Approve"
                        className="w-8 h-8 rounded-lg bg-green-50 hover:bg-green-100 flex items-center justify-center text-green-600 disabled:opacity-40 transition-colors"
                      >
                        {isUpdating
                          ? <div className="w-3.5 h-3.5 border-2 border-green-400 border-t-green-600 rounded-full animate-spin" />
                          : <UserCheck className="w-4 h-4" />}
                      </button>
                    )}
                    {reg.status !== 'REJECTED' && (
                      <button
                        onClick={() => onStatusUpdate(reg.id, 'REJECTED')}
                        disabled={isUpdating}
                        title="Reject"
                        className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 disabled:opacity-40 transition-colors"
                      >
                        {isUpdating
                          ? <div className="w-3.5 h-3.5 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                          : <UserX className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
