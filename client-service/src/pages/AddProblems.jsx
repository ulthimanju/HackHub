import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import eventService from '../services/eventService';
import Button from '../components/common/Button/Button';
import Alert from '../components/common/Alert/Alert';
import { ArrowLeft, BookOpen, Plus, Trash2 } from 'lucide-react';

const emptyRow = () => ({ name: '', statement: '', requirements: '' });

export default function AddProblems() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [rows, setRows]           = useState([emptyRow()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');

  const updateRow = (index, field, value) =>
    setRows(prev => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));

  const removeRow = (index) =>
    setRows(prev => prev.filter((_, i) => i !== index));

  const filledRows = rows.filter(r => r.name.trim() && r.statement.trim() && r.requirements.trim());

  const handleSubmit = async () => {
    if (!filledRows.length) {
      setError('Each problem requires a name, statement, and requirements.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await eventService.addProblemStatementsBulk(
        id,
        filledRows.map(r => ({ name: r.name.trim(), statement: r.statement.trim(), requirements: r.requirements.trim() }))
      );
      navigate(`/events/${id}`, { state: { tab: 'Problems' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add problem statements.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-surface-hover text-ink-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-display font-semibold text-2xl text-ink-primary">Add Problem Statements</h1>
          <p className="text-sm text-ink-muted mt-0.5">Fill in each problem's details. All fields are required.</p>
        </div>
      </div>

      {error && <Alert type="error" title="Error">{error}</Alert>}

      {/* Problems form */}
      <div className="bg-white border border-surface-border rounded-xl shadow-card p-6 space-y-0">
        {rows.map((r, index) => (
          <React.Fragment key={index}>
            {/* Divider between problems */}
            {index > 0 && (
              <div className="flex items-center gap-3 py-5">
                <div className="flex-1 border-t border-surface-border" />
                <span className="text-xs font-semibold text-ink-disabled uppercase tracking-wide px-1">
                  Problem {index + 1}
                </span>
                <div className="flex-1 border-t border-surface-border" />
              </div>
            )}

            <div className="flex gap-4 items-start">
              {/* Number badge */}
              <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center shrink-0 mt-1">
                <span className="text-xs font-bold text-blue-500">{index + 1}</span>
              </div>

              {/* Fields */}
              <div className="flex-1 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-ink-muted uppercase tracking-wide mb-1.5">
                    Problem Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full border border-surface-border rounded-lg px-3 py-2.5 text-sm text-ink-primary placeholder-ink-muted/70 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition-all"
                    placeholder='e.g. "Smart City Solution"'
                    value={r.name}
                    onChange={e => updateRow(index, 'name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-muted uppercase tracking-wide mb-1.5">
                    Statement <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full border border-surface-border rounded-lg px-3 py-2.5 text-sm text-ink-primary placeholder-ink-muted/70 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 resize-none transition-all"
                    rows={4}
                    placeholder="Describe the problem participants need to solve…"
                    value={r.statement}
                    onChange={e => updateRow(index, 'statement', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-muted uppercase tracking-wide mb-1.5">
                    Requirements <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full border border-surface-border rounded-lg px-3 py-2.5 text-sm text-ink-primary placeholder-ink-muted/70 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 resize-none transition-all"
                    rows={3}
                    placeholder="e.g. must use React, open source only, must deploy online…"
                    value={r.requirements}
                    onChange={e => updateRow(index, 'requirements', e.target.value)}
                  />
                </div>
              </div>

              {/* Remove button */}
              {rows.length > 1 && (
                <button
                  onClick={() => removeRow(index)}
                  className="p-1.5 text-ink-disabled hover:text-red-500 transition-colors shrink-0 mt-1"
                  title="Remove problem"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </React.Fragment>
        ))}

        {/* Add another */}
        <div className="pt-5">
          <button
            onClick={() => setRows(prev => [...prev, emptyRow()])}
            className="flex items-center gap-2 text-sm font-medium text-brand-500 hover:text-brand-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add another problem
          </button>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
        <Button
          variant="primary"
          size="lg"
          icon={BookOpen}
          onClick={handleSubmit}
          loading={submitting}
          disabled={!filledRows.length || submitting}
        >
          {submitting ? 'Adding…' : `Add ${filledRows.length || ''} Problem${filledRows.length !== 1 ? 's' : ''}`}
        </Button>
      </div>
    </div>
  );
}
