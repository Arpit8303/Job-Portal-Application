import api from './api';

const jobService = {
  createJob: async (jobData) => {
    const response = await api.post('/jobs/create-job', jobData);
    return response.data;
  },

  getJobs: async ({ page = 1, limit = 10, status = 'all', workType = 'all', search = '', sort = 'latest' } = {}) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (status !== 'all') params.append('status', status);
    if (workType !== 'all') params.append('workType', workType);
    if (search) params.append('search', search);
    if (sort) params.append('sort', sort);
    const response = await api.get(`/jobs/get-job?${params.toString()}`);
    return response.data;
  },

  updateJob: async (id, jobData) => {
    const response = await api.patch(`/jobs/update-job/${id}`, jobData);
    return response.data;
  },

  deleteJob: async (id) => {
    const response = await api.delete(`/jobs/delete-job/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/jobs/job-stats');
    return response.data;
  },
};

export default jobService;
