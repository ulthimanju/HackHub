import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { BookOpen, Pencil, X, Save, Eye, Code2 } from 'lucide-react';
import Button from '../../../common/Button/Button';
import eventService from '../../../../services/eventService';

/**
 * Renders markdown anchors safely — strips javascript: hrefs.
 */
const SafeLink = ({ href, children, ...props }) => {
  const safe = href && !href.toLowerCase().startsWith('javascript:');
  if (!safe) return <span>{children}</span>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  );
};

/**
 * Styled markdown renderer.
 * Does NOT allow raw HTML (react-markdown default) — XSS safe.
 */
function MarkdownBody({ children }) {
  return (
    <div className={[
      'text-ink-secondary leading-relaxed text-sm',
      '[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:font-display [&_h1]:text-ink-primary [&_h1]:mt-6 [&_h1]:mb-3',
      '[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:font-display [&_h2]:text-ink-primary [&_h2]:mt-5 [&_h2]:mb-2',
      '[&_h3]:text-base [&_h3]:font-semibold [&_h3]:font-display [&_h3]:text-ink-primary [&_h3]:mt-4 [&_h3]:mb-1',
      '[&_p]:mb-3',
      '[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3',
      '[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3',
      '[&_li]:mb-1',
      '[&_a]:text-brand-600 [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-brand-700',
      '[&_code]:bg-surface-hover [&_code]:text-ink-secondary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono',
      '[&_pre]:bg-surface-hover [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:mb-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0',
      '[&_blockquote]:border-l-4 [&_blockquote]:border-brand-300 [&_blockquote]:pl-4 [&_blockquote]:text-ink-muted [&_blockquote]:italic [&_blockquote]:mb-3',
      '[&_hr]:border-surface-border [&_hr]:my-5',
      '[&_strong]:font-semibold [&_strong]:text-ink-primary',
      '[&_table]:w-full [&_table]:border-collapse [&_table]:mb-3',
      '[&_th]:text-left [&_th]:p-2 [&_th]:border-b [&_th]:border-surface-border [&_th]:font-semibold [&_th]:text-ink-primary [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wide',
      '[&_td]:p-2 [&_td]:border-b [&_td]:border-surface-border',
    ].join(' ')}>
      <ReactMarkdown components={{ a: SafeLink }}>
        {children}
      </ReactMarkdown>
    </div>
  );
}

/**
 * Props:
 *   eventId     – string
 *   permissions – from useEventPermissions (isEventOwner)
 */
export default function ReferencesTab({ eventId, permissions }) {
  const [content, setContent]   = useState('');
  const [draft, setDraft]       = useState('');
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [preview, setPreview]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [saveMsg, setSaveMsg]   = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { contentMd } = await eventService.getReferences(eventId);
      setContent(contentMd || '');
    } catch {
      setContent('');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => { load(); }, [load]);

  const handleEdit = () => {
    setDraft(content);
    setPreview(false);
    setSaveMsg('');
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setSaveMsg('');
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      const { contentMd } = await eventService.updateReferences(eventId, draft);
      setContent(contentMd);
      setEditing(false);
      setSaveMsg('✓ Saved');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch {
      setSaveMsg('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  // ── Edit mode ──────────────────────────────────────────────────────────────
  if (editing) {
    return (
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreview(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                !preview
                  ? 'bg-brand-500 text-white'
                  : 'border border-surface-border text-ink-muted hover:bg-surface-hover'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" /> Write
            </button>
            <button
              onClick={() => setPreview(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                preview
                  ? 'bg-brand-500 text-white'
                  : 'border border-surface-border text-ink-muted hover:bg-surface-hover'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Preview
            </button>
          </div>
          <div className="flex items-center gap-2">
            {saveMsg && (
              <span className={`text-xs font-medium ${saveMsg.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>
                {saveMsg}
              </span>
            )}
            <Button size="sm" variant="ghost" icon={X} onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" icon={Save} disabled={saving} onClick={handleSave}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>

        {/* Write pane */}
        {!preview && (
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            rows={20}
            placeholder={`# References\n\nAdd links, resources, and notes for participants here.\n\nSupports **Markdown** syntax.`}
            className="w-full px-4 py-3 rounded-xl border border-surface-border bg-white text-sm text-ink-primary font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 resize-y"
          />
        )}

        {/* Preview pane */}
        {preview && (
          <div className="min-h-[480px] bg-white rounded-xl border border-surface-border p-5">
            {draft.trim() ? (
              <MarkdownBody>{draft}</MarkdownBody>
            ) : (
              <p className="text-sm text-ink-muted italic">Nothing to preview yet.</p>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── Display mode ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-0.5 h-5 bg-brand-500 rounded-full" />
          <h3 className="text-base font-semibold text-ink-primary font-display">References</h3>
        </div>
        <div className="flex items-center gap-2">
          {saveMsg && (
            <span className="text-xs font-medium text-green-600">{saveMsg}</span>
          )}
          {permissions.isEventOwner && (
            <button
              onClick={handleEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-brand-600 border border-brand-200 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
          )}
        </div>
      </div>

      {content.trim() ? (
        <div className="bg-white rounded-xl border border-surface-border shadow-card p-5">
          <MarkdownBody>{content}</MarkdownBody>
        </div>
      ) : (
        <div className="flex flex-col items-center py-16 gap-3 text-center">
          <BookOpen className="w-9 h-9 text-ink-disabled" />
          <p className="font-medium text-ink-muted">No references yet</p>
          {permissions.isEventOwner ? (
            <p className="text-sm text-ink-muted">
              Add links, resources, and docs for participants.{' '}
              <button onClick={handleEdit} className="text-brand-600 hover:text-brand-700 font-medium underline">
                Add references
              </button>
            </p>
          ) : (
            <p className="text-sm text-ink-muted">The organizer hasn't added any references yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
