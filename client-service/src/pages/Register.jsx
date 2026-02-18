import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import Button from '../components/common/Button/Button';
import Input from '../components/common/Input/Input';
import Alert from '../components/common/Alert/Alert';
import { UserPlus, Send } from 'lucide-react';
import registerSvg from '../assets/images/register.svg';

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
      setError(err.response?.data?.message || 'Failed to send OTP.');
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
      setError(err.response?.data?.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Column - Image (60%) */}
      <div className="hidden lg:flex lg:w-[60%] bg-orange-50 items-center justify-center p-12">
        <div className="max-w-2xl w-full">
          <img 
            src={registerSvg} 
            alt="Registration Illustration" 
            className="w-full h-auto object-contain"
          />
        </div>
      </div>

      {/* Right Column - Form (40% or 100% on mobile) */}
      <div className="w-full lg:w-[40%] flex items-center justify-center px-6 sm:px-12 lg:px-16 overflow-y-auto py-12">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="flex lg:hidden justify-center mb-8">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Join EHub Today</h2>
            <p className="mt-3 text-sm text-gray-600">
              Start your hackathon journey or{' '}
              <button 
                onClick={() => navigate('/login')}
                className="font-semibold text-orange-600 hover:text-orange-500 transition-colors"
              >
                sign in to your account
              </button>
            </p>
          </div>
          
          {error && <Alert type="error" title="Registration Error">{error}</Alert>}
          {success && <Alert type="success" title="OTP Sent">{success}</Alert>}

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
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
                className="mb-1 h-[42px]"
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

            <div className="pt-2">
              <p className="text-xs text-gray-500 mb-4">
                By clicking "Create account", you agree to our Terms of Service and Privacy Policy.
              </p>
              <Button
                type="submit"
                variant="primary"
                className="w-full py-3"
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
