import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Button from '../components/common/Button/Button';
import Input from '../components/common/Input/Input';
import Alert from '../components/common/Alert/Alert';
import { LogIn } from 'lucide-react';
import loginSvg from '../assets/images/login.svg';
import { extractErrorMessage } from '../services/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get message from navigation state if available
  const successMessage = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/profile');
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to login. Please check your credentials.'));
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
            src={loginSvg}
            alt="Login Illustration"
            className="w-full h-auto object-contain"
          />
        </div>
      </div>

      {/* Right Column — Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center px-6 sm:px-12 lg:px-16 bg-white">
        <div className="max-w-sm w-full space-y-7">
          <div>
            <div className="flex lg:hidden justify-center mb-6">
              <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center">
                <LogIn className="w-5 h-5 text-brand-600" />
              </div>
            </div>
            <h2 className="font-display font-semibold text-2xl text-ink-primary">Sign in to HackHub</h2>
            <p className="mt-2 text-sm text-ink-muted">
              Welcome back! Or{' '}
              <button
                onClick={() => navigate('/register')}
                className="font-medium text-brand-600 hover:text-brand-700 transition-colors"
              >
                create a new account
              </button>
            </p>
          </div>

          {successMessage && (
            <Alert type="success" title="Success">
              {successMessage}
            </Alert>
          )}

          {error && (
            <Alert type="error" title="Login Failed">
              {error}
            </Alert>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                label="Username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
              />
              <Input
                label="Password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-end">
              <Link to="/reset-password" className="text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
            >
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
