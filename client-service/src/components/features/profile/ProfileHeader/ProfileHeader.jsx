import React, { memo } from 'react';
import { Mail, Edit2, Check, X } from 'lucide-react';
import Badge from '../../../common/Badge/Badge';
import Button from '../../../common/Button/Button';
import profileSvg from '../../../../assets/images/profile.svg';

const ProfileHeader = memo(({ user, isEditing, onEdit, onCancel, onSave, loading }) => {
  return (
    <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
      <div className="relative group">
        <div className="w-32 h-32 bg-orange-50 rounded-full flex items-center justify-center border-4 border-orange-100 overflow-hidden shadow-inner transition-transform group-hover:scale-105">
          <img 
            src={profileSvg} 
            alt="Profile Avatar" 
            className="w-24 h-24 object-contain"
          />
        </div>
        <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-white shadow-sm"></div>
      </div>
      
      <div className="flex-1 text-center md:text-left space-y-2">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{user?.username}</h2>
          <Badge variant={user?.role === 'organizer' ? 'success' : 'info'} className="px-3 py-1 capitalize">
            {user?.role}
          </Badge>
        </div>
        <p className="text-gray-500 flex items-center justify-center md:justify-start gap-2 font-medium">
          <Mail className="w-4 h-4 text-orange-500" /> {user?.email}
        </p>
        <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
          {(user?.skills || []).map(skill => (
            <Badge key={skill} variant="secondary" className="bg-gray-100 text-gray-700 border-none px-3 py-1 text-xs font-semibold">
              {skill}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        {!isEditing ? (
          <Button variant="outline" icon={Edit2} onClick={onEdit}>
            Edit Profile
          </Button>
        ) : (
          <>
            <Button variant="secondary" icon={X} onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="primary" icon={Check} onClick={onSave} loading={loading}>
              Save Changes
            </Button>
          </>
        )}
      </div>
    </div>
  );
});
ProfileHeader.displayName = 'ProfileHeader';
export default ProfileHeader;
