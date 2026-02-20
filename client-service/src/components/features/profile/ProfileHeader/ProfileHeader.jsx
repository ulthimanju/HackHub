import React, { memo } from 'react';
import { Mail, Check, X, Github, Linkedin, Globe, Zap, Loader2 } from 'lucide-react';
import Badge from '../../../common/Badge/Badge';

const LEVEL_COLOR = {
  BEGINNER: 'bg-blue-50 text-blue-600',
  INTERMEDIATE: 'bg-yellow-50 text-yellow-600',
  ADVANCED: 'bg-green-50 text-green-700',
};

const SaveIndicator = ({ status }) => {
  if (status === 'saving') return (
    <span className="flex items-center gap-1.5 text-xs text-gray-400">
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
    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md space-y-6">
      {/* Top row: avatar + identity + save indicator */}
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="relative group shrink-0">
          <div className="w-20 h-20 bg-orange-500 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
            <span className="text-3xl font-extrabold text-white select-none">
              {(user?.displayName || user?.username)?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
          {user?.openToInvites && (
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-4 border-white shadow-sm" title="Open to invites" />
          )}
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              {user?.displayName || user?.username}
            </h2>
            {user?.displayName && (
              <span className="text-sm text-gray-400 font-medium">@{user.username}</span>
            )}
            <Badge variant={user?.role === 'organizer' ? 'success' : 'info'} className="px-3 py-1 capitalize">
              {user?.role}
            </Badge>
            {user?.experienceLevel && (
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${LEVEL_COLOR[user.experienceLevel] || 'bg-gray-100 text-gray-600'}`}>
                <Zap className="inline w-3 h-3 mr-1" />{user.experienceLevel.charAt(0) + user.experienceLevel.slice(1).toLowerCase()}
              </span>
            )}
            {user?.openToInvites && (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-600">
                Open to Invites
              </span>
            )}
          </div>

          <p className="text-gray-500 flex items-center justify-center md:justify-start gap-2 font-medium">
            <Mail className="w-4 h-4 text-orange-500" /> {user?.email}
          </p>

          {/* Social links */}
          {(user?.githubUrl || user?.linkedinUrl || user?.portfolioUrl) && (
            <div className="flex items-center justify-center md:justify-start gap-4 pt-1">
              {user.githubUrl && (
                <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors">
                  <Github className="w-4 h-4" /> GitHub
                </a>
              )}
              {user.linkedinUrl && (
                <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors">
                  <Linkedin className="w-4 h-4" /> LinkedIn
                </a>
              )}
              {user.portfolioUrl && (
                <a href={user.portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-orange-500 transition-colors">
                  <Globe className="w-4 h-4" /> Portfolio
                </a>
              )}
            </div>
          )}

          {/* Skills */}
          <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
            {(user?.skills || []).map(skill => (
              <Badge key={skill} variant="secondary" className="bg-gray-100 text-gray-700 border-none px-3 py-1 text-xs font-semibold">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        <div className="shrink-0">
          <SaveIndicator status={saveStatus} />
        </div>
      </div>

      {/* Bio */}
      {user?.bio && (
        <div className="pt-2 border-t border-gray-50">
          <p className="text-sm text-gray-600 leading-relaxed">{user.bio}</p>
        </div>
      )}
    </div>
  );
});
ProfileHeader.displayName = 'ProfileHeader';
export default ProfileHeader;

