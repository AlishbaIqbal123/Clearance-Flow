import api from './api';

export const departmentService = {
  getDashboard: async () => {
    const response = await api.get('/departments/dashboard');
    return response.data;
  },

  getRequests: async (params?: any) => {
    const response = await api.get('/departments/requests', { params });
    return response.data;
  },

  getRequestDetails: async (id: string) => {
    const response = await api.get(`/departments/requests/${id}`);
    return response.data;
  },

  updateRequestStatus: async (id: string, updateData: any) => {
    const response = await api.put(`/departments/requests/${id}/status`, updateData);
    return response.data;
  },

  addComment: async (id: string, commentData: any) => {
    const response = await api.post(`/departments/requests/${id}/comments`, commentData);
    return response.data;
  },

  getStudentsInDept: async (params?: any) => {
    const response = await api.get('/departments/students', { params });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/departments/profile');
    return response.data;
  },

  updateProfile: async (profileData: any) => {
    const response = await api.put('/departments/profile', profileData);
    return response.data;
  },

  getPendingCount: async () => {
    const response = await api.get('/departments/pending-requests');
    return response.data;
  }
};
