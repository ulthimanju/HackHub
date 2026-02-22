import React, { useEffect, useState } from 'react';
import {
  Users, Plus, Copy, Check, Search, Crown, UserPlus, Github,
  LogOut, Trash2, AlertTriangle, RefreshCw, ClipboardCheck,
  Clock, CheckCircle2, XCircle, Send, Eye, BookOpen, Sparkles,
} from 'lucide-react';
import Button from '../../../common/Button/Button';
import Modal from '../../../common/Modal/Modal';
import Alert from '../../../common/Alert/Alert';
import { useAuth } from '../../../../hooks/useAuth';
import { useTeamTab } from '../../../../hooks/useTeamTab';
import MatchmakingPanel from './MatchmakingPanel';

const SectionTitle = ({ children }) => (
  <div className="flex items-center gap-2.5">
    <div className="w-0.5 h-5 bg-brand-500 rounded-full" />
    <h3 className="text-base font-semibold text-ink-primary font-display">{children}</h3>
  </div>
);

const InputField = ({ label, placeholder, value, onChange, mono, maxLength, required }) => (
  <div>
    {label && (
      <label className="block text-xs font-medium text-ink-muted uppercase tracking-wide mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    )}
    <input
      className={`w-full border border-surface-border rounded-lg px-3 py-2 text-sm text-ink-primary placeholder-ink-disabled
        focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 bg-white transition ${mono ? 'font-mono uppercase tracking-wider' : ''}`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      maxLength={maxLength}
    />
  </div>
);

const TeamTab = ({ event, myRegistration }) => {
  const { user } = useAuth();
  const {
    teams, loading, error,
    actionLoading, actionError,
    fetchTeams,
    handlers,
  } = useTeamTab(event.id, user);

  const [copiedCode, setCopiedCode] = useState(false);

  // UI-only state (modals, form fields)
  const [createName, setCreateName] = useState('');
  const [searchName, setSearchName] = useState('');
  const [inviteModal, setInviteModal] = useState({ open: false, userId: '', username: '', userEmail: '' });
  const [submitModal, setSubmitModal] = useState({ open: false, repoUrl: '', demoUrl: '' });
  const [selectProblemModal, setSelectProblemModal] = useState({ open: false, problemId: '' });
  const [transferModal, setTransferModal] = useState({ open: false, newLeaderId: '' });
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [confirmDismantle, setConfirmDismantle] = useState(false);
  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const [viewProblemOpen, setViewProblemOpen] = useState(false);

  const isApproved = myRegistration?.status === 'APPROVED';
  const isLocked = ['judging', 'results_announced', 'completed'].includes(event.status?.toLowerCase());

  useEffect(() => { fetchTeams(); }, [fetchTeams]);

  // Derive current user's team state
  const myTeam = teams.find(t => t.members?.some(m => m.userId === user?.id));
  const myMembership = myTeam?.members?.find(m => m.userId === user?.id);
  const isLeader = myMembership?.role === 'LEADER';
  const myMemberStatus = myMembership?.status;

  const copyTeamCode = () => {
    navigator.clipboard.writeText(myTeam?.shortCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCreateTeam = () => {
    if (!createName.trim()) return;
    handlers.createTeam(createName.trim()).then(() => {
      setCreateName('');
      setCreateTeamOpen(false);
    });
  };

  const handleRequestToJoin = (teamId) => handlers.requestToJoin(teamId);

  const handleRespond = (teamId, targetUserId, accept) =>
    handlers.respondToInvite(teamId, targetUserId, accept);

  const handleLeave = () =>
    handlers.leaveTeam(myTeam.id).then(() => setConfirmLeave(false));

  const handleDismantle = () =>
    handlers.dismantleTeam(myTeam.id).then(() => setConfirmDismantle(false));

  const handleInvite = () =>
    handlers.inviteMember(myTeam.id, {
      userId: inviteModal.userId,
      username: inviteModal.username,
      userEmail: inviteModal.userEmail,
    }).then(() => setInviteModal({ open: false, userId: '', username: '', userEmail: '' }));

  const handleSubmit = () => {
    if (!submitModal.repoUrl.trim()) return;
    handlers.submitProject(myTeam.id, {
      repoUrl: submitModal.repoUrl.trim(),
      ...(submitModal.demoUrl.trim() ? { demoUrl: submitModal.demoUrl.trim() } : {}),
    }).then(() => setSubmitModal({ open: false, repoUrl: '', demoUrl: '' }));
  };

  const handleSelectProblem = () =>
    handlers.selectProblemStatement(myTeam.id, selectProblemModal.problemId)
      .then(() => setSelectProblemModal({ open: false, problemId: '' }));

  const handleTransfer = () => {
    if (!transferModal.newLeaderId) return;
    handlers.transferLeadership(myTeam.id, transferModal.newLeaderId)
      .then(() => setTransferModal({ open: false, newLeaderId: '' }));
  };

  // ── Loading / Error ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) return <Alert type="error">{error}</Alert>;

  // ── Registration not approved ────────────────────────────────────────────────
  if (!isApproved) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="w-14 h-14 bg-brand-50 rounded-xl flex items-center justify-center">
          <Users className="w-7 h-7 text-brand-300" />
        </div>
        <p className="text-base font-semibold text-ink-secondary">Registration Required</p>
        <p className="text-sm text-ink-muted max-w-xs">
          {myRegistration
            ? 'Your registration is pending approval. Team features unlock once approved.'
            : 'You need an approved registration to access team features.'}
        </p>
      </div>
    );
  }

  // ── Pending invite ───────────────────────────────────────────────────────────
  if (myTeam && myMemberStatus === 'INVITED') {
    const acceptedMembers = myTeam.members?.filter(m => m.status === 'ACCEPTED') || [];
    return (
      <div className="space-y-4">
        <SectionTitle>Team Invitation</SectionTitle>
        {actionError && <Alert type="error">{actionError}</Alert>}
        <div className="bg-white rounded-xl p-5 border border-surface-border shadow-card space-y-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
              <UserPlus className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="font-medium text-ink-primary">You've been invited to join</p>
              <p className="text-lg font-semibold text-purple-700 font-display mt-0.5">{myTeam.name}</p>
            </div>
          </div>
          {acceptedMembers.length > 0 && (
            <div className="pt-3 border-t border-surface-border">
              <p className="text-xs font-medium text-ink-muted uppercase tracking-widest mb-2">Current Members</p>
              <div className="flex flex-wrap gap-2">
                {acceptedMembers.map(m => (
                  <div key={m.id} className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-hover rounded-md text-sm border border-surface-border">
                    <div className="w-5 h-5 rounded-md bg-brand-50 flex items-center justify-center text-xs font-bold text-brand-600">
                      {m.username?.charAt(0)?.toUpperCase()}
                    </div>
                    <span className="text-ink-secondary">{m.username}</span>
                    {m.role === 'LEADER' && <Crown className="w-3 h-3 text-amber-500" />}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-1">
            <Button
              variant="secondary"
              onClick={() => handleRespond(myTeam.id, user.id, false)}
              disabled={actionLoading === `rsp-${user.id}`}
            >
              Decline
            </Button>
            <Button
              variant="primary"
              onClick={() => handleRespond(myTeam.id, user.id, true)}
              disabled={actionLoading === `rsp-${user.id}`}
            >
              {actionLoading === `rsp-${user.id}` ? 'Accepting…' : 'Accept Invitation'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Pending join request ─────────────────────────────────────────────────────
  if (myTeam && myMemberStatus === 'REQUESTED') {
    return (
      <div className="space-y-4">
        <SectionTitle>Pending Request</SectionTitle>
        {actionError && <Alert type="error">{actionError}</Alert>}
        <div className="bg-white rounded-xl p-5 border border-surface-border shadow-card space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="font-medium text-ink-primary">Request Pending</p>
              <p className="text-sm text-ink-muted mt-0.5">
                Your request to join{' '}
                <span className="font-medium text-ink-primary">{myTeam.name}</span>{' '}
                is awaiting review by the team leader.
              </p>
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <Button
              variant="secondary"
              onClick={() => handleRespond(myTeam.id, user.id, false)}
              disabled={actionLoading === `rsp-${user.id}`}
            >
              {actionLoading === `rsp-${user.id}` ? 'Cancelling…' : 'Cancel Request'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── In a team (ACCEPTED) ─────────────────────────────────────────────────────
  if (myTeam && myMemberStatus === 'ACCEPTED') {
    const acceptedMembers = myTeam.members?.filter(m => m.status === 'ACCEPTED') || [];
    const pendingRequests = myTeam.members?.filter(m => m.status === 'REQUESTED') || [];
    const selectedProblem = event.problemStatements?.find(p => p.id === myTeam.problemStatementId);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <SectionTitle>My Team</SectionTitle>
          {isLeader && ['upcoming', 'registration_open'].includes(event.status?.toLowerCase()) && (
            <Button
              variant="secondary"
              size="sm"
              icon={UserPlus}
              onClick={() => setInviteModal({ open: true, userId: '', username: '', userEmail: '' })}
            >
              Invite Member
            </Button>
          )}
        </div>

        {actionError && <Alert type="error">{actionError}</Alert>}

        <div className="bg-white rounded-xl border border-surface-border shadow-card overflow-hidden">
          {/* Team header */}
          <div className="px-5 pt-4 pb-4 border-b border-surface-border flex items-center justify-between gap-4 flex-wrap">
            {/* Left: team name + copy code */}
            <div>
              <p className="text-xs font-medium text-ink-muted uppercase tracking-widest mb-0.5">Team Name</p>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-lg font-semibold text-ink-primary font-display">{myTeam.name}</p>
                <button
                  onClick={copyTeamCode}
                  title={copiedCode ? 'Copied!' : 'Copy team code to share'}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium border transition-all shrink-0 ${
                    copiedCode
                      ? 'bg-green-50 text-green-600 border-green-200'
                      : 'bg-surface-hover text-ink-secondary border-surface-border hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200'
                  }`}
                >
                  {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  #{myTeam.shortCode}
                </button>
              </div>
            </div>

            {/* Center: score badge */}
            {myTeam.score != null && myTeam.score > 0 && (
              <div className="flex flex-col items-center gap-0.5 flex-1">
                <span className="text-xs font-medium text-ink-muted uppercase tracking-widest">Score</span>
                <span className={`text-2xl font-bold px-5 py-1.5 rounded-lg font-display ${
                  myTeam.score >= 80 ? 'bg-green-50 text-green-700' :
                  myTeam.score >= 60 ? 'bg-amber-50 text-amber-700' :
                  'bg-red-50 text-red-600'
                }`}>
                  {myTeam.score}/100
                </span>
              </div>
            )}

            {/* Right: action button */}
            {['upcoming', 'registration_open'].includes(event.status?.toLowerCase()) ? (
              isLeader ? (
                <button
                  onClick={() => setConfirmDismantle(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" /> Dismantle Team
                </button>
              ) : (
                <button
                  onClick={() => setConfirmLeave(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-colors shrink-0"
                >
                  <LogOut className="w-4 h-4" /> Leave Team
                </button>
              )
            ) : (
              <span className="text-xs text-ink-muted shrink-0">Team locked after registration</span>
            )}
          </div>

          {/* Members */}
          <div className="px-5 py-4 border-b border-surface-border">
            <p className="text-xs font-medium text-ink-muted uppercase tracking-widest mb-3">
              Members ({acceptedMembers.length}{event.teamSize ? `/${event.teamSize}` : ''})
            </p>
            <div className="space-y-2.5">
              {acceptedMembers.map(m => (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-brand-600">{m.username?.charAt(0)?.toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-ink-primary text-sm truncate">{m.username}</span>
                      {m.userId === user?.id && <span className="text-xs text-ink-muted">(you)</span>}
                    </div>
                    <span className="text-xs text-ink-muted truncate block">{m.userEmail}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {m.role === 'LEADER' ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-md text-xs font-medium">
                        <Crown className="w-3 h-3" /> Leader
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-md text-xs font-medium">
                        Member
                      </span>
                    )}
                    {isLeader && m.role === 'MEMBER' && (
                      <button
                        onClick={() => setTransferModal({ open: true, newLeaderId: m.userId })}
                        title="Transfer leadership to this member"
                        className="w-6 h-6 rounded-md bg-surface-hover hover:bg-brand-50 flex items-center justify-center text-ink-disabled hover:text-brand-500 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending join requests (leader only) */}
          {isLeader && !isLocked && pendingRequests.length > 0 && (
            <div className="px-5 py-4 border-b border-surface-border bg-amber-50/40">
              <p className="text-xs font-medium text-amber-700 uppercase tracking-widest mb-3">
                Join Requests ({pendingRequests.length})
              </p>
              <div className="space-y-2">
                {pendingRequests.map(m => (
                  <div key={m.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-amber-700">{m.username?.charAt(0)?.toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-ink-primary text-sm block truncate">{m.username}</span>
                      <span className="text-xs text-ink-muted truncate">{m.userEmail}</span>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => handleRespond(myTeam.id, m.userId, true)}
                        disabled={!!actionLoading}
                        title="Accept"
                        className="w-8 h-8 rounded-lg bg-green-50 hover:bg-green-100 flex items-center justify-center text-green-600 disabled:opacity-40 transition-colors"
                      >
                        {actionLoading === `rsp-${m.userId}`
                          ? <div className="w-3.5 h-3.5 border-2 border-green-400 border-t-green-600 rounded-full animate-spin" />
                          : <CheckCircle2 className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleRespond(myTeam.id, m.userId, false)}
                        disabled={!!actionLoading}
                        title="Reject"
                        className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 disabled:opacity-40 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Problem & Submission */}
          <div className="px-5 py-4 border-b border-surface-border">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <p className="text-xs font-medium text-ink-muted uppercase tracking-widest mb-2">Problem Statement</p>
                {selectedProblem ? (
                  <div className="space-y-1.5">
                    <div className="flex items-start gap-2">
                      <ClipboardCheck className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <p className="text-sm font-medium text-ink-primary">{selectedProblem.name}</p>
                    </div>
                    <p className="text-sm text-ink-secondary line-clamp-2 pl-6">{selectedProblem.statement}</p>
                    <button
                      onClick={() => setViewProblemOpen(true)}
                      className="flex items-center gap-1 mt-1 text-xs text-brand-500 hover:text-brand-600 font-medium transition-colors pl-6"
                    >
                      <Eye className="w-3.5 h-3.5" /> View full details
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-ink-muted">No problem selected yet</p>
                )}
                {isLeader && event.problemStatements?.length > 0 && (
                  ['upcoming', 'registration_open'].includes(event.status?.toLowerCase()) ? (
                    <button
                      onClick={() => setSelectProblemModal({ open: true, problemId: myTeam.problemStatementId || '' })}
                      className="mt-2 text-xs text-brand-500 hover:text-brand-600 font-medium transition-colors"
                    >
                      {selectedProblem ? 'Change problem →' : 'Select problem →'}
                    </button>
                  ) : (
                    <p className="mt-2 text-xs text-ink-muted">Problem selection locked after registration</p>
                  )
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-ink-muted uppercase tracking-widest mb-2">Submission</p>
                {myTeam.repoUrl ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Github className="w-3.5 h-3.5 text-ink-muted shrink-0" />
                      <a
                        href={myTeam.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-brand-600 hover:underline truncate"
                      >
                        {myTeam.repoUrl}
                      </a>
                    </div>
                    {myTeam.aiSummary && (
                      <p className="text-xs text-ink-secondary line-clamp-2">{myTeam.aiSummary}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-ink-muted">Not submitted yet</p>
                )}
                {isLeader && (
                  myTeam.score != null && myTeam.score > 0 ? (
                    <p className="mt-2 text-xs text-green-600 font-medium">Score announced — submissions locked</p>
                  ) : event.status?.toUpperCase() === 'ONGOING' ? (
                    <button
                      onClick={() => setSubmitModal({ open: true, repoUrl: myTeam.repoUrl || '', demoUrl: myTeam.demoUrl || '' })}
                      className="mt-2 text-xs text-brand-500 hover:text-brand-600 font-medium transition-colors"
                    >
                      {myTeam.repoUrl ? 'Update submission →' : 'Submit project →'}
                    </button>
                  ) : (
                    <p className="mt-2 text-xs text-ink-muted">
                      {['COMPLETED', 'JUDGING', 'RESULTS_ANNOUNCED'].includes(event.status?.toUpperCase())
                        ? 'Submissions closed'
                        : 'Submissions open when event starts'}
                    </p>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Matchmaking (leader only, event not locked) ── */}
        {isLeader && !isLocked && (
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-0.5 h-5 bg-brand-500 rounded-full" />
              <h3 className="text-base font-semibold text-ink-primary font-display flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-500" /> Find Teammates
              </h3>
            </div>
            <MatchmakingPanel
              team={myTeam}
              onSkillsSaved={fetchTeams}
              onInvite={(userId, username, userEmail) =>
                setInviteModal({ open: true, userId, username, userEmail })
              }
            />
          </div>
        )}

        {/* ── Modals ── */}

        {/* View Problem Details */}
        <Modal
          isOpen={viewProblemOpen}
          onClose={() => setViewProblemOpen(false)}
          title="Problem Statement Details"
          footer={
            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setViewProblemOpen(false)}>Close</Button>
            </div>
          }
        >
          {selectedProblem && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="text-base font-semibold text-ink-primary font-display">{selectedProblem.name}</h3>
              </div>

              <div>
                <p className="text-xs font-medium text-ink-muted uppercase tracking-widest mb-2">Statement</p>
                <p className="text-sm text-ink-secondary leading-relaxed whitespace-pre-wrap">{selectedProblem.statement}</p>
              </div>

              {selectedProblem.requirements && (
                <div className="bg-brand-50 border border-brand-100 rounded-lg p-4">
                  <p className="text-xs font-medium text-brand-600 uppercase tracking-widest mb-2">Requirements</p>
                  <p className="text-sm text-ink-secondary leading-relaxed whitespace-pre-wrap">{selectedProblem.requirements}</p>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Invite Member */}
        <Modal
          isOpen={inviteModal.open}
          onClose={() => setInviteModal({ open: false, userId: '', username: '', userEmail: '' })}
          title="Invite Member"
          footer={
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setInviteModal({ open: false, userId: '', username: '', userEmail: '' })}>Cancel</Button>
              <Button
                variant="primary"
                icon={Send}
                onClick={handleInvite}
                disabled={!inviteModal.userId || actionLoading === 'invite'}
              >
                {actionLoading === 'invite' ? 'Sending…' : 'Send Invite'}
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {actionError && <Alert type="error">{actionError}</Alert>}
            <p className="text-sm text-ink-muted">
              Enter the details of the participant you want to invite. They must have an approved registration for this event.
            </p>
            <InputField label="User ID" placeholder="e.g. 94c6a498-9af9-433e-a069-..." required
              value={inviteModal.userId}
              onChange={e => setInviteModal(p => ({ ...p, userId: e.target.value }))}
            />
            <InputField label="Username" placeholder="e.g. johndoe"
              value={inviteModal.username}
              onChange={e => setInviteModal(p => ({ ...p, username: e.target.value }))}
            />
            <InputField label="Email" placeholder="e.g. john@example.com"
              value={inviteModal.userEmail}
              onChange={e => setInviteModal(p => ({ ...p, userEmail: e.target.value }))}
            />
          </div>
        </Modal>

        {/* Submit Project */}
        <Modal
          isOpen={submitModal.open}
          onClose={() => setSubmitModal({ open: false, repoUrl: '', demoUrl: '' })}
          title="Submit Project"
          footer={
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setSubmitModal({ open: false, repoUrl: '', demoUrl: '' })}>Cancel</Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={!submitModal.repoUrl.trim() || actionLoading === 'submit'}
              >
                {actionLoading === 'submit' ? 'Submitting…' : 'Submit'}
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {actionError && <Alert type="error">{actionError}</Alert>}
            <InputField
              label="Repository URL" required
              placeholder="https://github.com/your/repo"
              value={submitModal.repoUrl}
              onChange={e => setSubmitModal(p => ({ ...p, repoUrl: e.target.value }))}
            />
            <InputField
              label="Demo URL"
              placeholder="https://demo.example.com (optional)"
              value={submitModal.demoUrl}
              onChange={e => setSubmitModal(p => ({ ...p, demoUrl: e.target.value }))}
            />
          </div>
        </Modal>

        {/* Select Problem */}
        <Modal
          isOpen={selectProblemModal.open}
          onClose={() => setSelectProblemModal({ open: false, problemId: '' })}
          title="Select Problem Statement"
          footer={
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setSelectProblemModal({ open: false, problemId: '' })}>Cancel</Button>
              <Button
                variant="primary"
                onClick={handleSelectProblem}
                disabled={actionLoading === 'problem'}
              >
                {actionLoading === 'problem' ? 'Saving…' : 'Confirm Selection'}
              </Button>
            </div>
          }
        >
          <div className="space-y-3">
            {actionError && <Alert type="error">{actionError}</Alert>}
            {event.problemStatements?.map((p, i) => (
              <label
                key={p.id}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  selectProblemModal.problemId === p.id
                    ? 'border-brand-400 bg-brand-50'
                    : 'border-surface-border hover:border-brand-200 bg-white'
                }`}
              >
                <input
                  type="radio"
                  className="mt-0.5 accent-brand-500"
                  checked={selectProblemModal.problemId === p.id}
                  onChange={() => setSelectProblemModal(prev => ({ ...prev, problemId: p.id }))}
                />
                <div>
                  <p className="text-xs font-medium text-ink-muted uppercase tracking-widest mb-1">Problem {i + 1}</p>
                  <p className="text-sm font-medium text-ink-primary">{p.name}</p>
                </div>
              </label>
            ))}
          </div>
        </Modal>

        {/* Transfer Leadership */}
        <Modal
          isOpen={transferModal.open}
          onClose={() => setTransferModal({ open: false, newLeaderId: '' })}
          title="Transfer Leadership"
          footer={
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setTransferModal({ open: false, newLeaderId: '' })}>Cancel</Button>
              <Button
                variant="primary"
                onClick={handleTransfer}
                disabled={!transferModal.newLeaderId || actionLoading === 'transfer'}
              >
                {actionLoading === 'transfer' ? 'Transferring…' : 'Transfer Leadership'}
              </Button>
            </div>
          }
        >
          <div className="space-y-3">
            {actionError && <Alert type="error">{actionError}</Alert>}
            <p className="text-sm text-ink-muted">You will become a regular member after transfer.</p>
            {acceptedMembers.filter(m => m.role === 'MEMBER').map(m => (
              <label
                key={m.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  transferModal.newLeaderId === m.userId
                    ? 'border-brand-400 bg-brand-50'
                    : 'border-surface-border hover:border-brand-200 bg-white'
                }`}
              >
                <input
                  type="radio"
                  className="accent-brand-500"
                  checked={transferModal.newLeaderId === m.userId}
                  onChange={() => setTransferModal(prev => ({ ...prev, newLeaderId: m.userId }))}
                />
                <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center text-xs font-bold text-brand-600 shrink-0">
                  {m.username?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-ink-primary">{m.username}</p>
                  <p className="text-xs text-ink-muted">{m.userEmail}</p>
                </div>
              </label>
            ))}
          </div>
        </Modal>

        {/* Confirm Leave */}
        <Modal
          isOpen={confirmLeave}
          onClose={() => setConfirmLeave(false)}
          title="Leave Team"
          footer={
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setConfirmLeave(false)}>Cancel</Button>
              <Button variant="danger" onClick={handleLeave} disabled={actionLoading === 'leave'}>
                {actionLoading === 'leave' ? 'Leaving…' : 'Leave Team'}
              </Button>
            </div>
          }
        >
          <p className="text-sm text-ink-secondary">
            Are you sure you want to leave <span className="font-semibold">{myTeam?.name}</span>?
          </p>
        </Modal>

        {/* Confirm Dismantle */}
        <Modal
          isOpen={confirmDismantle}
          onClose={() => setConfirmDismantle(false)}
          title="Dismantle Team"
          footer={
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setConfirmDismantle(false)}>Cancel</Button>
              <Button variant="danger" onClick={handleDismantle} disabled={actionLoading === 'dismantle'}>
                {actionLoading === 'dismantle' ? 'Dismantling…' : 'Dismantle Team'}
              </Button>
            </div>
          }
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-ink-secondary">
              This will permanently delete <span className="font-semibold">{myTeam?.name}</span> and remove all members.
              This action cannot be undone.
            </p>
          </div>
        </Modal>
      </div>
    );
  }

  // ── No team yet ──────────────────────────────────────────────────────────────
  const otherTeams = teams
    .filter(t => !t.members?.some(m => m.userId === user?.id))
    .filter(t => !searchName.trim() || t.name.toLowerCase().includes(searchName.toLowerCase()));

  return (
    <div className="space-y-6">
      {actionError && <Alert type="error">{actionError}</Alert>}

      {/* Browse Teams */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-0.5 h-5 bg-brand-500 rounded-full" />
            <h3 className="text-base font-semibold text-ink-primary font-display">Browse Teams</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setCreateTeamOpen(true)}>
              Create Team
            </Button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted pointer-events-none" />
              <input
                className="pl-9 pr-4 py-2 border border-surface-border rounded-lg text-sm text-ink-primary placeholder-ink-disabled focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 w-48 bg-white"
                placeholder="Search by name…"
                value={searchName}
                onChange={e => setSearchName(e.target.value)}
              />
            </div>
          </div>
        </div>

        {otherTeams.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {otherTeams.map(team => {
              const acceptedCount = team.members?.filter(m => m.status === 'ACCEPTED').length ?? 0;
              const isFull = event.teamSize && acceptedCount >= event.teamSize;
              return (
                <div key={team.id} className="bg-white rounded-xl p-4 border border-surface-border shadow-card space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-ink-primary truncate text-sm">{team.name}</p>
                    <span className="text-xs font-mono text-ink-muted shrink-0">#{team.shortCode}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-ink-secondary">
                    <Users className="w-3.5 h-3.5" />
                    <span>{acceptedCount}{event.teamSize ? `/${event.teamSize}` : ''} members</span>
                    {isFull && <span className="ml-1 text-xs text-red-500 font-medium">· Full</span>}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth
                    onClick={() => handleRequestToJoin(team.id)}
                    disabled={isFull || !!actionLoading || isLocked}
                  >
                    {actionLoading === `req-${team.id}` ? 'Sending…' : isFull ? 'Team Full' : isLocked ? 'Event Locked' : 'Request to Join'}
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
            <div className="w-12 h-12 bg-surface-hover rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-ink-disabled" />
            </div>
            <p className="text-sm font-medium text-ink-muted">
              {searchName.trim() ? 'No teams match your search' : 'No other teams yet'}
            </p>
            <p className="text-sm text-ink-muted max-w-xs">
              {searchName.trim() ? 'Try a different name.' : 'Be the first to create a team for this event!'}
            </p>
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      <Modal
        isOpen={createTeamOpen}
        onClose={() => { setCreateTeamOpen(false); setCreateName(''); }}
        title="Create a Team"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setCreateTeamOpen(false); setCreateName(''); }}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateTeam}
              disabled={!createName.trim() || actionLoading === 'create'}
            >
              {actionLoading === 'create' ? 'Creating…' : 'Create Team'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {actionError && <Alert type="error">{actionError}</Alert>}
          <InputField
            label="Team Name"
            required
            placeholder="e.g. Team Rocket"
            value={createName}
            onChange={e => setCreateName(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default TeamTab;
