import api from './api';

export const analyticsService = {
  getOverview: async (params?: { startDate?: string, endDate?: string }) => {
    const response = await api.get('/analytics/overview', { params });
    return response.data;
  },

  getStudentStats: async (params?: { batch?: string, department?: string }) => {
    const response = await api.get('/analytics/students', { params });
    return response.data;
  },

  getDepartmentStats: async () => {
    const response = await api.get('/analytics/departments');
    return response.data;
  },

  getPerformanceStats: async (params?: { days?: number }) => {
    const response = await api.get('/analytics/performance', { params });
    return response.data;
  },

  exportAnalytics: async (type: string) => {
    const response = await api.get('/analytics/export', { params: { type } });
    return response.data;
  }
};
