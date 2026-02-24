import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import Button from '../components/common/Button/Button';
import Input from '../components/common/Input/Input';
import Alert from '../components/common/Alert/Alert';
import { UserPlus, Send } from 'lucide-react';
import registerSvg from '../assets/images/register.svg';
import { extractErrorMessage } from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    otp: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRequestOtp = async () => {
    if (!formData.email) {
      setError('Please enter your email first.');
      return;
    }
    setError('');
    setOtpLoading(true);
    try {
      await authService.requestOtp(formData.email);
      setSuccess('OTP sent to your email. Please check your inbox.');
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to send OTP.'));
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await register(formData.username, formData.email, formData.password, formData.otp);
      navigate('/login', { state: { message: 'Account created successfully! Please sign in.' } });
    } catch (err) {
      setError(extractErrorMessage(err, 'Registration failed. Please check your details.'));
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
            alt="Registration Illustration"
            className="w-full h-auto object-contain"
          />
        </div>
      </div>

      {/* Right Column — Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center px-6 sm:px-12 lg:px-16 overflow-y-auto py-12 bg-white">
        <div className="max-w-sm w-full space-y-6">
          <div>
            <div className="flex lg:hidden justify-center mb-6">
              <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-brand-600" />
              </div>
            </div>
            <h2 className="font-display font-semibold text-2xl text-ink-primary">Join EHub Today</h2>
            <p className="mt-2 text-sm text-ink-muted">
              Start your hackathon journey or{' '}
              <button
                onClick={() => navigate('/login')}
                className="font-medium text-brand-600 hover:text-brand-700 transition-colors"
              >
                sign in
              </button>
            </p>
          </div>

          {error && <Alert type="error" title="Registration Error">{error}</Alert>}
          {success && <Alert type="success" title="OTP Sent">{success}</Alert>}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Username"
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a unique username"
            />

            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleRequestOtp}
                loading={otpLoading}
                icon={Send}
              >
                Get OTP
              </Button>
            </div>

            <Input
              label="Verification Code (OTP)"
              name="otp"
              type="text"
              required
              value={formData.otp}
              onChange={handleChange}
              placeholder="6-digit code from your email"
            />

            <Input
              label="Password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 8 characters"
            />

            <div className="pt-1">
              <p className="text-xs text-ink-muted mb-3">
                By creating an account you agree to our Terms of Service and Privacy Policy.
              </p>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
              >
                Create account
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
