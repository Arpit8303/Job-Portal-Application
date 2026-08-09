import api from './api';

const notificationService = {
  // GET /api/v1/notifications?page=1&limit=20
  getNotifications: async (page = 1, limit = 20) => {
    const { data } = await api.get(`/notifications?page=${page}&limit=${limit}`);
    return data;
  },

  // PATCH /api/v1/notifications/:id/read
  markAsRead: async (id) => {
    const { data } = await api.patch(`/notifications/${id}/read`);
    return data;
  },

  // PATCH /api/v1/notifications/read-all
  markAllRead: async () => {
    const { data } = await api.patch('/notifications/read-all');
    return data;
  },

  // DELETE /api/v1/notifications/:id
  deleteNotification: async (id) => {
    const { data } = await api.delete(`/notifications/${id}`);
    return data;
  },
};

export default notificationService;
