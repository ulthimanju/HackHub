import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAbility } from '@/hooks/useAbility';
import { useRef } from 'react';
import { useEventPermissions } from '@/hooks/useEventPermissions';
import { useEventDetails } from '@/hooks/useEventDetails';
import { useEventLifecycle } from '@/hooks/useEventLifecycle';
import Alert from '@/components/common/Alert/Alert';
import Badge from '@/components/common/Badge/Badge';
import Button from '@/components/common/Button/Button';
import Tabs from '@/components/common/Tabs/Tabs';
import TeamTab from '@/components/features/events/TeamTab/TeamTab';
import AdvanceStatusModal from '@/components/features/events/AdvanceStatusModal/AdvanceStatusModal';
import FinalizeResultsModal from '@/components/features/events/FinalizeResultsModal/FinalizeResultsModal';
import OverviewTab from '@/components/features/events/OverviewTab/OverviewTab';
import ProblemStatementsTab from '@/components/features/events/ProblemStatementsTab/ProblemStatementsTab';
import RegistrationsTab from '@/components/features/events/RegistrationsTab/RegistrationsTab';
import OrgTeamsTab from '@/components/features/events/OrgTeamsTab/OrgTeamsTab';
import SubmissionsTab from '@/components/features/events/SubmissionsTab/SubmissionsTab';
import LeaderboardTab from '@/components/features/events/LeaderboardTab/LeaderboardTab';
import ReferencesTab from '@/components/features/events/ReferencesTab/ReferencesTab';
import RulesTab from '@/components/features/events/RulesTab/RulesTab';
import SettingsTab from '@/components/features/events/SettingsTab/SettingsTab';
import { ArrowLeft, Hash, Check, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRegistration } from '@/hooks/useRegistration';
import Modal from '@/components/common/Modal/Modal';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOrganizer } = useAbility();
  const { user } = useAuth();
  const tabsRef = useRef([]);

  const [activeTab, setActiveTab] = useState(0);
  const [copied,      setCopied]      = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const {
    eventDetails,
    loading, error,
    registrations, registrationsLoading, registrationsError,
    updatingId, statusUpdateError,
    myRegistration,
    orgTeams, orgTeamsLoading, orgTeamsError,
    advancingStatus, advanceError, confirmAdvance, setConfirmAdvance,
    confirmFinalize, setConfirmFinalize, finalizeError,
    leaderboardTeams, leaderboardLoading,
    handlers,
  } = useEventDetails(id, isOrganizer);

  const permissions = useEventPermissions(eventDetails);
  const { lifecycle } = useEventLifecycle(id);

  const reg = useRegistration(user, () => {
    handlers.refreshMyRegistration();
  });

  // Jump to a tab by label when navigating back from a sub-page (e.g. AddProblems)
  React.useEffect(() => {
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

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
      </div>
    );
  }
  if (error)         return <Alert type="error" title="Error">{error}</Alert>;
  if (!eventDetails) return <Alert type="info" title="Not Found">Event details could not be loaded.</Alert>;

  const statusVariants = {
    upcoming: 'blue', registration_open: 'success', ongoing: 'orange',
    judging: 'warning', results_announced: 'info', completed: 'secondary',
  };

  const tabs = [
    {
      label: 'Overview',
      content: (
        <OverviewTab
          event={eventDetails}
          permissions={permissions}
          myRegistration={myRegistration}
          copiedEmail={copiedEmail}
          copyEmail={copyEmail}
          onRegister={() => reg.openModal(eventDetails)}
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
          onUpdate={handlers.handleUpdateProblem}
          onDelete={handlers.handleDeleteProblem}
        />
      ),
    },
    { label: 'References', content: <ReferencesTab eventId={id} permissions={permissions} /> },
    { label: 'Rules',      content: <RulesTab      eventId={id} permissions={permissions} /> },
    ...(permissions.isEventOwner ? [{
      label: 'Participants',
      content: (
        <RegistrationsTab
          registrations={registrations}
          loading={registrationsLoading}
          error={registrationsError}
          updatingId={updatingId}
          statusUpdateError={statusUpdateError}
          onStatusUpdate={handlers.handleStatusUpdate}
          canManageRegistrations={permissions.canManageRegistrations}
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
      disabled: !permissions.canEvaluate && !permissions.canManualReview && !permissions.canFinalizeResults,
      disabledReason: lifecycle?.phaseTimestamps?.eventEnd
        ? `Submissions are reviewed during the judging phase`
        : 'Available during the judging phase',
      content: (
        <SubmissionsTab
          teams={orgTeams}
          loading={orgTeamsLoading}
          eventStatus={eventDetails.status}
          eventId={id}
          problemStatements={eventDetails.problemStatements}
          permissions={permissions}
          onTeamsRefresh={handlers.refreshTeams}
          onFinalizeClick={() => { setConfirmFinalize(true); }}
        />
      ),
    }] : []),
    ...(!permissions.isOrganizer ? [{
      label: 'Team',
      disabled: permissions.areTeamsLocked,
      disabledReason: permissions.areTeamsLocked ? 'Team management is closed during this phase' : undefined,
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
    ...(permissions.isEventOwner ? [{
      label: '⚙️ Settings',
      content: (
        <SettingsTab
          event={eventDetails}
          permissions={permissions}
          onUpdateEvent={handlers.handleUpdateEvent}
          onDeleteEvent={handlers.handleDeleteEvent}
          advancingStatus={advancingStatus}
          advanceError={advanceError}
          setConfirmAdvance={setConfirmAdvance}
        />
      ),
    }] : []),
  ];

  tabsRef.current = tabs;

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 pb-20">
      <AdvanceStatusModal
        confirm={confirmAdvance}
        advancing={advancingStatus}
        error={advanceError}
        onCancel={() => setConfirmAdvance(s => ({ ...s, open: false }))}
        onConfirm={handlers.handleAdvanceConfirm}
      />
      <FinalizeResultsModal
        open={confirmFinalize}
        finalizing={advancingStatus}
        error={finalizeError}
        onCancel={() => setConfirmFinalize(false)}
        onConfirm={handlers.handleFinalizeConfirm}
      />

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

      {/* ── Registration Confirmation Modal ─────────────────────────────── */}
      <Modal
        isOpen={!!reg.registerEvent}
        onClose={reg.closeModal}
        title="Confirm Registration"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={reg.closeModal} disabled={reg.registering}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={reg.handleRegister}
              disabled={reg.registering || reg.registerSuccess}
            >
              {reg.registering ? 'Registering…' : reg.registerSuccess ? 'Registered!' : 'Confirm'}
            </Button>
          </div>
        }
      >
        {reg.registerSuccess ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <p className="font-semibold text-ink-primary">You're registered!</p>
            <p className="text-sm text-ink-secondary">Your registration is pending organizer approval.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-ink-secondary">
              You're about to register for{' '}
              <span className="font-semibold text-ink-primary">{reg.registerEvent?.name}</span>.
              Your spot will be pending organizer approval.
            </p>
            {reg.registerError && (
              <Alert type="error">{reg.registerError}</Alert>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EventDetails;
