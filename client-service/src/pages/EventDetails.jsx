import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAbility } from '../hooks/useAbility';
import { useRef } from 'react';
import { useEventPermissions } from '../hooks/useEventPermissions';
import eventService from '../services/eventService';
import teamService from '../services/teamService';
import Alert from '../components/common/Alert/Alert';
import Badge from '../components/common/Badge/Badge';
import Button from '../components/common/Button/Button';
import Tabs from '../components/common/Tabs/Tabs';
import TeamTab from '../components/features/events/TeamTab/TeamTab';
import AdvanceStatusModal from '../components/features/events/AdvanceStatusModal/AdvanceStatusModal';
import FinalizeResultsModal from '../components/features/events/FinalizeResultsModal/FinalizeResultsModal';
import OverviewTab from '../components/features/events/OverviewTab/OverviewTab';
import ProblemStatementsTab from '../components/features/events/ProblemStatementsTab/ProblemStatementsTab';
import RegistrationsTab from '../components/features/events/RegistrationsTab/RegistrationsTab';
import OrgTeamsTab from '../components/features/events/OrgTeamsTab/OrgTeamsTab';
import SubmissionsTab from '../components/features/events/SubmissionsTab/SubmissionsTab';
import LeaderboardTab from '../components/features/events/LeaderboardTab/LeaderboardTab';
import EventForm from '../components/features/events/EventForm/EventForm';
import ReferencesTab from '../components/features/events/ReferencesTab/ReferencesTab';
import RulesTab from '../components/features/events/RulesTab/RulesTab';
import { ArrowLeft, Hash, Check, X } from 'lucide-react';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOrganizer } = useAbility();
  const tabsRef = useRef([]);

  // ── State ──────────────────────────────────────────────────────────────────
  const [eventDetails, setEventDetails]           = useState(null);
  const [loading, setLoading]                     = useState(true);
  const [error, setError]                         = useState('');
  const [copied, setCopied]                       = useState(false);
  const [copiedEmail, setCopiedEmail]             = useState(false);
  const [registrations, setRegistrations]         = useState([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const [registrationsError, setRegistrationsError]     = useState('');
  const [updatingId, setUpdatingId]               = useState(null);
  const [statusUpdateError, setStatusUpdateError] = useState('');
  const [myRegistration, setMyRegistration]       = useState(null);
  const [orgTeams, setOrgTeams]                   = useState([]);
  const [orgTeamsLoading, setOrgTeamsLoading]     = useState(false);
  const [orgTeamsError, setOrgTeamsError]         = useState('');
  const [advancingStatus, setAdvancingStatus]     = useState(false);
  const [advanceError, setAdvanceError]           = useState('');
  const [confirmAdvance, setConfirmAdvance]       = useState({ open: false, currentLabel: '', nextLabel: '', desc: '' });
  const [confirmFinalize, setConfirmFinalize]     = useState(false);
  const [finalizeError, setFinalizeError]         = useState('');
  const [leaderboardTeams, setLeaderboardTeams]   = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [showEditModal, setShowEditModal]         = useState(false);
  const [editLoading, setEditLoading]             = useState(false);
  const [editError, setEditError]                 = useState('');

  const [activeTab, setActiveTab]                 = useState(0);
  const permissions = useEventPermissions(eventDetails);

  // ── Handlers ───────────────────────────────────────────────────────────────

  // Jump to a tab by label when navigating back from a sub-page (e.g. AddProblems)
  useEffect(() => {
    if (location.state?.tab) {
      const idx = tabsRef.current.findIndex(t => t?.label === location.state.tab);
      if (idx >= 0) setActiveTab(idx);
    }
  }, [location.state]);

  const copyCode = () => {
    if (!eventDetails?.shortCode) return;
    navigator.clipboard.writeText(eventDetails.shortCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyEmail = () => {
    if (!eventDetails?.contactEmail) return;
    navigator.clipboard.writeText(eventDetails.contactEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleEditSubmit = async (formData) => {
    setEditLoading(true);
    setEditError('');
    try {
      await eventService.updateEvent(id, formData);
      const updated = await eventService.getEventById(id);
      setEventDetails(updated);
      setShowEditModal(false);
    } catch (e) {
      setEditError(e.response?.data?.message || 'Failed to update event.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleStatusUpdate = async (registrationId, status) => {
    setUpdatingId(registrationId);
    setStatusUpdateError('');
    try {
      await eventService.updateRegistrationStatus(registrationId, status);
      setRegistrations(prev => prev.map(r => r.id === registrationId ? { ...r, status } : r));
      if (status === 'REJECTED') {
        teamService.getTeamsByEvent(id).then(data => setOrgTeams(data)).catch(() => {});
      }
    } catch (err) {
      setStatusUpdateError(err.response?.data || err.message || 'Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const refreshTeams = async () => {
    const data = await teamService.getTeamsByEvent(id);
    setOrgTeams(data);
  };

  const handleAdvanceConfirm = async () => {
    setAdvancingStatus(true);
    setAdvanceError('');
    try {
      await eventService.advanceEventStatus(id);
      const updated = await eventService.getEventById(id);
      setEventDetails(updated);
      setConfirmAdvance(s => ({ ...s, open: false }));
    } catch (e) {
      setAdvanceError(e.response?.data || 'Failed to advance status');
    } finally {
      setAdvancingStatus(false);
    }
  };

  const handleFinalizeConfirm = async () => {
    setAdvancingStatus(true);
    setFinalizeError('');
    try {
      await teamService.finalizeResults(id);
      const updated = await eventService.getEventById(id);
      setEventDetails(updated);
      setConfirmFinalize(false);
    } catch (e) {
      setFinalizeError(e.response?.data || 'Failed to finalize results');
    } finally {
      setAdvancingStatus(false);
    }
  };

  // Problem statement callbacks passed to ProblemStatementsTab
  const handleAddProblems = async (filledRows) => {
    await eventService.addProblemStatementsBulk(id, filledRows);
    const updated = await eventService.getEventById(id);
    setEventDetails(updated);
  };

  const handleUpdateProblem = async (problemId, data) => {
    await eventService.updateProblemStatement(problemId, data);
    setEventDetails(prev => ({
      ...prev,
      problemStatements: prev.problemStatements.map(p => p.id === problemId ? { ...p, ...data } : p),
    }));
  };

  const handleDeleteProblem = async (problemId) => {
    await eventService.deleteProblemStatement(problemId);
    setEventDetails(prev => ({
      ...prev,
      problemStatements: prev.problemStatements.filter(p => p.id !== problemId),
    }));
  };

  useEffect(() => {
    const fetchEventDetails = async () => {
      setLoading(true);
      try {
        const data = await eventService.getEventById(id);
        setEventDetails(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch event details.');
      } finally {
        setLoading(false);
      }
    };

    const fetchRegistrations = async () => {
      setRegistrationsLoading(true);
      setRegistrationsError('');
      try {
        const data = await eventService.getEventRegistrations(id);
        setRegistrations(data);
      } catch (err) {
        setRegistrationsError(err.response?.data?.message || 'Failed to load participants.');
      } finally {
        setRegistrationsLoading(false);
      }
    };

    if (id) {
      fetchEventDetails();
      if (isOrganizer) {
        fetchRegistrations();
        setOrgTeamsLoading(true);
        teamService.getTeamsByEvent(id)
          .then(data => setOrgTeams(data))
          .catch(err => setOrgTeamsError(err.response?.data?.message || 'Failed to load teams.'))
          .finally(() => setOrgTeamsLoading(false));
      } else {
        eventService.getMyRegistrationStatuses().then(statuses => {
          const reg = statuses.find(r => r.eventId === id);
          if (reg) setMyRegistration(reg);
        }).catch(() => {});
      }
    }
  }, [id, isOrganizer]);

  // Load teams for leaderboard when results are announced (visible to all users)
  useEffect(() => {
    if (!eventDetails || isOrganizer) return;
    const status = eventDetails.status?.toLowerCase();
    if (['results_announced', 'completed'].includes(status)) {
      setLeaderboardLoading(true);
      teamService.getTeamsByEvent(id)
        .then(data => setLeaderboardTeams(data))
        .catch(() => {})
        .finally(() => setLeaderboardLoading(false));
    }
  }, [eventDetails?.status, id, isOrganizer]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <Alert type="error" title="Error">{error}</Alert>;
  }

  if (!eventDetails) {
    return <Alert type="info" title="Not Found">Event details could not be loaded.</Alert>;
  }


  const statusVariants = {
    upcoming: 'blue',
    registration_open: 'success',
    ongoing: 'orange',
    judging: 'warning',
    results_announced: 'info',
    completed: 'secondary',
  };

  const tabs = [
    {
      label: 'Overview',
      content: (
        <OverviewTab
          event={eventDetails}
          permissions={permissions}
          myRegistration={myRegistration}
          advancingStatus={advancingStatus}
          advanceError={advanceError}
          setConfirmAdvance={setConfirmAdvance}
          copiedEmail={copiedEmail}
          copyEmail={copyEmail}
          onEditClick={() => { setEditError(''); setShowEditModal(true); }}
          onSwitchToTeamTab={() => {
            const idx = tabs.findIndex(t => t.label === 'Team');
            if (idx >= 0) setActiveTab(idx);
          }}
        />
      ),
    },
    {
      label: 'Problems',
      content: (
        <ProblemStatementsTab
          eventId={id}
          problems={eventDetails.problemStatements}
          permissions={permissions}
          onUpdate={handleUpdateProblem}
          onDelete={handleDeleteProblem}
        />
      ),
    },
    {
      label: 'References',
      content: (
        <ReferencesTab
          eventId={id}
          permissions={permissions}
        />
      ),
    },
    {
      label: 'Rules',
      content: (
        <RulesTab
          eventId={id}
          permissions={permissions}
        />
      ),
    },
    ...(permissions.isEventOwner ? [{
      label: 'Participants',
      content: (
        <RegistrationsTab
          registrations={registrations}
          loading={registrationsLoading}
          error={registrationsError}
          updatingId={updatingId}
          statusUpdateError={statusUpdateError}
          onStatusUpdate={handleStatusUpdate}
        />
      ),
    }] : []),
    ...(permissions.isOrganizer ? [{
      label: 'Teams',
      content: (
        <OrgTeamsTab
          teams={orgTeams}
          loading={orgTeamsLoading}
          error={orgTeamsError}
          problemStatements={eventDetails.problemStatements}
        />
      ),
    }] : []),
    ...(permissions.isOrganizer ? [{
      label: 'Submissions',
      content: (
        <SubmissionsTab
          teams={orgTeams}
          loading={orgTeamsLoading}
          eventStatus={eventDetails.status}
          eventId={id}
          problemStatements={eventDetails.problemStatements}
          permissions={permissions}
          onTeamsRefresh={refreshTeams}
          onFinalizeClick={() => { setFinalizeError(''); setConfirmFinalize(true); }}
        />
      ),
    }] : []),
    ...(!permissions.isOrganizer ? [{
      label: 'Team',
      content: <TeamTab event={eventDetails} myRegistration={myRegistration} />,
    }] : []),
    {
      label: '🏆 Leaderboard',
      content: (
        <LeaderboardTab
          eventStatus={eventDetails.status}
          teams={permissions.isOrganizer ? orgTeams : leaderboardTeams}
          loading={permissions.isOrganizer ? orgTeamsLoading : leaderboardLoading}
          problemStatements={eventDetails.problemStatements}
        />
      ),
    },
  ];

  // Sync tabs into ref so the location.state handler can find by label
  tabsRef.current = tabs;

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 pb-20">
      <AdvanceStatusModal
        confirm={confirmAdvance}
        advancing={advancingStatus}
        error={advanceError}
        onCancel={() => setConfirmAdvance(s => ({ ...s, open: false }))}
        onConfirm={handleAdvanceConfirm}
      />
      <FinalizeResultsModal
        open={confirmFinalize}
        finalizing={advancingStatus}
        error={finalizeError}
        onCancel={() => setConfirmFinalize(false)}
        onConfirm={handleFinalizeConfirm}
      />

      {/* Edit Event Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-8 px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Edit Event</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4">
              {editError && <p className="text-sm text-red-500 mb-4">{editError}</p>}
              <EventForm
                initialData={eventDetails}
                onSubmit={handleEditSubmit}
                onCancel={() => setShowEditModal(false)}
                loading={editLoading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => navigate('/my-events')}>
          Back
        </Button>
        <div className="flex-1 flex items-center justify-center gap-3 min-w-0">
          <h2 className="text-2xl font-bold text-gray-900 truncate">{eventDetails.name}</h2>
          {eventDetails.shortCode && (
            <button
              onClick={copyCode}
              title={copied ? 'Copied!' : 'Click to copy'}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-mono font-semibold border shrink-0 transition-all ${
                copied
                  ? 'bg-green-50 text-green-600 border-green-200'
                  : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 cursor-pointer'
              }`}
            >
              {copied ? <Check className="w-3 h-3" /> : <Hash className="w-3 h-3" />}
              {eventDetails.shortCode}
            </button>
          )}
        </div>
        <Badge variant={statusVariants[eventDetails.status?.toLowerCase()] || 'info'}>
          {eventDetails.status?.replace(/_/g, ' ') || 'Status N/A'}
        </Badge>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default EventDetails;
