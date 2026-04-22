import api from './api';

export const authService = {
  login: async (credentials: any) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  studentLogin: async (credentials: any) => {
    const response = await api.post('/auth/student/login', credentials);
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  studentSignup: async (signupData: any) => {
    const response = await api.post('/auth/student/signup', signupData);
    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  changePassword: async (passwordData: any) => {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (resetData: any) => {
    const response = await api.post('/auth/reset-password', resetData);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  getDepartments: async () => {
    const response = await api.get('/auth/departments');
    return response.data;
  },

  getRecentRequests: async () => {
    const response = await api.get('/admin/dashboard');
    if (response.data.success) {
      return {
        success: true,
        data: {
          requests: response.data.data.recentRequests || []
        }
      };
    }
    return response.data;
  },

  getStudents: async (params?: any) => {
    const response = await api.get('/students', { params });
    if (response.data.success) {
      // Ensure data format consistency
      return {
        success: true,
        data: {
          students: response.data.data
        }
      };
    }
    return response.data;
  },
};
