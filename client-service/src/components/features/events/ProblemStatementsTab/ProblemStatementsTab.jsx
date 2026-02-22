import React, { useState } from 'react';
import { BookOpen, FileQuestion, Plus, Trash2, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../common/Button/Button';
import Modal from '../../../common/Modal/Modal';
import Alert from '../../../common/Alert/Alert';

const emptyRow = () => ({ name: '', statement: '', requirements: '' });

/**
 * Props:
 *   eventId      – event id (for navigation to add page)
 *   problems     – eventDetails.problemStatements array
 *   permissions  – from useEventPermissions
 *   onUpdate     – async (id, {name,statement,requirements}) => void
 *   onDelete     – async (id) => void
 */
export default function ProblemStatementsTab({ eventId, problems, permissions, onUpdate, onDelete }) {
  const navigate = useNavigate();
  const [deletingId, setDeletingId]         = useState(null);
  const [editProblem, setEditProblem]       = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError]           = useState('');

  const closeAddModal = () => {};  // kept for compat; Add is now a page

  const handleDelete = async (id) => {
    setDeletingId(id);
    try { await onDelete(id); }
    catch { /* silently ignore */ }
    finally { setDeletingId(null); }
  };

  const handleUpdate = async () => {
    if (!editProblem?.statement?.trim()) return;
    setEditSubmitting(true);
    setEditError('');
    try {
      await onUpdate(editProblem.id, {
        name:         editProblem.name.trim(),
        statement:    editProblem.statement.trim(),
        requirements: editProblem.requirements.trim(),
      });
      setEditProblem(null);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update problem statement.');
    } finally {
      setEditSubmitting(false);
    }
  };

  const filledCount = 0; // unused; kept to avoid refactor of button label

  return (
    <div>
      {problems && problems.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-0.5 h-5 bg-brand-500 rounded-full" />
              <h3 className="text-base font-semibold text-ink-primary font-display">Problem Statements</h3>
            </div>
            {permissions.canAddProblem && (
              <Button variant="primary" size="sm" icon={Plus} onClick={() => navigate(`/events/${eventId}/problems/add`)}>
                Add Problem
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {problems.map((problem, index) => (
              <div key={problem.id || index} className="bg-white rounded-xl p-4 border border-surface-border shadow-card flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold tracking-widest text-ink-muted uppercase mb-1">Problem {index + 1}</p>
                  {problem.name && <p className="text-base font-semibold text-ink-primary font-display mb-1">{problem.name}</p>}
                  <p className="text-ink-secondary leading-relaxed">{problem.statement}</p>
                  {problem.requirements && (
                    <div className="mt-2 pt-2 border-t border-surface-border">
                      <p className="text-xs font-semibold tracking-widest text-brand-500 uppercase mb-1">Requirements</p>
                      <p className="text-sm text-ink-secondary leading-relaxed">{problem.requirements}</p>
                    </div>
                  )}
                </div>
                {permissions.canEditProblem && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setEditProblem({ id: problem.id, name: problem.name || '', statement: problem.statement, requirements: problem.requirements || '' })}
                      title="Edit problem"
                      className="p-1.5 text-ink-disabled hover:text-brand-500 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    {permissions.canDeleteProblem && (
                      <button
                        onClick={() => handleDelete(problem.id)}
                        disabled={deletingId === problem.id}
                        title="Delete problem"
                        className="p-1.5 text-ink-disabled hover:text-red-500 disabled:opacity-40 transition-colors"
                      >
                        {deletingId === problem.id
                          ? <div className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                          : <Trash2 className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-16 h-16 bg-surface-hover rounded-xl flex items-center justify-center">
            <FileQuestion className="w-8 h-8 text-ink-disabled" />
          </div>
          <p className="text-base font-semibold text-ink-muted">No problems yet</p>
          <p className="text-sm text-ink-muted max-w-xs">Problem statements haven't been added for this event yet. Check back later.</p>
          {permissions.canAddProblem && (
            <Button variant="primary" size="sm" icon={Plus} onClick={() => navigate(`/events/${eventId}/problems/add`)}>
              Add Problem
            </Button>
          )}
        </div>
      )}

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
              onClick={handleUpdate}
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
              <label className="block text-sm font-medium text-ink-secondary mb-1">Name <span className="text-red-400">*</span></label>
              <input
                className="w-full border border-surface-border rounded-lg px-4 py-2.5 text-sm text-ink-primary placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400"
                placeholder={`e.g. "Smart City Solution"`}
                value={editProblem.name}
                onChange={e => setEditProblem(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-secondary mb-1">Problem Statement <span className="text-red-400">*</span></label>
              <textarea
                className="w-full border border-surface-border rounded-lg px-4 py-3 text-sm text-ink-primary placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 resize-none"
                rows={4}
                value={editProblem.statement}
                onChange={e => setEditProblem(prev => ({ ...prev, statement: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-secondary mb-1">Requirements <span className="text-red-400">*</span></label>
              <textarea
                className="w-full border border-surface-border rounded-lg px-4 py-2.5 text-sm text-ink-primary placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 resize-none"
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
  );
}
