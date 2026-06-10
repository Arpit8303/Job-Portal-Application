import api from './api';

const authService = {
  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/user/update-user', userData);
    return response.data;
  },

  getPortfolio: async (id) => {
    const response = await api.get('/user/portfolio/'+id);
    return response.data;
  },
};

export default authService;
