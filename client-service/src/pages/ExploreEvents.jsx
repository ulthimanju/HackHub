import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import eventService from '../services/eventService';
import Button from '../components/common/Button/Button';
import Modal from '../components/common/Modal/Modal';
import Alert from '../components/common/Alert/Alert';
import EventCard from '../components/features/events/EventCard/EventCard';
import { Search, CheckCircle2, X } from 'lucide-react';
import { ALL_THEMES } from '../constants/themes';

const STATUS_TABS = [
  { label: 'All', value: 'all' },
  { label: 'Registration Open', value: 'registration_open' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Ongoing', value: 'ongoing' },
  { label: 'Judging', value: 'judging' },
  { label: 'Results', value: 'results_announced' },
  { label: 'Completed', value: 'completed' },
];


const ExploreEvents = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const search = searchParams.get('q') || '';

  const [events, setEvents] = useState([]);
  const [registeredIds, setRegisteredIds] = useState(new Set());
  const [registrationStatuses, setRegistrationStatuses] = useState({}); // eventId -> { id, status }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('all');
  const [activeTheme, setActiveTheme] = useState('');
  const [themeInput, setThemeInput] = useState('');

  const [registerEvent, setRegisterEvent] = useState(null); // event object to register for
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [all, myRegs] = await Promise.all([
          eventService.getAllEvents(),
          eventService.getMyRegistrationStatuses(),
        ]);
        setEvents(all);
        const ids = new Set((myRegs || []).map(r => r.eventId));
        setRegisteredIds(ids);
        const statusMap = {};
        (myRegs || []).forEach(r => { statusMap[r.eventId] = r; });
        setRegistrationStatuses(statusMap);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load events.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return events.filter(e => {
      const matchesTab = activeTab === 'all' || e.status?.toLowerCase() === activeTab;
      const matchesSearch =
        !search.trim() ||
        e.name?.toLowerCase().includes(search.toLowerCase()) ||
        e.description?.toLowerCase().includes(search.toLowerCase()) ||
        e.theme?.toLowerCase().includes(search.toLowerCase());
      const matchesTheme = !activeTheme ||
        (e.theme && e.theme.split(',').map(t => t.trim()).includes(activeTheme));
      return matchesTab && matchesSearch && matchesTheme;
    });
  }, [events, activeTab, search, activeTheme]);

  const handleRegister = async () => {
    if (!registerEvent) return;
    setRegistering(true);
    setRegisterError('');
    try {
      await eventService.registerForEvent(registerEvent.id, {
        userId: user.id,
        username: user.username,
        userEmail: user.email,
      });
      setRegisteredIds(prev => new Set([...prev, registerEvent.id]));
      setRegistrationStatuses(prev => ({
        ...prev,
        [registerEvent.id]: { status: 'PENDING' },
      }));
      setRegisterSuccess(true);
    } catch (err) {
      setRegisterError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  const closeModal = () => {
    setRegisterEvent(null);
    setRegisterError('');
    setRegisterSuccess(false);
  };

  const tabCounts = useMemo(() => {
    const counts = {};
    STATUS_TABS.forEach(t => {
      counts[t.value] = t.value === 'all'
        ? events.length
        : events.filter(e => e.status?.toLowerCase() === t.value).length;
    });
    return counts;
  }, [events]);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map(tab => {
          const count = tabCounts[tab.value] ?? 0;
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
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

      {/* Theme filter — autocomplete dropdown */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider shrink-0">Theme</span>
        <div className="relative w-64">
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-orange-300 focus-within:border-orange-400">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              className="flex-1 text-sm outline-none placeholder-gray-400"
              placeholder={activeTheme || 'Filter by theme…'}
              value={themeInput}
              onChange={e => setThemeInput(e.target.value)}
            />
            {activeTheme && (
              <button onClick={() => { setActiveTheme(''); setThemeInput(''); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {themeInput.trim() && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
              {ALL_THEMES.filter(t => t.toLowerCase().includes(themeInput.toLowerCase())).slice(0, 8).map(t => (
                <button key={t} onClick={() => { setActiveTheme(t); setThemeInput(''); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors">
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
        {activeTheme && (
          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-100 text-xs font-semibold px-3 py-1 rounded-full">
            {activeTheme}
            <button onClick={() => setActiveTheme('')} className="hover:text-red-500"><X className="w-3 h-3" /></button>
          </span>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
        </div>
      ) : error ? (
        <Alert type="error">{error}</Alert>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center">
            <Search className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-lg font-semibold text-gray-500">No events found</p>
          <p className="text-sm text-gray-400 max-w-xs">
            {search ? `No events match "${search}"` : 'There are no events in this category yet.'}
          </p>
          {(search || activeTab !== 'all' || activeTheme) && (
            <Button variant="secondary" size="sm" onClick={() => { setActiveTab('all'); setActiveTheme(''); setThemeInput(''); }}>
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(event => {
            const status = event.status?.toLowerCase() || 'upcoming';
            const isRegistered = registeredIds.has(event.id);
            const myReg = registrationStatuses[event.id];
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
                onRegister={() => setRegisterEvent(event)}
              />
            );
          })}
        </div>
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
              <p className="text-lg font-bold text-gray-900">You're registered!</p>
              <p className="text-sm text-gray-500 mt-1">
                You have successfully registered for <span className="font-semibold text-gray-800">{registerEvent?.name}</span>.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {registerError && <Alert type="error">{registerError}</Alert>}
            <p className="text-sm text-gray-600">
              You are about to register for <span className="font-semibold text-gray-900">{registerEvent?.name}</span>.
            </p>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Name</span>
                <span className="font-semibold text-gray-800">{user?.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <span className="font-semibold text-gray-800">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="font-semibold text-yellow-600">Pending approval</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ExploreEvents;
