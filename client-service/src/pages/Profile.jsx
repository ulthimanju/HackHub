import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';
import Alert from '../components/common/Alert/Alert';
import Section from '../components/common/Section/Section';
import Input from '../components/common/Input/Input';
import { User, Github, Linkedin, Globe, ChevronDown } from 'lucide-react';

// Refactored Components
import ProfileHeader from '../components/features/profile/ProfileHeader/ProfileHeader';
import SkillTags from '../components/features/profile/SkillTags/SkillTags';
import UpgradeSection from '../components/features/profile/UpgradeSection/UpgradeSection';

const EXPERIENCE_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

const Profile = () => {
  const { user, logout, updateUserData, updateAuth } = useAuth();
  const [formData, setFormData] = useState({
    username: user?.username || '',
    skills: user?.skills || [],
    bio: user?.bio || '',
    githubUrl: user?.githubUrl || '',
    linkedinUrl: user?.linkedinUrl || '',
    portfolioUrl: user?.portfolioUrl || '',
    experienceLevel: user?.experienceLevel || '',
    openToInvites: user?.openToInvites ?? true,
    displayName: user?.displayName || '',
  });
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const initializedRef = useRef(false);
  const debounceRef = useRef(null);
  const formDataRef = useRef(formData);
  const savedSnapshotRef = useRef(JSON.stringify(formData)); // tracks last saved state
  const mountedRef = useRef(true);

  useEffect(() => () => { mountedRef.current = false; }, []);
  useEffect(() => { formDataRef.current = formData; }, [formData]);

  // One-time init from user context — prevents re-sync loop after save
  useEffect(() => {
    if (user && !initializedRef.current) {
      const initial = {
        username: user.username,
        skills: user.skills || [],
        bio: user.bio || '',
        githubUrl: user.githubUrl || '',
        linkedinUrl: user.linkedinUrl || '',
        portfolioUrl: user.portfolioUrl || '',
        experienceLevel: user.experienceLevel || '',
        openToInvites: user.openToInvites ?? true,
        displayName: user.displayName || '',
      };
      setFormData(initial);
      savedSnapshotRef.current = JSON.stringify(initial);
      setTimeout(() => { initializedRef.current = true; }, 100);
    }
  }, [user]);

  const isDirty = () => JSON.stringify(formDataRef.current) !== savedSnapshotRef.current;

  const doSave = useCallback(async (data) => {
    if (!isDirty()) return; // nothing changed — skip
    const payload = { ...data, experienceLevel: data.experienceLevel || null };
    if (mountedRef.current) setSaveStatus('saving');
    try {
      const updatedUser = await authService.updateProfile(payload);
      if (mountedRef.current) {
        savedSnapshotRef.current = JSON.stringify(formDataRef.current);
        updateUserData(updatedUser);
        setSaveStatus('saved');
        setTimeout(() => { if (mountedRef.current) setSaveStatus('idle'); }, 2500);
      }
    } catch {
      if (mountedRef.current) setSaveStatus('error');
    }
  }, [updateUserData]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced auto-save (1.5s after last change)
  useEffect(() => {
    if (!initializedRef.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      doSave(formDataRef.current);
    }, 1500);
    return () => clearTimeout(debounceRef.current);
  }, [formData, doSave]);

  // Save on SPA navigation away (component unmount)
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
        doSave(formDataRef.current);
      }
    };
  }, [doSave]);

  // Save on hard refresh / tab close
  useEffect(() => {
    const onUnload = () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
        authService.updateProfile({ ...formDataRef.current, experienceLevel: formDataRef.current.experienceLevel || null }).catch(() => {});
      }
    };
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, []);

  const handleRequestOtp = async () => {
    setError('');
    setOtpLoading(true);
    try {
      await authService.requestRoleUpgradeOtp();
      setShowOtpInput(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleUpgrade = async (e) => {
    e.preventDefault();
    if (!otp) { setError('Please enter the OTP.'); return; }
    setError('');
    setLoading(true);
    try {
      const data = await authService.upgradeRole(otp);
      // Apply new token + organizer user directly — no re-login needed
      updateAuth(data.token, data.user);
      setShowOtpInput(false);
      setOtp('');
    } catch (err) {
      setError(err.response?.data?.message || 'Role upgrade failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = (skill) => {
    if (!formData.skills.includes(skill)) {
      setFormData({ ...formData, skills: [...formData.skills, skill] });
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skillToRemove) });
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 pb-20">
      <ProfileHeader user={user} saveStatus={saveStatus} />

      {error && (
        <div className="animate-in slide-in-from-top-2">
          <Alert type="error" title="Action Required">{error}</Alert>
        </div>
      )}

      <Section title="Professional Profile">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-8">

          <Input
            label="Username (Unique ID)"
            icon={User}
            value={formData.username}
            disabled
            placeholder="Your unique identifier"
            className="rounded-xl bg-gray-50 cursor-not-allowed opacity-75"
          />

          <Input
            label="Display Name"
            icon={User}
            value={formData.displayName}
            onChange={e => setFormData({ ...formData, displayName: e.target.value })}
            placeholder="How you want to appear to others (e.g. John Doe)"
          />

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Bio</label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell others what you build, what you're interested in, or what you're looking for in a team..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="GitHub URL" icon={Github} value={formData.githubUrl} onChange={e => setFormData({ ...formData, githubUrl: e.target.value })} placeholder="https://github.com/username" />
            <Input label="LinkedIn URL" icon={Linkedin} value={formData.linkedinUrl} onChange={e => setFormData({ ...formData, linkedinUrl: e.target.value })} placeholder="https://linkedin.com/in/username" />
            <Input label="Portfolio URL" icon={Globe} value={formData.portfolioUrl} onChange={e => setFormData({ ...formData, portfolioUrl: e.target.value })} placeholder="https://yourportfolio.com" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Experience Level</label>
              <div className="relative">
                <select
                  value={formData.experienceLevel}
                  onChange={e => setFormData({ ...formData, experienceLevel: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="">Select level…</option>
                  {EXPERIENCE_LEVELS.map(l => (
                    <option key={l} value={l}>{l.charAt(0) + l.slice(1).toLowerCase()}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Open to Team Invites</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, openToInvites: !formData.openToInvites })}
                  className={`relative inline-flex items-center w-16 h-8 rounded-xl transition-colors duration-300 focus:outline-none ${
                    formData.openToInvites ? 'bg-orange-500' : 'bg-gray-400'
                  }`}
                >
                  <span className={`absolute left-2.5 text-white text-xs font-extrabold leading-none transition-opacity duration-200 ${formData.openToInvites ? 'opacity-100' : 'opacity-0'}`}>I</span>
                  <span className={`absolute right-2 w-3.5 h-3.5 rounded-lg border-2 border-white transition-opacity duration-200 ${!formData.openToInvites ? 'opacity-100' : 'opacity-0'}`} />
                  <span className={`absolute w-6 h-6 bg-gray-900 rounded-xl shadow-md transition-transform duration-300 ${formData.openToInvites ? 'translate-x-9' : 'translate-x-1'}`} />
                </button>
                <span className={`text-sm font-medium ${formData.openToInvites ? 'text-orange-600' : 'text-gray-500'}`}>
                  {formData.openToInvites ? "Yes, I'm open to invites" : 'Not open to invites'}
                </span>
              </div>
            </div>
          </div>

          <SkillTags
            skills={formData.skills}
            onAddSkill={handleAddSkill}
            onRemoveSkill={handleRemoveSkill}
          />
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
  );
};

export default Profile;
