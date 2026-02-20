import React, { useState } from 'react';
import { BookOpen, FileQuestion, Plus, Trash2, Pencil } from 'lucide-react';
import Button from '../../../common/Button/Button';
import Modal from '../../../common/Modal/Modal';
import Alert from '../../../common/Alert/Alert';

const emptyRow = () => ({ name: '', statement: '', requirements: '' });

/**
 * Props:
 *   problems     – eventDetails.problemStatements array
 *   permissions  – from useEventPermissions
 *   onAdd        – async (filledRows[]) => void   (parent does API + refresh)
 *   onUpdate     – async (id, {name,statement,requirements}) => void
 *   onDelete     – async (id) => void
 */
export default function ProblemStatementsTab({ problems, permissions, onAdd, onUpdate, onDelete }) {
  const [addOpen, setAddOpen]           = useState(false);
  const [rows, setRows]                 = useState([emptyRow()]);
  const [submitting, setSubmitting]     = useState(false);
  const [submitError, setSubmitError]   = useState('');
  const [deletingId, setDeletingId]     = useState(null);
  const [editProblem, setEditProblem]   = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError]       = useState('');

  const closeAddModal = () => {
    setAddOpen(false);
    setRows([emptyRow()]);
    setSubmitError('');
  };

  const updateRow = (index, field, value) =>
    setRows(prev => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));

  const handleAdd = async () => {
    const filled = rows.filter(r => r.name.trim() && r.statement.trim() && r.requirements.trim());
    if (!filled.length) {
      setSubmitError('Each problem requires a name, statement, and requirements.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      await onAdd(filled.map(r => ({ name: r.name.trim(), statement: r.statement.trim(), requirements: r.requirements.trim() })));
      closeAddModal();
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to add problem statements.');
    } finally {
      setSubmitting(false);
    }
  };

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

  const filledCount = rows.filter(r => r.name.trim() && r.statement.trim() && r.requirements.trim()).length;

  return (
    <div>
      {problems && problems.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-orange-500 rounded-full" />
              <h3 className="text-lg font-bold text-gray-900">Problem Statements</h3>
            </div>
            {permissions.canAddProblem && (
              <Button variant="primary" size="sm" icon={Plus} onClick={() => setAddOpen(true)}>
                Add Problem
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {problems.map((problem, index) => (
              <div key={problem.id || index} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">Problem {index + 1}</p>
                  {problem.name && <p className="text-base font-bold text-gray-900 mb-1">{problem.name}</p>}
                  <p className="text-gray-700 leading-relaxed">{problem.statement}</p>
                  {problem.requirements && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs font-bold tracking-widest text-orange-400 uppercase mb-1">Requirements</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{problem.requirements}</p>
                    </div>
                  )}
                </div>
                {permissions.canEditProblem && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setEditProblem({ id: problem.id, name: problem.name || '', statement: problem.statement, requirements: problem.requirements || '' })}
                      title="Edit problem"
                      className="p-1.5 text-gray-300 hover:text-orange-400 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    {permissions.canDeleteProblem && (
                      <button
                        onClick={() => handleDelete(problem.id)}
                        disabled={deletingId === problem.id}
                        title="Delete problem"
                        className="p-1.5 text-gray-300 hover:text-red-400 disabled:opacity-40 transition-colors"
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
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center">
            <FileQuestion className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-lg font-semibold text-gray-500">No problems yet</p>
          <p className="text-sm text-gray-400 max-w-xs">Problem statements haven't been added for this event yet. Check back later.</p>
          {permissions.canAddProblem && (
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setAddOpen(true)}>
              Add Problem
            </Button>
          )}
        </div>
      )}

      {/* Add Problem Modal */}
      <Modal
        isOpen={addOpen}
        onClose={closeAddModal}
        title="Add Problem Statements"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={closeAddModal}>Cancel</Button>
            <Button
              variant="primary"
              onClick={handleAdd}
              disabled={!filledCount || submitting}
            >
              {submitting ? 'Adding…' : `Add ${filledCount || ''} Problem${filledCount !== 1 ? 's' : ''}`}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {submitError && <Alert type="error">{submitError}</Alert>}
          {rows.map((r, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center shrink-0 mt-3">
                <span className="text-xs font-bold text-blue-500">{index + 1}</span>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                  placeholder={`Problem name * — e.g. "Smart City Solution"`}
                  value={r.name}
                  onChange={e => updateRow(index, 'name', e.target.value)}
                />
                <textarea
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 resize-none"
                  rows={3}
                  placeholder={`Problem statement ${index + 1} *`}
                  value={r.statement}
                  onChange={e => updateRow(index, 'statement', e.target.value)}
                />
                <textarea
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 resize-none"
                  rows={2}
                  placeholder="Requirements * — e.g. must use React, open source only…"
                  value={r.requirements}
                  onChange={e => updateRow(index, 'requirements', e.target.value)}
                />
              </div>
              {rows.length > 1 && (
                <button
                  onClick={() => setRows(prev => prev.filter((_, i) => i !== index))}
                  className="mt-3 p-1.5 text-gray-300 hover:text-red-400 transition-colors shrink-0"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => setRows(prev => [...prev, emptyRow()])}
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
              <label className="block text-sm font-semibold text-gray-700 mb-1">Name <span className="text-red-400">*</span></label>
              <input
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                placeholder={`e.g. "Smart City Solution"`}
                value={editProblem.name}
                onChange={e => setEditProblem(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Problem Statement <span className="text-red-400">*</span></label>
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
  );
}
