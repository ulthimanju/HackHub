import api from './api';

const authService = {
  login:               (username, password)    => api.post('/auth/login', { username, password }),
  register:            (username, email, password, otp) => api.post('/auth/register', { username, email, password, otp }),
  requestOtp:          (email)                => api.post('/auth/register/otp', { email }),
  requestRoleUpgradeOtp: ()                   => api.post('/auth/upgrade-role/otp'),
  upgradeRole:         (_email, otp)           => api.post('/auth/upgrade-role', { otp }),
  getProfile:          ()                      => api.get('/auth/profile'),
  updateProfile:       (profileData)           => api.put('/auth/profile', profileData),

  requestResetOtp:     (email)                 => api.post('/auth/reset-password/otp', { email }),
  resetPassword:       (email, otp, newPassword) => api.post('/auth/reset-password', { email, otp, newPassword }),

  logout: async () => {
    try {
      await api.post('/auth/logout'); // best-effort server-side token blacklist
    } catch (_) {
      // ignore — clear client state regardless
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export default authService;
