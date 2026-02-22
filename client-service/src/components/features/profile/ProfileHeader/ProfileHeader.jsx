import React, { memo } from 'react';
import { Mail, Check, X, Github, Linkedin, Globe, Zap, Loader2 } from 'lucide-react';
import Badge from '../../../common/Badge/Badge';

const LEVEL_COLOR = {
  BEGINNER:     'bg-blue-50 text-blue-600',
  INTERMEDIATE: 'bg-amber-50 text-amber-600',
  ADVANCED:     'bg-green-50 text-green-700',
};

const SaveIndicator = ({ status }) => {
  if (status === 'saving') return (
    <span className="flex items-center gap-1.5 text-xs text-ink-muted">
      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…
    </span>
  );
  if (status === 'saved') return (
    <span className="flex items-center gap-1.5 text-xs text-green-600">
      <Check className="w-3.5 h-3.5" /> Saved
    </span>
  );
  if (status === 'error') return (
    <span className="flex items-center gap-1.5 text-xs text-red-500">
      <X className="w-3.5 h-3.5" /> Save failed
    </span>
  );
  return null;
};

const ProfileHeader = memo(({ user, saveStatus = 'idle' }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-surface-border shadow-card space-y-5">
      {/* Top row: avatar + identity + save indicator */}
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="relative shrink-0">
          <div className="w-16 h-16 bg-brand-500 rounded-xl flex items-center justify-center">
            <span className="text-2xl font-bold text-white select-none font-display">
              {(user?.displayName || user?.username)?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
          {user?.openToInvites && (
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white" title="Open to invites" />
          )}
        </div>

        <div className="flex-1 text-center md:text-left space-y-1.5">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <h2 className="font-display font-semibold text-xl text-ink-primary">
              {user?.displayName || user?.username}
            </h2>
            {user?.displayName && (
              <span className="text-sm text-ink-muted">@{user.username}</span>
            )}
            <Badge variant={user?.role === 'organizer' ? 'success' : 'info'} className="capitalize">
              {user?.role}
            </Badge>
            {user?.experienceLevel && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${LEVEL_COLOR[user.experienceLevel] || 'bg-surface-hover text-ink-muted'}`}>
                <Zap className="inline w-3 h-3 mr-0.5" />{user.experienceLevel.charAt(0) + user.experienceLevel.slice(1).toLowerCase()}
              </span>
            )}
            {user?.openToInvites && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600">
                Open to Invites
              </span>
            )}
          </div>

          <p className="text-ink-muted text-sm flex items-center justify-center md:justify-start gap-1.5">
            <Mail className="w-3.5 h-3.5 text-brand-500" /> {user?.email}
          </p>

          {/* Social links */}
          {(user?.githubUrl || user?.linkedinUrl || user?.portfolioUrl) && (
            <div className="flex items-center justify-center md:justify-start gap-4 pt-0.5">
              {user.githubUrl && (
                <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-ink-muted hover:text-ink-primary transition-colors">
                  <Github className="w-3.5 h-3.5" /> GitHub
                </a>
              )}
              {user.linkedinUrl && (
                <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-ink-muted hover:text-blue-600 transition-colors">
                  <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                </a>
              )}
              {user.portfolioUrl && (
                <a href={user.portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-ink-muted hover:text-brand-500 transition-colors">
                  <Globe className="w-3.5 h-3.5" /> Portfolio
                </a>
              )}
            </div>
          )}

          {/* Skills */}
          {(user?.skills || []).length > 0 && (
            <div className="flex flex-wrap justify-center md:justify-start gap-1.5 pt-1">
              {(user.skills).map(skill => (
                <span key={skill} className="text-xs bg-surface-hover text-ink-secondary border border-surface-border px-2 py-0.5 rounded-md font-medium">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="shrink-0">
          <SaveIndicator status={saveStatus} />
        </div>
      </div>

      {/* Bio */}
      {user?.bio && (
        <div className="pt-3 border-t border-surface-border">
          <p className="text-sm text-ink-secondary leading-relaxed">{user.bio}</p>
        </div>
      )}
    </div>
  );
});
ProfileHeader.displayName = 'ProfileHeader';
export default ProfileHeader;

