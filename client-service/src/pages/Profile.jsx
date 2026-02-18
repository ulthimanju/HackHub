import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';
import Alert from '../components/common/Alert/Alert';
import Section from '../components/common/Section/Section';
import Badge from '../components/common/Badge/Badge';
import Input from '../components/common/Input/Input';
import { User, Shield } from 'lucide-react';

// Refactored Components
import ProfileHeader from '../components/features/profile/ProfileHeader/ProfileHeader';
import SkillTags from '../components/features/profile/SkillTags/SkillTags';
import StatsCard from '../components/features/profile/StatsCard/StatsCard';
import UpgradeSection from '../components/features/profile/UpgradeSection/UpgradeSection';

const Profile = () => {
  const { user, logout, updateUserData, updateAuth } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    skills: user?.skills || []
  });
  const [newSkill, setNewSkill] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        skills: user.skills || []
      });
    }
  }, [user]);

  const handleRequestOtp = async () => {
    setError('');
    setSuccess('');
    setOtpLoading(true);
    try {
      await authService.requestRoleUpgradeOtp(user.email);
      setSuccess('Upgrade OTP has been sent to your email.');
      setShowOtpInput(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleUpgrade = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the OTP.');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await authService.upgradeRole(user.email, otp);
      // Fetch fresh profile to get updated role and a new token
      const updatedProfile = await authService.getProfile();
      updateUserData(updatedProfile);
      // Old token is now blacklisted server-side; force re-login to get token with ORGANIZER role
      setSuccess('Your account has been upgraded to ORGANIZER! Please log in again to activate your new permissions.');
      setShowOtpInput(false);
      setOtp('');
      setTimeout(() => logout(), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Role upgrade failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const updatedUser = await authService.updateProfile(formData);
      updateUserData(updatedUser);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skillToRemove) });
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 pb-20">
      {/* 1. Header with Avatar & Core Info */}
      <ProfileHeader 
        user={user} 
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onCancel={() => setIsEditing(false)}
        onSave={handleUpdateProfile}
        loading={loading}
      />

      {/* 2. Notifications */}
      {(error || success) && (
        <div className="animate-in slide-in-from-top-2">
          {error && <Alert type="error" title="Action Required">{error}</Alert>}
          {success && <Alert type="success" title="Notification">{success}</Alert>}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* 3. Edit Form (Revealed when editing) */}
          {isEditing && (
            <Section title="Edit your professional profile">
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-8">
                <div className="grid grid-cols-1 gap-6">
                  <Input
                    label="Display Name (Unique ID)"
                    icon={User}
                    value={formData.username}
                    disabled
                    placeholder="Your unique identifier"
                    className="rounded-xl bg-gray-50 cursor-not-allowed opacity-75"
                  />

                  <SkillTags 
                    skills={formData.skills}
                    newSkill={newSkill}
                    onNewSkillChange={setNewSkill}
                    onAddSkill={handleAddSkill}
                    onRemoveSkill={handleRemoveSkill}
                  />
                </div>
              </div>
            </Section>
          )}

          {/* 4. Security & Role Management */}
          {!isEditing && (
            <div className="space-y-8">
              <Section title="Account Security">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 bg-white border border-gray-100 rounded-2xl flex items-center justify-between hover:border-blue-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">MFA Status</p>
                        <p className="text-xs text-gray-500 font-medium">OTP Verification Active</p>
                      </div>
                    </div>
                    <Badge variant="success">Enabled</Badge>
                  </div>
                  
                  <div className="p-5 bg-white border border-gray-100 rounded-2xl flex items-center justify-between hover:border-purple-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Account Type</p>
                        <p className="text-xs text-gray-500 font-medium capitalize">{user?.role} Access</p>
                      </div>
                    </div>
                    <Badge variant={user?.role === 'organizer' ? 'success' : 'info'} className="capitalize">
                      {user?.role}
                    </Badge>
                  </div>
                </div>
              </Section>

              {user?.role === 'participant' && (
                <UpgradeSection 
                  showOtpInput={showOtpInput}
                  otp={otp}
                  onOtpChange={setOtp}
                  onRequestOtp={handleRequestOtp}
                  onUpgrade={handleUpgrade}
                  otpLoading={otpLoading}
                  loading={loading}
                />
              )}
            </div>
          )}
        </div>

        {/* 5. Sidebar Stats & Help */}
        <div className="space-y-8">
          <Section title="Activity Overview">
            <div className="grid grid-cols-1 gap-4">
              <StatsCard label="Hackathons Joined" value="0" variant="orange" />
              <StatsCard label="Team Collaborations" value="0" variant="blue" />
              <StatsCard label="Project Submissions" value="0" variant="purple" />
            </div>
          </Section>

          <div className="bg-gray-900 p-8 rounded-3xl text-white space-y-5 relative overflow-hidden group shadow-xl">
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl group-hover:bg-orange-500/30 transition-all"></div>
            <div className="space-y-2 relative z-10">
              <h4 className="font-black text-xl">Member Support</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Need help with your account or team settings? Our documentation has everything you need.
              </p>
            </div>
            <button className="w-full py-3 bg-white/10 border border-white/10 rounded-xl text-sm font-bold hover:bg-white hover:text-gray-900 transition-all relative z-10">
              Explore Documentation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
