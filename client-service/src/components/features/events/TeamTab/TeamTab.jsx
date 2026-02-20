import React, { useEffect, useState, useCallback } from 'react';
import {
  Users, Plus, Copy, Check, Search, Crown, UserPlus, Github,
  LogOut, Trash2, AlertTriangle, RefreshCw, ClipboardCheck,
  Clock, CheckCircle2, XCircle, Send, Eye, BookOpen,
} from 'lucide-react';
import Button from '../../../common/Button/Button';
import Modal from '../../../common/Modal/Modal';
import Alert from '../../../common/Alert/Alert';
import { useAuth } from '../../../../hooks/useAuth';
import teamService from '../../../../services/teamService';

const SectionTitle = ({ children }) => (
  <div className="flex items-center gap-3">
    <div className="w-1 h-6 bg-orange-500 rounded-full" />
    <h3 className="text-lg font-bold text-gray-900">{children}</h3>
  </div>
);

const InputField = ({ label, placeholder, value, onChange, mono, maxLength, required }) => (
  <div>
    {label && (
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
    )}
    <input
      className={`w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400
        focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 ${mono ? 'font-mono uppercase tracking-wider' : ''}`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      maxLength={maxLength}
    />
  </div>
);

const TeamTab = ({ event, myRegistration }) => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [actionError, setActionError] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // No-team form state
  const [createName, setCreateName] = useState('');
  const [searchName, setSearchName] = useState('');

  // Modals
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

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await teamService.getTeamsByEvent(event.id);
      setTeams(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load teams.');
    } finally {
      setLoading(false);
    }
  }, [event.id]);

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

  const withAction = async (key, fn) => {
    setActionLoading(key);
    setActionError('');
    try {
      await fn();
      await fetchTeams();
    } catch (err) {
      setActionError(err.response?.data?.message || err.response?.data || 'Action failed.');
    } finally {
      setActionLoading('');
    }
  };

  const handleCreateTeam = () => {
    if (!createName.trim()) return;
    withAction('create', async () => {
      await teamService.createTeam(event.id, {
        name: createName.trim(),
        userId: user.id,
        username: user.username,
        userEmail: user.email,
      });
      setCreateName('');
      setCreateTeamOpen(false);
    });
  };

  const handleRequestToJoin = (teamId) =>
    withAction(`req-${teamId}`, () =>
      teamService.requestToJoin(teamId, {
        userId: user.id,
        username: user.username,
        userEmail: user.email,
      })
    );

  const handleRespond = (teamId, targetUserId, accept) =>
    withAction(`rsp-${targetUserId}`, () =>
      teamService.respondToInvite(teamId, targetUserId, accept)
    );

  const handleLeave = () =>
    withAction('leave', async () => {
      await teamService.leaveTeam(myTeam.id, user.id);
      setConfirmLeave(false);
    });

  const handleDismantle = () =>
    withAction('dismantle', async () => {
      await teamService.dismantleTeam(myTeam.id, user.id);
      setConfirmDismantle(false);
    });

  const handleInvite = () =>
    withAction('invite', async () => {
      await teamService.inviteMember(myTeam.id, user.id, {
        userId: inviteModal.userId,
        username: inviteModal.username,
        userEmail: inviteModal.userEmail,
      });
      setInviteModal({ open: false, userId: '', username: '', userEmail: '' });
    });

  const handleSubmit = () => {
    if (!submitModal.repoUrl.trim()) return;
    withAction('submit', async () => {
      await teamService.submitProject(myTeam.id, user.id, {
        repoUrl: submitModal.repoUrl.trim(),
        ...(submitModal.demoUrl.trim() ? { demoUrl: submitModal.demoUrl.trim() } : {}),
      });
      setSubmitModal({ open: false, repoUrl: '', demoUrl: '' });
    });
  };

  const handleSelectProblem = () =>
    withAction('problem', async () => {
      await teamService.selectProblemStatement(myTeam.id, user.id, selectProblemModal.problemId || null);
      setSelectProblemModal({ open: false, problemId: '' });
    });

  const handleTransfer = () => {
    if (!transferModal.newLeaderId) return;
    withAction('transfer', async () => {
      await teamService.transferLeadership(myTeam.id, user.id, transferModal.newLeaderId);
      setTransferModal({ open: false, newLeaderId: '' });
    });
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
        <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center">
          <Users className="w-8 h-8 text-orange-300" />
        </div>
        <p className="text-lg font-semibold text-gray-600">Registration Required</p>
        <p className="text-sm text-gray-400 max-w-xs">
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
        <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm space-y-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
              <UserPlus className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">You've been invited to join</p>
              <p className="text-xl font-bold text-purple-700 mt-0.5">{myTeam.name}</p>
            </div>
          </div>
          {acceptedMembers.length > 0 && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Current Members</p>
              <div className="flex flex-wrap gap-2">
                {acceptedMembers.map(m => (
                  <div key={m.id} className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-full text-sm border border-gray-100">
                    <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600">
                      {m.username?.charAt(0)?.toUpperCase()}
                    </div>
                    <span className="text-gray-700">{m.username}</span>
                    {m.role === 'LEADER' && <Crown className="w-3 h-3 text-yellow-500" />}
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
        <div className="bg-white rounded-2xl p-6 border border-yellow-100 shadow-sm space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Request Pending</p>
              <p className="text-sm text-gray-500 mt-0.5">
                Your request to join{' '}
                <span className="font-semibold text-gray-700">{myTeam.name}</span>{' '}
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

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Team header */}
          <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
            {/* Left: team name + copy code */}
            <div>
              <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-0.5">Team Name</p>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xl font-bold text-gray-900">{myTeam.name}</p>
                <button
                  onClick={copyTeamCode}
                  title={copiedCode ? 'Copied!' : 'Copy team code to share'}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold border transition-all shrink-0 ${
                    copiedCode
                      ? 'bg-green-50 text-green-600 border-green-200'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200'
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
                <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">Score</span>
                <span className={`text-2xl font-extrabold px-5 py-1.5 rounded-full ${
                  myTeam.score >= 80 ? 'bg-green-100 text-green-700' :
                  myTeam.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-600'
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
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-100 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" /> Dismantle Team
                </button>
              ) : (
                <button
                  onClick={() => setConfirmLeave(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-100 transition-colors shrink-0"
                >
                  <LogOut className="w-4 h-4" /> Leave Team
                </button>
              )
            ) : (
              <span className="text-xs text-gray-400 shrink-0">Team locked after registration</span>
            )}
          </div>

          {/* Members */}
          <div className="px-6 py-4 border-b border-gray-100">
            <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">
              Members ({acceptedMembers.length}{event.teamSize ? `/${event.teamSize}` : ''})
            </p>
            <div className="space-y-2.5">
              {acceptedMembers.map(m => (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-orange-600">{m.username?.charAt(0)?.toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-gray-900 text-sm truncate">{m.username}</span>
                      {m.userId === user?.id && <span className="text-xs text-gray-400">(you)</span>}
                    </div>
                    <span className="text-xs text-gray-400 truncate block">{m.userEmail}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {m.role === 'LEADER' ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-100 rounded-full text-xs font-semibold">
                        <Crown className="w-3 h-3" /> Leader
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-semibold">
                        Member
                      </span>
                    )}
                    {isLeader && m.role === 'MEMBER' && (
                      <button
                        onClick={() => setTransferModal({ open: true, newLeaderId: m.userId })}
                        title="Transfer leadership to this member"
                        className="w-6 h-6 rounded-lg bg-gray-50 hover:bg-orange-50 flex items-center justify-center text-gray-300 hover:text-orange-500 transition-colors"
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
            <div className="px-6 py-4 border-b border-gray-100 bg-amber-50/40">
              <p className="text-xs font-bold tracking-widest text-amber-600 uppercase mb-3">
                Join Requests ({pendingRequests.length})
              </p>
              <div className="space-y-2">
                {pendingRequests.map(m => (
                  <div key={m.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-amber-700">{m.username?.charAt(0)?.toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-gray-900 text-sm block truncate">{m.username}</span>
                      <span className="text-xs text-gray-400 truncate">{m.userEmail}</span>
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
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Problem Statement</p>
                {selectedProblem ? (
                  <div className="space-y-1.5">
                    <div className="flex items-start gap-2">
                      <ClipboardCheck className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <p className="text-sm font-semibold text-gray-800">{selectedProblem.name}</p>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 pl-6">{selectedProblem.statement}</p>
                    <button
                      onClick={() => setViewProblemOpen(true)}
                      className="flex items-center gap-1 mt-1 text-xs text-blue-500 hover:text-blue-600 font-semibold transition-colors pl-6"
                    >
                      <Eye className="w-3.5 h-3.5" /> View full details
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No problem selected yet</p>
                )}
                {isLeader && event.problemStatements?.length > 0 && (
                  ['upcoming', 'registration_open'].includes(event.status?.toLowerCase()) ? (
                    <button
                      onClick={() => setSelectProblemModal({ open: true, problemId: myTeam.problemStatementId || '' })}
                      className="mt-2 text-xs text-orange-500 hover:text-orange-600 font-semibold transition-colors"
                    >
                      {selectedProblem ? 'Change problem →' : 'Select problem →'}
                    </button>
                  ) : (
                    <p className="mt-2 text-xs text-gray-500">Problem selection locked after registration</p>
                  )
                )}
              </div>
              <div>
                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Submission</p>
                {myTeam.repoUrl ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Github className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                      <a
                        href={myTeam.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline truncate"
                      >
                        {myTeam.repoUrl}
                      </a>
                    </div>
                    {myTeam.aiSummary && (
                      <p className="text-xs text-gray-500 line-clamp-2">{myTeam.aiSummary}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Not submitted yet</p>
                )}
                {isLeader && (
                  myTeam.score != null && myTeam.score > 0 ? (
                    <p className="mt-2 text-xs text-green-600 font-semibold">Score announced — submissions locked</p>
                  ) : event.status?.toUpperCase() === 'ONGOING' ? (
                    <button
                      onClick={() => setSubmitModal({ open: true, repoUrl: myTeam.repoUrl || '', demoUrl: myTeam.demoUrl || '' })}
                      className="mt-2 text-xs text-orange-500 hover:text-orange-600 font-semibold transition-colors"
                    >
                      {myTeam.repoUrl ? 'Update submission →' : 'Submit project →'}
                    </button>
                  ) : (
                    <p className="mt-2 text-xs text-gray-400">
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
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{selectedProblem.name}</h3>
              </div>

              <div>
                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Statement</p>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedProblem.statement}</p>
              </div>

              {selectedProblem.requirements && (
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                  <p className="text-xs font-bold tracking-widest text-orange-500 uppercase mb-2">Requirements</p>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedProblem.requirements}</p>
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
            <p className="text-sm text-gray-500">
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
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  selectProblemModal.problemId === p.id
                    ? 'border-orange-400 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-200 bg-white'
                }`}
              >
                <input
                  type="radio"
                  className="mt-0.5 accent-orange-500"
                  checked={selectProblemModal.problemId === p.id}
                  onChange={() => setSelectProblemModal(prev => ({ ...prev, problemId: p.id }))}
                />
                <div>
                  <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">Problem {i + 1}</p>
                  <p className="text-sm font-semibold text-gray-800">{p.name}</p>
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
            <p className="text-sm text-gray-500">You will become a regular member after transfer.</p>
            {acceptedMembers.filter(m => m.role === 'MEMBER').map(m => (
              <label
                key={m.id}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  transferModal.newLeaderId === m.userId
                    ? 'border-orange-400 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-200 bg-white'
                }`}
              >
                <input
                  type="radio"
                  className="accent-orange-500"
                  checked={transferModal.newLeaderId === m.userId}
                  onChange={() => setTransferModal(prev => ({ ...prev, newLeaderId: m.userId }))}
                />
                <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600 shrink-0">
                  {m.username?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{m.username}</p>
                  <p className="text-xs text-gray-400">{m.userEmail}</p>
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
          <p className="text-sm text-gray-600">
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
            <p className="text-sm text-gray-600">
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
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-orange-500 rounded-full" />
            <h3 className="text-lg font-bold text-gray-900">Browse Teams</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setCreateTeamOpen(true)}>
              Create Team
            </Button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 w-48"
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
                <div key={team.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-gray-900 truncate">{team.name}</p>
                    <span className="text-xs font-mono text-gray-400 shrink-0">#{team.shortCode}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Users className="w-3.5 h-3.5" />
                    <span>{acceptedCount}{event.teamSize ? `/${event.teamSize}` : ''} members</span>
                    {isFull && <span className="ml-1 text-xs text-red-400 font-semibold">· Full</span>}
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
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center">
              <Users className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-base font-semibold text-gray-500">
              {searchName.trim() ? 'No teams match your search' : 'No other teams yet'}
            </p>
            <p className="text-sm text-gray-400 max-w-xs">
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
