import api from './api';

export const studentService = {
  getProfile: async () => {
    const response = await api.get('/students/profile');
    return response.data;
  },

  updateProfile: async (profileData: any) => {
    const response = await api.put('/students/profile', profileData);
    return response.data;
  },

  getDashboard: async () => {
    const response = await api.get('/students/dashboard');
    return response.data;
  },

  getClearanceStatus: async () => {
    const response = await api.get('/students/clearance-status');
    return response.data;
  },

  submitRequest: async (requestData: any) => {
    const response = await api.post('/students/clearance-request', requestData);
    return response.data;
  },

  cancelRequest: async (id: string, reasonData: any) => {
    const response = await api.post(`/students/clearance-request/${id}/cancel`, reasonData);
    return response.data;
  },

  uploadDocuments: async (id: string, formData: FormData) => {
    const response = await api.post(`/students/clearance-request/${id}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  addComment: async (id: string, commentData: any) => {
    const response = await api.post(`/students/clearance-request/${id}/comments`, commentData);
    return response.data;
  },

  getDepartments: async () => {
    const response = await api.get('/students/departments');
    return response.data;
  },

  getHistory: async (params?: any) => {
    const response = await api.get('/students/clearance-history', { params });
    return response.data;
  },

  downloadCertificate: async (requestId: string) => {
    const response = await api.get(`/students/certificate/${requestId}`);
    return response.data;
  }
};
