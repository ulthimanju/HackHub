import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Trash2, Users, ChevronRight, CheckCircle2, ToggleLeft, ToggleRight } from 'lucide-react';
import Alert from '@/components/common/Alert/Alert';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import Modal from '@/components/common/Modal/Modal';
import { extractErrorMessage } from '@/services/api';
import eventService from '@/services/eventService';
import { STATUS_ORDER, STATUS_META, ADVANCE_INFO } from '@/constants/eventPhases';

const FLOW = STATUS_ORDER.map(s => ({ status: s, shortLabel: STATUS_META[s].shortLabel }));


/**
 * Settings tab for event owners — advance status, participant limits, and danger-zone actions.
 *
 * @param {{
 *   event: object,
 *   onUpdateEvent: (data: object) => Promise<void>,
 *   onDeleteEvent: (navigate: Function) => Promise<void>,
 *   advancingStatus: boolean,
 *   advanceError: string,
 *   setConfirmAdvance: Function,
 * }} props
 */
export default function SettingsTab({ event, permissions, onUpdateEvent, onDeleteEvent, advancingStatus, advanceError, setConfirmAdvance }) {
  const navigate = useNavigate();

  // Advance status
  const currentIdx  = FLOW.findIndex(s => s.status === event?.status);
  const canAdvance  = currentIdx >= 0 && currentIdx < FLOW.length - 1;
  const advanceInfo = ADVANCE_INFO[event?.status];

  const [judgingEnabled,  setJudgingEnabled]  = useState(event?.judging !== false);
  const [togglingJudging, setTogglingJudging] = useState(false);
  const [toggleError,     setToggleError]     = useState('');
  const handleToggleJudging = async () => {
    setTogglingJudging(true);
    setToggleError('');
    try {
      const result = await eventService.toggleJudging(event.id);
      setJudgingEnabled(result === 'JUDGING_ENABLED');
    } catch (err) {
      setToggleError(extractErrorMessage(err, 'Failed to update judging setting.'));
    } finally {
      setTogglingJudging(false);
    }
  };

  // Participant settings
  const [maxParticipants, setMaxParticipants] = useState(
    event?.maxParticipants != null ? String(event.maxParticipants) : ''
  );
  const [teamSize, setTeamSize] = useState(
    event?.teamSize != null ? String(event.teamSize) : '1'
  );
  const [saving,      setSaving]      = useState(false);
  const [saveError,   setSaveError]   = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveParticipants = async () => {
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      await onUpdateEvent({
        ...event,
        maxParticipants: maxParticipants ? parseInt(maxParticipants, 10) : null,
        teamSize: teamSize ? parseInt(teamSize, 10) : null,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(extractErrorMessage(err, 'Failed to update settings.'));
    } finally {
      setSaving(false);
    }
  };

  // Delete
  const [deleteOpen,  setDeleteOpen]  = useState(false);
  const [deleting,    setDeleting]    = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await onDeleteEvent(navigate);
    } catch (err) {
      setDeleteError(extractErrorMessage(err, 'Failed to delete event.'));
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">

      {/* Advance Status */}
      <section>
        <div className="mb-4">
          <h3 className="text-base font-semibold text-ink-primary">Event Status</h3>
          <p className="text-sm text-ink-muted mt-0.5">Move the event to the next phase in its lifecycle.</p>
        </div>

        <div className="bg-white rounded-xl border border-surface-border shadow-card p-5">
          {canAdvance && advanceInfo ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-ink-secondary">{advanceInfo.desc}</p>
              {advanceError && <p className="text-xs text-red-500">{advanceError}</p>}
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  variant="primary"
                  size="sm"
                  icon={ChevronRight}
                  disabled={advancingStatus}
                  loading={advancingStatus}
                  onClick={() => {
                    const next = FLOW[currentIdx + 1];
                    setConfirmAdvance({
                      open: true,
                      currentLabel: FLOW[currentIdx].shortLabel,
                      nextLabel: next.shortLabel,
                      desc: advanceInfo.desc,
                    });
                  }}
                >
                  {advancingStatus ? 'Advancing...' : `Advance to ${FLOW[currentIdx + 1]?.shortLabel}`}
                </Button>

                {event?.status === 'ONGOING' && (
                  <button
                    disabled={togglingJudging}
                    onClick={handleToggleJudging}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors disabled:opacity-60 ${
                      judgingEnabled
                        ? 'border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100'
                        : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    {judgingEnabled
                      ? <><ToggleRight className="w-3.5 h-3.5 inline mr-1" />Judging: On</>
                      : <><ToggleLeft className="w-3.5 h-3.5 inline mr-1" />Judging: Off</>}
                  </button>
                )}
              </div>
              {toggleError && <p className="text-xs text-red-500">{toggleError}</p>}
            </div>
          ) : (
            <p className="text-sm text-ink-muted flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
              Event complete — no further transitions.
            </p>
          )}
        </div>
      </section>

      {/* Participant Settings — hidden when editing is not allowed in this phase */}
      {(permissions?.canEditEvent !== false) && (
      <section>
        <div className="mb-4">
          <h3 className="text-base font-semibold text-ink-primary">Participant Settings</h3>
        </div>

        {saveError   && <Alert type="error"   className="mb-4">{saveError}</Alert>}
        {saveSuccess && <Alert type="success" className="mb-4">Settings saved successfully.</Alert>}

        <div className="bg-white rounded-xl border border-surface-border shadow-card p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Max Participants"
              name="maxParticipants"
              type="number"
              icon={Users}
              value={maxParticipants}
              onChange={e => setMaxParticipants(e.target.value)}
              placeholder="Unlimited"
            />
            <Input
              label="Team Size"
              name="teamSize"
              type="number"
              min="1"
              icon={Users}
              value={teamSize}
              onChange={e => setTeamSize(e.target.value)}
            />
          </div>
          <div className="flex justify-end mt-5 pt-4 border-t border-surface-border">
            <Button variant="primary" onClick={handleSaveParticipants} loading={saving}>
              Save Changes
            </Button>
          </div>
        </div>
      </section>
      )}

      {/* Danger Zone */}
      <section>
        <div className="mb-4">
          <h3 className="text-base font-semibold text-red-600">Danger Zone</h3>
          <p className="text-sm text-ink-muted mt-0.5">These actions are irreversible. Proceed with caution.</p>
        </div>

        <div className="bg-white rounded-xl border border-red-200 shadow-card p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-ink-primary">Delete this event</p>
            <p className="text-xs text-ink-muted mt-0.5">
              Permanently removes the event, all registrations, and all team data.
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={() => { setDeleteError(''); setDeleteOpen(true); }}
          >
            Delete Event
          </Button>
        </div>
      </section>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteOpen}
        onClose={() => !deleting && setDeleteOpen(false)}
        title="Delete Event"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" icon={Trash2} onClick={handleDelete} loading={deleting}>
              {deleting ? 'Deleting...' : 'Yes, Delete Event'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {deleteError && <Alert type="error">{deleteError}</Alert>}
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-100">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="text-sm text-red-700">
              <p className="font-semibold mb-1">This cannot be undone.</p>
              <p>
                Deleting <span className="font-medium">"{event?.name}"</span> will permanently
                remove all registrations, teams, submissions, and problem statements associated
                with this event.
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
