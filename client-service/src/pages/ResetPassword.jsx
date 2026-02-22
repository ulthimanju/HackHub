import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import Button from '../components/common/Button/Button';
import Input from '../components/common/Input/Input';
import Alert from '../components/common/Alert/Alert';
import { KeyRound, Send, ArrowLeft } from 'lucide-react';
import registerSvg from '../assets/images/register.svg';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = email, 2 = otp + new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const handleRequestOtp = async (e) => {
    e?.preventDefault();
    if (!email) { setError('Please enter your email address.'); return; }
    setError('');
    setOtpLoading(true);
    try {
      await authService.requestResetOtp(email);
      setInfo('A 6-digit code has been sent to your email.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to send OTP. Check the email address and try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setInfo('');
    setOtpLoading(true);
    try {
      await authService.requestResetOtp(email);
      setInfo('A new code has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    if (otp.length !== 6) { setError('Please enter the 6-digit code.'); return; }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await authService.resetPassword(email, otp, newPassword);
      navigate('/login', { state: { message: 'Password reset successfully! Please sign in with your new password.' } });
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Reset failed. The code may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-page">
      {/* Left Column — Illustration */}
      <div className="hidden lg:flex lg:w-[55%] bg-brand-50 items-center justify-center p-12">
        <div className="max-w-xl w-full">
          <img
            src={registerSvg}
            alt="Reset Password Illustration"
            className="w-full h-auto object-contain"
          />
        </div>
      </div>

      {/* Right Column — Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center px-6 sm:px-12 lg:px-16 bg-white">
        <div className="max-w-sm w-full space-y-7">
          {/* Header */}
          <div>
            <div className="flex lg:hidden justify-center mb-6">
              <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-brand-600" />
              </div>
            </div>
            <h2 className="font-display font-semibold text-2xl text-ink-primary">
              {step === 1 ? 'Reset your password' : 'Enter verification code'}
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              {step === 1
                ? "Enter the email linked to your account and we'll send you a code."
                : <>Code sent to <span className="font-medium text-ink-secondary">{email}</span>.</>}
            </p>
          </div>

          {/* Step indicator dots */}
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-8 rounded-full bg-brand-600" />
            <div className={`h-1.5 w-8 rounded-full transition-colors ${step === 2 ? 'bg-brand-600' : 'bg-surface-border'}`} />
          </div>

          {error && <Alert type="error" title="Error">{error}</Alert>}
          {info  && <Alert type="success" title="OTP Sent">{info}</Alert>}

          {/* Step 1 — Email */}
          {step === 1 && (
            <form className="space-y-5" onSubmit={handleRequestOtp}>
              <Input
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
              <Button type="submit" variant="primary" fullWidth loading={otpLoading} icon={Send}>
                Send verification code
              </Button>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink-secondary transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </button>
            </form>
          )}

          {/* Step 2 — OTP + New Password */}
          {step === 2 && (
            <form className="space-y-5" onSubmit={handleReset}>
              <Input
                label="Verification Code"
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="6-digit code"
              />
              <Input
                label="New Password"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
              />
              <Input
                label="Confirm New Password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
              />

              <Button type="submit" variant="primary" fullWidth loading={loading}>
                Reset password
              </Button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => { setStep(1); setOtp(''); setError(''); setInfo(''); }}
                  className="flex items-center gap-1.5 text-ink-muted hover:text-ink-secondary transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Change email
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={otpLoading}
                  className="font-medium text-brand-600 hover:text-brand-700 transition-colors disabled:opacity-50"
                >
                  {otpLoading ? 'Sending…' : 'Resend code'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
