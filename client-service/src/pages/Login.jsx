import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/common/Button/Button';
import Input from '../components/common/Input/Input';
import Alert from '../components/common/Alert/Alert';
import { LogIn } from 'lucide-react';
import loginSvg from '../assets/images/login.svg';

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
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
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
            src={loginSvg} 
            alt="Login Illustration" 
            className="w-full h-auto object-contain animate-fade-in"
          />
        </div>
      </div>

      {/* Right Column - Form (40% or 100% on mobile) */}
      <div className="w-full lg:w-[40%] flex items-center justify-center px-6 sm:px-12 lg:px-16">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="flex lg:hidden justify-center mb-8">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <LogIn className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Sign in to EHub</h2>
            <p className="mt-3 text-sm text-gray-600">
              Welcome back! Please enter your details or{' '}
              <button 
                onClick={() => navigate('/register')}
                className="font-semibold text-orange-600 hover:text-orange-500 transition-colors"
              >
                create a new account
              </button>
            </p>
          </div>
          
          {(successMessage) && (
            <Alert type="success" title="Success">
              {successMessage}
            </Alert>
          )}

          {error && (
            <Alert type="error" title="Login Failed">
              {error}
            </Alert>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <a href="#" className="font-medium text-orange-600 hover:text-orange-500">
                  Forgot password?
                </a>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3"
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
