import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import eventService from '../services/eventService';
import teamService from '../services/teamService';
import aiService from '../services/aiService';
import Alert from '../components/common/Alert/Alert';
import Badge from '../components/common/Badge/Badge';
import Button from '../components/common/Button/Button';
import Tabs from '../components/common/Tabs/Tabs';
import Modal from '../components/common/Modal/Modal';
import TeamTab from '../components/features/events/TeamTab/TeamTab';
import { 
  CalendarDays, MapPin, Users, Mail, Trophy, BookOpen, Clock, Globe, ArrowLeft, ArrowRight, Hash, Check, FileQuestion, Plus, Trash2, UserCheck, UserX, Crown, Search, Pencil, ExternalLink
} from 'lucide-react';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isOrganizer = user?.role === 'organizer';
  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [addProblemOpen, setAddProblemOpen] = useState(false);
  const [problemStatements, setProblemStatements] = useState([{ name: '', statement: '', requirements: '' }]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [editProblem, setEditProblem] = useState(null); // { id, statement, requirements }
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const [registrationsError, setRegistrationsError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [statusUpdateError, setStatusUpdateError] = useState('');
  const [participantFilter, setParticipantFilter] = useState('all');
  const [myRegistration, setMyRegistration] = useState(null);
  const [orgTeams, setOrgTeams] = useState([]);
  const [orgTeamsLoading, setOrgTeamsLoading] = useState(false);
  const [orgTeamsError, setOrgTeamsError] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [evaluateMsg, setEvaluateMsg] = useState('');
  const [teamSearch, setTeamSearch] = useState('');

  const closeProblemModal = () => {
    setAddProblemOpen(false);
    setProblemStatements([{ name: '', statement: '', requirements: '' }]);
    setSubmitError('');
  };

  const updateField = (index, field, value) => {
    setProblemStatements(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const addRow = () => setProblemStatements(prev => [...prev, { name: '', statement: '', requirements: '' }]);

  const removeRow = (index) => setProblemStatements(prev => prev.filter((_, i) => i !== index));

  const copyEmail = () => {
    if (!eventDetails?.contactEmail) return;
    navigator.clipboard.writeText(eventDetails.contactEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const copyCode = () => {
    if (!eventDetails?.shortCode) return;
    navigator.clipboard.writeText(eventDetails.shortCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddProblem = async () => {
    const filled = problemStatements.filter(p => p.name.trim() && p.statement.trim() && p.requirements.trim());
    if (!filled.length) {
      setSubmitError('Each problem requires a name, statement, and requirements.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      await eventService.addProblemStatementsBulk(id, filled.map(p => ({
        name: p.name.trim(),
        statement: p.statement.trim(),
        requirements: p.requirements.trim(),
      })));
      const updated = await eventService.getEventById(id);
      setEventDetails(updated);
      closeProblemModal();
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to add problem statements.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProblem = async (problemId) => {
    setDeletingId(problemId);
    try {
      await eventService.deleteProblemStatement(problemId);
      setEventDetails(prev => ({
        ...prev,
        problemStatements: prev.problemStatements.filter(p => p.id !== problemId),
      }));
    } catch (err) {
      // silently ignore — could surface a toast in the future
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdateProblem = async () => {
    if (!editProblem?.statement?.trim()) return;
    setEditSubmitting(true);
    setEditError('');
    try {
      await eventService.updateProblemStatement(editProblem.id, {
        name: editProblem.name.trim(),
        statement: editProblem.statement.trim(),
        requirements: editProblem.requirements.trim(),
      });
      setEventDetails(prev => ({
        ...prev,
        problemStatements: prev.problemStatements.map(p =>
          p.id === editProblem.id ? { ...p, name: editProblem.name.trim(), statement: editProblem.statement.trim(), requirements: editProblem.requirements.trim() } : p
        ),
      }));
      setEditProblem(null);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update problem statement.');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleStatusUpdate = async (registrationId, status) => {
    setUpdatingId(registrationId);
    setStatusUpdateError('');
    try {
      await eventService.updateRegistrationStatus(registrationId, status);
      setRegistrations(prev =>
        prev.map(r => r.id === registrationId ? { ...r, status } : r)
      );
      // Re-fetch teams as rejection may have removed a user from their team
      if (status === 'REJECTED') {
        teamService.getTeamsByEvent(id)
          .then(data => setOrgTeams(data))
          .catch(() => {});
      }
    } catch (err) {
      const msg = err.response?.data || err.message || 'Failed to update status.';
      console.error('[handleStatusUpdate] 400 error:', msg, '\norganizerId:', eventDetails?.organizerId, '\nuser.id:', user?.id);
      setStatusUpdateError(msg);
    } finally {
      setUpdatingId(null);
    }
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
  };

  const statusVariants = {
    upcoming: 'blue',
    registration_open: 'success',
    ongoing: 'orange',
    judging: 'warning',
    results_announced: 'info',
    completed: 'secondary',
  };

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

  // True only when the logged-in organizer owns this specific event
  const isEventOwner = isOrganizer && eventDetails.organizerId === user?.id;

  // Define tab content
  const tabs = [
    {
      label: 'Overview',
      content: (
        <div className="space-y-6">
          {/* Section title */}
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-orange-500 rounded-full" />
            <h3 className="text-lg font-bold text-gray-900">Key Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Description + Theme */}
            {(eventDetails.description || eventDetails.theme) && (
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm sm:col-span-2 lg:col-span-3">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4 text-orange-500" />
                  </div>
                  <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">Description</p>
                </div>
                {eventDetails.description && (
                  <p className="text-gray-700 leading-relaxed">{eventDetails.description}</p>
                )}
                {eventDetails.theme && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-orange-500 shrink-0" />
                    <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mr-2">Theme</p>
                    <p className="text-sm font-semibold text-gray-800">{eventDetails.theme}</p>
                  </div>
                )}
              </div>
            )}

            {/* Registration Timeline */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-orange-500" />
                  </div>
                  <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">Registration Timeline</p>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Opens</p>
                  <p className="text-lg font-bold text-gray-900">{formatDateShort(eventDetails.registrationStartDate)}</p>
                  <p className="text-sm text-gray-500">{formatTime(eventDetails.registrationStartDate)}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 mb-1">Closes</p>
                  <p className="text-lg font-bold text-gray-900">{formatDateShort(eventDetails.registrationEndDate)}</p>
                  <p className="text-sm text-gray-500">{formatTime(eventDetails.registrationEndDate)}</p>
                </div>
              </div>
            </div>

            {/* Event Date */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                  <CalendarDays className="w-4 h-4 text-orange-500" />
                  </div>
                  <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">Event Date</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatDateShort(eventDetails.startDate)}</p>
              <div className="flex items-center gap-1.5 mt-2 text-sm text-orange-500">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>{formatTime(eventDetails.startDate)} - {formatTime(eventDetails.endDate)}</span>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  </div>
                  <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">Location</p>
              </div>
              <p className="text-xl font-bold text-gray-900">{eventDetails.isVirtual ? 'Virtual' : 'Offline'}</p>
              {(eventDetails.location || eventDetails.venue) && (
                <p className="text-sm text-gray-500 mt-1">{eventDetails.location || eventDetails.venue}</p>
              )}
            </div>

            {/* Max Participants */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-orange-500" />
                  </div>
                  <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">Max Participants</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">{eventDetails.maxParticipants || '∞'}</p>
              {eventDetails.maxParticipants && eventDetails.teamSize && (
                <p className="text-sm text-gray-500 mt-1">
                  {Math.floor(eventDetails.maxParticipants / eventDetails.teamSize)} teams of {eventDetails.teamSize}
                </p>
              )}
            </div>

            {/* Team Size */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-orange-500" />
                  </div>
                  <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">Team Size</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {eventDetails.teamSize ? `${eventDetails.teamSize} member${eventDetails.teamSize > 1 ? 's' : ''}` : 'N/A'}
              </p>
              {eventDetails.teamSize && (
                <span className="inline-block mt-3 px-3 py-1 rounded-full text-sm font-semibold bg-orange-50 text-orange-600 border border-orange-100">
                  {eventDetails.teamSize === 1 ? 'Solo' : eventDetails.teamSize === 2 ? 'Duo' : eventDetails.teamSize === 3 ? 'Trio' : 'Team'}
                </span>
              )}
            </div>

            {/* Contact Email */}
            {eventDetails.contactEmail && (
              <div
                onClick={copyEmail}
                title={copiedEmail ? 'Copied!' : 'Click to copy email'}
                className="relative bg-white rounded-2xl p-4 border border-gray-100 shadow-sm cursor-pointer hover:border-orange-200 hover:shadow-md transition-all"
              >
                {copiedEmail && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-green-50 rounded-full flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  </div>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-orange-500" />
                  </div>
                  <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">Contact</p>
                </div>
                <p className={`font-medium break-all text-sm ${copiedEmail ? 'text-green-600' : 'text-gray-900'}`}>
                  {eventDetails.contactEmail}
                </p>
              </div>
            )}
          </div>

          {/* Prizes */}
          {eventDetails.prizes && eventDetails.prizes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-orange-500 rounded-full" />
                <h3 className="text-lg font-bold text-gray-900">Prizes</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {eventDetails.prizes.map((prize, index) => (
                  <div key={index} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                      <Trophy className="w-4 h-4 text-green-500" />
                    </div>
                    <span className="text-sm text-gray-700">{prize}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rules & Guidelines */}
          {eventDetails.rules && eventDetails.rules.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-orange-500 rounded-full" />
                <h3 className="text-lg font-bold text-gray-900">Rules & Guidelines</h3>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {eventDetails.rules.map((rule, index) => (
                  <div key={index} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-purple-500" />
                    </div>
                    <span className="text-sm text-gray-700 leading-relaxed">{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      label: 'Problems',
      content: (
        <div>
          {eventDetails.problemStatements && eventDetails.problemStatements.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-orange-500 rounded-full" />
                  <h3 className="text-lg font-bold text-gray-900">Problem Statements</h3>
                </div>
                {isEventOwner && (
                  <Button variant="primary" size="sm" icon={Plus} onClick={() => setAddProblemOpen(true)}>
                    Add Problem
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {eventDetails.problemStatements.map((problem, index) => (
                  <div key={problem.id || index} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">Problem {index + 1}</p>
                      {problem.name && (
                        <p className="text-base font-bold text-gray-900 mb-1">{problem.name}</p>
                      )}
                      <p className="text-gray-700 leading-relaxed">{problem.statement}</p>
                      {problem.requirements && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <p className="text-xs font-bold tracking-widest text-orange-400 uppercase mb-1">Requirements</p>
                          <p className="text-sm text-gray-600 leading-relaxed">{problem.requirements}</p>
                        </div>
                      )}
                    </div>
                    {isEventOwner && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setEditProblem({ id: problem.id, name: problem.name || '', statement: problem.statement, requirements: problem.requirements || '' })}
                          title="Edit problem"
                          className="p-1.5 text-gray-300 hover:text-orange-400 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProblem(problem.id)}
                          disabled={deletingId === problem.id}
                          title="Delete problem"
                          className="p-1.5 text-gray-300 hover:text-red-400 disabled:opacity-40 transition-colors"
                        >
                          {deletingId === problem.id
                            ? <div className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                            : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center">
                <FileQuestion className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-lg font-semibold text-gray-500">No problems yet</p>
              <p className="text-sm text-gray-400 max-w-xs">Problem statements haven't been added for this event yet. Check back later.</p>
              {isEventOwner && (
                <Button variant="primary" size="sm" icon={Plus} onClick={() => setAddProblemOpen(true)}>
                  Add Problem
                </Button>
              )}
            </div>
          )}

          <Modal
            isOpen={addProblemOpen}
            onClose={closeProblemModal}
            title="Add Problem Statements"
            footer={
              <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={closeProblemModal}>Cancel</Button>
                <Button
                  variant="primary"
                  onClick={handleAddProblem}
                  disabled={!problemStatements.some(p => p.name.trim() && p.statement.trim() && p.requirements.trim()) || submitting}
                >
                  {submitting ? 'Adding…' : `Add ${problemStatements.filter(p => p.name.trim() && p.statement.trim() && p.requirements.trim()).length || ''} Problem${problemStatements.filter(p => p.name.trim() && p.statement.trim() && p.requirements.trim()).length !== 1 ? 's' : ''}`}
                </Button>
              </div>
            }
          >
            <div className="space-y-4">
              {submitError && <Alert type="error">{submitError}</Alert>}
              {problemStatements.map((ps, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center shrink-0 mt-3">
                    <span className="text-xs font-bold text-blue-500">{index + 1}</span>
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <input
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                      placeholder={`Problem name * — e.g. "Smart City Solution"`}
                      value={ps.name}
                      onChange={(e) => updateField(index, 'name', e.target.value)}
                    />
                    <textarea
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 resize-none"
                      rows={3}
                      placeholder={`Problem statement ${index + 1} *`}
                      value={ps.statement}
                      onChange={(e) => updateField(index, 'statement', e.target.value)}
                    />
                    <textarea
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 resize-none"
                      rows={2}
                      placeholder={`Requirements * — e.g. must use React, open source only…`}
                      value={ps.requirements}
                      onChange={(e) => updateField(index, 'requirements', e.target.value)}
                    />
                  </div>
                  {problemStatements.length > 1 && (
                    <button
                      onClick={() => removeRow(index)}
                      className="mt-3 p-1.5 text-gray-300 hover:text-red-400 transition-colors shrink-0"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addRow}
                className="flex items-center gap-2 text-sm text-orange-500 hover:text-orange-600 font-medium mt-1 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add another problem
              </button>
            </div>
          </Modal>

          {/* Edit Problem Modal */}
          <Modal
            isOpen={!!editProblem}
            onClose={() => { setEditProblem(null); setEditError(''); }}
            title="Edit Problem Statement"
            footer={
              <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={() => { setEditProblem(null); setEditError(''); }}>Cancel</Button>
                <Button
                  variant="primary"
                  onClick={handleUpdateProblem}
                  disabled={!editProblem?.name?.trim() || !editProblem?.statement?.trim() || !editProblem?.requirements?.trim() || editSubmitting}
                >
                  {editSubmitting ? 'Saving…' : 'Save Changes'}
                </Button>
              </div>
            }
          >
            {editProblem && (
              <div className="space-y-3">
                {editError && <Alert type="error">{editError}</Alert>}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Name <span className="text-red-400">*</span></label>
                  <input
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                    placeholder={`e.g. "Smart City Solution"`}
                    value={editProblem.name}
                    onChange={e => setEditProblem(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Problem Statement <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 resize-none"
                    rows={4}
                    value={editProblem.statement}
                    onChange={e => setEditProblem(prev => ({ ...prev, statement: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Requirements <span className="text-red-400">*</span></label>
                  <textarea
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 resize-none"
                    rows={3}
                    placeholder="e.g. must use React, open source only…"
                    value={editProblem.requirements}
                    onChange={e => setEditProblem(prev => ({ ...prev, requirements: e.target.value }))}
                  />
                </div>
              </div>
            )}
          </Modal>
        </div>
      ),
    },
    ...(isEventOwner ? [{
      label: 'Participants',
      content: (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-orange-500 rounded-full" />
              <h3 className="text-lg font-bold text-gray-900">Participants</h3>
              {!registrationsLoading && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-orange-600 border border-orange-100">
                  {registrations.length}
                </span>
              )}
            </div>
          </div>

          {statusUpdateError && (
            <Alert type="error" className="mb-2">{statusUpdateError}</Alert>
          )}

          {registrationsLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
            </div>
          ) : registrationsError ? (
            <Alert type="error">{registrationsError}</Alert>
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
                {[
                  { label: 'All', value: 'all' },
                  { label: 'Pending', value: 'PENDING' },
                  { label: 'Approved', value: 'APPROVED' },
                  { label: 'Rejected', value: 'REJECTED' },
                ].map((tab) => {
                  const count = tab.value === 'all' ? registrations.length : registrations.filter(r => r.status === tab.value).length;
                  const isActive = participantFilter === tab.value;
                  return (
                    <button
                      key={tab.value}
                      onClick={() => setParticipantFilter(tab.value)}
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
              {registrations.filter(r => participantFilter === 'all' || r.status === participantFilter).map((reg) => {
                const statusConfig = {
                  PENDING:  { label: 'Pending',  cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
                  APPROVED: { label: 'Approved', cls: 'bg-green-50 text-green-700 border-green-200' },
                  REJECTED: { label: 'Rejected', cls: 'bg-red-50 text-red-600 border-red-200' },
                };
                const sc = statusConfig[reg.status] || statusConfig.PENDING;
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
                          onClick={() => handleStatusUpdate(reg.id, 'APPROVED')}
                          disabled={isUpdating}
                          title="Approve"
                          className="w-8 h-8 rounded-lg bg-green-50 hover:bg-green-100 flex items-center justify-center text-green-600 disabled:opacity-40 transition-colors"
                        >
                          {isUpdating ? <div className="w-3.5 h-3.5 border-2 border-green-400 border-t-green-600 rounded-full animate-spin" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                      )}
                      {reg.status !== 'REJECTED' && (
                        <button
                          onClick={() => handleStatusUpdate(reg.id, 'REJECTED')}
                          disabled={isUpdating}
                          title="Reject"
                          className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 disabled:opacity-40 transition-colors"
                        >
                          {isUpdating ? <div className="w-3.5 h-3.5 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" /> : <UserX className="w-4 h-4" />}
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
      ),
    }] : []),
    ...(isOrganizer ? [{
      label: 'Teams',
      content: (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={teamSearch}
              onChange={e => setTeamSearch(e.target.value)}
              placeholder="Search by team name…"
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
            />
          </div>

          {orgTeamsLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
            </div>
          ) : orgTeamsError ? (
            <Alert type="error" message={orgTeamsError} />
          ) : orgTeams.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3 text-center">
              <Users className="w-10 h-10 text-gray-300" />
              <p className="font-semibold text-gray-500">No teams formed yet</p>
              <p className="text-sm text-gray-400">Teams will appear here once participants create them.</p>
            </div>
          ) : (
            (() => {
              const filtered = orgTeams.filter(t =>
                !teamSearch || t.name?.toLowerCase().includes(teamSearch.toLowerCase())
              );
              if (!filtered.length) return (
                <div className="flex flex-col items-center py-12 gap-2 text-center">
                  <Search className="w-8 h-8 text-gray-300" />
                  <p className="text-sm text-gray-400">No teams match "<span className="font-medium text-gray-600">{teamSearch}</span>"</p>
                </div>
              );
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filtered.map(team => {
                    const acceptedMembers = team.members?.filter(m => m.status === 'ACCEPTED') ?? [];
                    const memberCount = acceptedMembers.length;
                    const problem = eventDetails.problemStatements?.find(p => p.id === team.problemStatementId);
                    return (
                      <div key={team.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
                        {/* Team name */}
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-gray-900 text-base leading-tight">{team.name}</h4>
                          <span className="shrink-0 flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                            <Users className="w-3.5 h-3.5" />
                            {memberCount} {memberCount === 1 ? 'member' : 'members'}
                          </span>
                        </div>

                        {/* Members list */}
                        <div className="flex flex-col gap-1.5">
                          {acceptedMembers.map(m => (
                            <div key={m.id} className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${m.role === 'LEADER' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                                {m.username?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                              <span className="text-sm text-gray-800 font-medium truncate flex-1">{m.username}</span>
                              {m.role === 'LEADER' && (
                                <span className="flex items-center gap-0.5 text-xs font-semibold text-orange-500 shrink-0">
                                  <Crown className="w-3 h-3" />
                                  Leader
                                </span>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Problem statement */}
                        <div className={`rounded-xl px-3 py-2.5 ${problem ? 'bg-orange-50 border border-orange-100' : 'bg-gray-50 border border-dashed border-gray-200'}`}>
                          {problem ? (
                            <>
                              <p className="text-xs font-semibold text-orange-600 mb-0.5">Selected Problem</p>
                              <p className="text-sm text-gray-700 leading-snug line-clamp-3">{problem.statement}</p>
                            </>
                          ) : (
                            <p className="text-xs text-gray-400 italic">No problem statement selected yet</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()
          )}
        </div>
      ),
    }] : []),
    ...(isOrganizer ? [{
      label: 'Submissions',
      content: (() => {
        const submitted = orgTeams.filter(t => t.repoUrl);
        const notSubmitted = orgTeams.filter(t => !t.repoUrl);
        return (
          <div className="space-y-4">
            {orgTeamsLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
              </div>
            ) : orgTeams.length === 0 ? (
              <div className="flex flex-col items-center py-16 gap-3 text-center">
                <Trophy className="w-10 h-10 text-gray-300" />
                <p className="font-semibold text-gray-500">No teams yet</p>
                <p className="text-sm text-gray-400">Submissions will appear here once teams submit their projects.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-700">{submitted.length} submitted</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-sm text-gray-400">{notSubmitted.length} pending</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {evaluateMsg && (
                      <span className={`text-xs font-medium ${evaluateMsg.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>
                        {evaluateMsg}
                      </span>
                    )}
                    <Button
                      size="sm"
                      disabled={evaluating || submitted.length === 0}
                      onClick={async () => {
                        setEvaluating(true);
                        setEvaluateMsg('');
                        try {
                          await aiService.evaluateEvent(id);
                          setEvaluateMsg('✓ Evaluation queued for all teams');
                        } catch (e) {
                          setEvaluateMsg(e.response?.data || 'Evaluation failed');
                        } finally {
                          setEvaluating(false);
                        }
                      }}
                    >
                      {evaluating ? 'Queuing…' : 'Evaluate All'}
                    </Button>
                  </div>
                </div>
                {submitted.length === 0 ? (
                  <div className="flex flex-col items-center py-12 gap-3 text-center">
                    <Trophy className="w-10 h-10 text-gray-300" />
                    <p className="font-semibold text-gray-500">No submissions yet</p>
                    <p className="text-sm text-gray-400">Teams haven't submitted their projects yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {submitted.map(team => {
                      const problem = eventDetails.problemStatements?.find(p => p.id === team.problemStatementId);
                      return (
                        <div key={team.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
                          {/* Team name */}
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-bold text-gray-900 text-base leading-tight">{team.name}</h4>
                            {team.shortCode && (
                              <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">#{team.shortCode}</span>
                            )}
                          </div>

                          {/* Problem */}
                          <div className={`rounded-xl px-3 py-2.5 ${problem ? 'bg-orange-50 border border-orange-100' : 'bg-gray-50 border border-dashed border-gray-200'}`}>
                            {problem ? (
                              <>
                                <p className="text-xs font-semibold text-orange-600 mb-0.5">Problem Statement</p>
                                <p className="text-sm font-medium text-gray-800">{problem.name}</p>
                              </>
                            ) : (
                              <p className="text-xs text-gray-400 italic">No problem selected</p>
                            )}
                          </div>

                          {/* Repo URL */}
                          <a
                            href={team.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium underline underline-offset-2 break-all"
                          >
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                            {team.repoUrl}
                          </a>

                          {/* Demo URL if present */}
                          {team.demoUrl && (
                            <a
                              href={team.demoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2 break-all"
                            >
                              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                              Demo: {team.demoUrl}
                            </a>
                          )}

                          {/* Submitted time */}
                          {team.submissionTime && (
                            <p className="text-xs text-gray-400">
                              Submitted {new Date(team.submissionTime).toLocaleString()}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        );
      })(),
    }] : []),
    ...(!isOrganizer ? [{
      label: 'Team',
      content: <TeamTab event={eventDetails} myRegistration={myRegistration} />,
    }] : []),
  ];

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header: back | title + code badge (center) | status */}
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

      <Tabs tabs={tabs} />
    </div>
  );
};

export default EventDetails;
