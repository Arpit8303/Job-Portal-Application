import api from './api';

const jobService2 = {
  // GET /api/v1/jobs/recommended
  getRecommendedJobs: async () => {
    const { data } = await api.get('/jobs/recommended');
    return data;
  },

  // POST /api/v1/jobs/alerts
  createJobAlert: async (alertData) => {
    const { data } = await api.post('/jobs/alerts', alertData);
    return data;
  },

  // GET /api/v1/jobs/alerts
  getJobAlerts: async () => {
    const { data } = await api.get('/jobs/alerts');
    return data;
  },

  // PATCH /api/v1/jobs/alerts/:id
  updateJobAlert: async (id, alertData) => {
    const { data } = await api.patch(`/jobs/alerts/${id}`, alertData);
    return data;
  },

  // DELETE /api/v1/jobs/alerts/:id
  deleteJobAlert: async (id) => {
    const { data } = await api.delete(`/jobs/alerts/${id}`);
    return data;
  },
};

export default jobService2;
