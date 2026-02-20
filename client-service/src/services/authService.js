import api from './api';

const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  register: async (username, email, password, otp) => {
    const response = await api.post('/auth/register', { username, email, password, otp });
    return response.data;
  },

  requestOtp: async (email) => {
    const response = await api.post('/auth/register/otp', { email });
    return response.data;
  },

  requestRoleUpgradeOtp: async () => {
    const response = await api.post('/auth/upgrade-role/otp');
    return response.data;
  },

  upgradeRole: async (_email, otp) => {
    const response = await api.post('/auth/upgrade-role', { otp });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

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
