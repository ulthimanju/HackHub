import React, { memo, useState, useMemo } from 'react';
import { Users, UserCheck, UserX } from 'lucide-react';
import Alert from '../../../common/Alert/Alert';
import Pagination from '../../../common/Pagination/Pagination';
import { formatDateShort } from '../../../../utils/dateUtils';
import StatusBadge from '../../../common/StatusBadge/StatusBadge';

const FILTERS = [
  { label: 'All',      value: 'all' },
  { label: 'Pending',  value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
];

const PAGE_SIZE = 10;

/**
 * Props:
 *   registrations      – array
 *   loading            – boolean
 *   error              – string
 *   updatingId         – string|null
 *   statusUpdateError  – string
 *   onStatusUpdate     – async (registrationId, status) => void
 */
const RegistrationsTab = memo(function RegistrationsTab({ registrations, loading, error, updatingId, statusUpdateError, onStatusUpdate, canManageRegistrations = true }) {
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(0);

  const filtered = useMemo(
    () => filter === 'all' ? registrations : registrations.filter(r => r.status === filter),
    [registrations, filter]
  );

  // Reset page when filter changes
  React.useEffect(() => { setPage(0); }, [filter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-0.5 h-5 bg-brand-500 rounded-full" />
        <h3 className="text-base font-semibold text-ink-primary font-display">Participants</h3>
        {!loading && (
          <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-brand-50 text-brand-600 border border-brand-100">
            {registrations.length}
          </span>
        )}
      </div>

      {statusUpdateError && <Alert type="error" className="mb-2">{statusUpdateError}</Alert>}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : error ? (
        <Alert type="error">{error}</Alert>
      ) : registrations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-16 h-16 bg-surface-hover rounded-xl flex items-center justify-center">
            <Users className="w-8 h-8 text-ink-disabled" />
          </div>
          <p className="text-base font-semibold text-ink-muted">No participants yet</p>
          <p className="text-sm text-ink-muted max-w-xs">No one has registered for this event yet.</p>
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
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    isActive
                      ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                      : 'bg-white text-ink-secondary border-surface-border hover:border-brand-300 hover:text-brand-600'
                  }`}
                >
                  {tab.label}
                  {count > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-md font-semibold ${isActive ? 'bg-white/20 text-white' : 'bg-surface-hover text-ink-muted'}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Participant grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {paginated.map((reg) => {
              const isUpdating = updatingId === reg.id;
              return (
                <div key={reg.id} className="bg-white rounded-xl p-4 border border-surface-border shadow-card flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-brand-600">
                      {reg.username?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink-primary truncate">{reg.username || 'Unknown'}</p>
                    <p className="text-sm text-ink-muted truncate">{reg.userEmail}</p>
                  </div>
                  {/* Registered at */}
                  <div className="hidden sm:block text-right shrink-0">
                    <p className="text-xs text-ink-muted">Registered</p>
                    <p className="text-xs font-medium text-ink-secondary">{formatDateShort(reg.registrationTime)}</p>
                  </div>
                  {/* Status badge */}
                  <div className="shrink-0"><StatusBadge status={reg.status} /></div>
                  {/* Actions */}
                  {canManageRegistrations && (
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
                  )}
                </div>
              );
            })}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
          />
        </div>
      )}
    </div>
  );
});

RegistrationsTab.displayName = 'RegistrationsTab';
export default RegistrationsTab;
