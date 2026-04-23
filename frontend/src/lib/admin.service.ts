import api from './api';

export const adminService = {
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  getUsers: async (params?: any) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  createUser: async (userData: any) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },

  updateUser: async (id: string, userData: any) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  getStudents: async (params?: any) => {
    const response = await api.get('/admin/students', { params });
    return response.data;
  },

  createStudent: async (studentData: any) => {
    const response = await api.post('/admin/students', studentData);
    return response.data;
  },

  bulkImportStudents: async (formData: FormData) => {
    const response = await api.post('/admin/students/bulk-import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateStudent: async (id: string, studentData: any) => {
    const response = await api.put(`/admin/students/${id}`, studentData);
    return response.data;
  },

  deleteStudent: async (id: string) => {
    const response = await api.delete(`/admin/students/${id}`);
    return response.data;
  },

  resetStudent: async (id: string) => {
    const response = await api.post(`/admin/students/${id}/reset`);
    return response.data;
  },

  getDepartments: async () => {
    const response = await api.get('/admin/departments');
    return response.data;
  },

  createDepartment: async (deptData: any) => {
    const response = await api.post('/admin/departments', deptData);
    return response.data;
  },

  updateDepartment: async (id: string, deptData: any) => {
    const response = await api.put(`/admin/departments/${id}`, deptData);
    return response.data;
  },

  deleteDepartment: async (id: string) => {
    const response = await api.delete(`/admin/departments/${id}`);
    return response.data;
  },

  getClearanceRequests: async (params?: any) => {
    const response = await api.get('/admin/clearance-requests', { params });
    return response.data;
  },

  resetStudentPassword: async (id: string) => {
    const response = await api.post(`/admin/reset-student-password/${id}`);
    return response.data;
  },
  
  resetOfficialPassword: async (id: string) => {
    const response = await api.post(`/admin/reset-official-password/${id}`);
    return response.data;
  },
  
  exportStudents: async () => {
    const response = await api.get('/admin/students/export', {
      responseType: 'blob'
    });
    return response.data;
  }
};
