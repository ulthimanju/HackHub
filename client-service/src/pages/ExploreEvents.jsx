import React, { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEvents } from '@/hooks/useEvents';
import { useRegistration } from '@/hooks/useRegistration';
import Button from '@/components/common/Button/Button';
import Modal from '@/components/common/Modal/Modal';
import Alert from '@/components/common/Alert/Alert';
import EventCard from '@/components/features/events/EventCard/EventCard';
import EventFilters from '@/components/common/EventFilters/EventFilters';
import Pagination from '@/components/common/Pagination/Pagination';
import { CheckCircle2 } from 'lucide-react';
import { ALL_THEMES } from '@/constants/themes';

const STATUS_TABS = [
  { label: 'All',               value: 'all' },
  { label: 'Registration Open', value: 'registration_open' },
  { label: 'Upcoming',          value: 'upcoming' },
  { label: 'Ongoing',           value: 'ongoing' },
  { label: 'Judging',           value: 'judging' },
  { label: 'Results',           value: 'results_announced' },
  { label: 'Completed',         value: 'completed' },
];

const ExploreEvents = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const search = searchParams.get('q') || '';

  const [activeTab, setActiveTab]       = React.useState('all');
  const [activeThemes, setActiveThemes] = React.useState([]);

  const {
    filtered, paginatedEvents, loading, error,
    page, setPage, totalPages, tabCounts,
    registeredIds, registrationStatuses, markRegistered,
  } = useEvents({ search, activeTab, activeThemes });

  const {
    registerEvent, registering, registerError, registerSuccess,
    openModal, closeModal, handleRegister,
  } = useRegistration(user, markRegistered);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500 pb-20">
      <EventFilters
        tabs={STATUS_TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabCounts={tabCounts}
        themeItems={ALL_THEMES}
        activeThemes={activeThemes}
        onThemesChange={setActiveThemes}
      />

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-8 h-8 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : error ? (
        <Alert type="error">{error}</Alert>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <img
            src="https://illustrations.popsy.co/amber/digital-nomad.svg"
            alt=""
            className="w-44 h-44 object-contain"
            onError={e => { e.target.style.display = 'none'; }}
          />
          <p className="text-base font-semibold text-ink-muted">No events found</p>
          <p className="text-sm text-ink-muted max-w-xs">
            {search ? `No events match "${search}"` : 'There are no events in this category yet.'}
          </p>
          {(search || activeTab !== 'all' || activeThemes.length > 0) && (
            <Button variant="secondary" size="sm" onClick={() => { setActiveTab('all'); setActiveThemes([]); }}>
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedEvents.map(event => {
              const status      = event.status?.toLowerCase() || 'upcoming';
              const isRegistered = registeredIds.has(event.id);
              const myReg       = registrationStatuses[event.id];
              const canRegister = status === 'registration_open' && !isRegistered;
              return (
                <EventCard
                  key={event.id}
                  event={event}
                  user={user}
                  registrationStatus={myReg}
                  onJoin={(eventId) => navigate(`/events/${eventId}`)}
                  onManage={(eventId) => navigate(`/events/${eventId}`)}
                  canRegister={canRegister}
                  onRegister={() => openModal(event)}
                />
              );
            })}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={filtered.length}
            pageSize={12}
          />
        </>
      )}

      {/* Registration modal */}
      <Modal
        isOpen={!!registerEvent}
        onClose={closeModal}
        title={registerSuccess ? 'Registration Successful!' : 'Confirm Registration'}
        footer={
          !registerSuccess ? (
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={closeModal}>Cancel</Button>
              <Button variant="primary" onClick={handleRegister} disabled={registering}>
                {registering ? 'Registering…' : 'Confirm Registration'}
              </Button>
            </div>
          ) : (
            <div className="flex justify-end">
              <Button variant="primary" onClick={closeModal}>Done</Button>
            </div>
          )
        }
      >
        {registerSuccess ? (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-green-500" />
            </div>
            <div>
              <p className="text-base font-semibold text-ink-primary font-display">You're registered!</p>
              <p className="text-sm text-ink-muted mt-1">
                You have successfully registered for <span className="font-medium text-ink-secondary">{registerEvent?.name}</span>.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {registerError && <Alert type="error">{registerError}</Alert>}
            <p className="text-sm text-ink-secondary">
              You are about to register for <span className="font-medium text-ink-primary">{registerEvent?.name}</span>.
            </p>
            <div className="bg-surface-hover rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-muted">Name</span>
                <span className="font-medium text-ink-primary">{user?.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Email</span>
                <span className="font-medium text-ink-primary">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Status</span>
                <span className="font-medium text-amber-600">Pending approval</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ExploreEvents;
