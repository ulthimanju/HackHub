import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';
import Alert from '../components/common/Alert/Alert';
import Section from '../components/common/Section/Section';
import Input from '../components/common/Input/Input';
import Button from '../components/common/Button/Button';
import Modal from '../components/common/Modal/Modal';
import { User, LogIn } from 'lucide-react';

// Refactored Components
import ProfileHeader from '../components/features/profile/ProfileHeader/ProfileHeader';
import SkillTags from '../components/features/profile/SkillTags/SkillTags';
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
  const [reLoginModal, setReLoginModal] = useState(false);

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
      setShowOtpInput(false);
      setOtp('');
      setReLoginModal(true);
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
      <ProfileHeader 
        user={user} 
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onCancel={() => setIsEditing(false)}
        onSave={handleUpdateProfile}
        loading={loading}
      />

      {(error || success) && (
        <div className="animate-in slide-in-from-top-2">
          {error && <Alert type="error" title="Action Required">{error}</Alert>}
          {success && <Alert type="success" title="Notification">{success}</Alert>}
        </div>
      )}

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

      {!isEditing && user?.role === 'participant' && (
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

      <Modal
        isOpen={reLoginModal}
        onClose={() => {}}
        title="Role Updated Successfully"
        footer={
          <div className="flex justify-end">
            <Button variant="primary" onClick={logout}>
              Continue
            </Button>
          </div>
        }
      >
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center">
            <LogIn className="w-8 h-8 text-orange-500" />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">Need to re-login</p>
            <p className="text-sm text-gray-500 mt-1 max-w-xs">
              Your role has been upgraded to <span className="font-semibold text-gray-800">Organizer</span>. Please log in again for the changes to take effect.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
