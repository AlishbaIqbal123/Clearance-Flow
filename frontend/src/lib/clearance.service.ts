import api from './api';

export const clearanceService = {
  getAllRequests: async (params?: any) => {
    const response = await api.get('/clearance/requests', { params });
    return response.data;
  },

  getRequestById: async (id: string) => {
    const response = await api.get(`/clearance/requests/${id}`);
    return response.data;
  },

  issueCertificate: async (id: string) => {
    const response = await api.post(`/clearance/requests/${id}/issue-certificate`);
    return response.data;
  },

  getStatistics: async (params?: any) => {
    const response = await api.get('/clearance/statistics', { params });
    return response.data;
  },

  getRecentRequests: async (limit: number = 10) => {
    const response = await api.get('/clearance/recent', { params: { limit } });
    return response.data;
  },

  getPendingRequests: async (params?: any) => {
    const response = await api.get('/clearance/pending', { params });
    return response.data;
  },

  deleteRequest: async (id: string) => {
    const response = await api.delete(`/clearance/requests/${id}`);
    return response.data;
  }
};
