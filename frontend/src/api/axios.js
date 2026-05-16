import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('etharaToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('etharaToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/me', data),
};

export const tasksAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getOne: (id) => api.get(`/tasks/${id}`),
  create: (formData) =>
    api.post('/tasks', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
  update: (id, data) => api.patch(`/tasks/${id}`, data),
  assign: (id, userId) => api.patch(`/tasks/${id}/assign`, { userId }),
  cancelAssignment: (id) => api.patch(`/tasks/${id}/cancel`),
  delete: (id) => api.delete(`/tasks/${id}`),
};

export const usersAPI = {
  getAll: () => api.get('/users'),
  create: (data) => api.post('/users', data),
  getOne: (id) => api.get(`/users/${id}`),
  delete: (id) => api.delete(`/users/${id}`),
};

export const dashboardAPI = {
  tasksByTeam: () => api.get('/dashboard/tasks-by-team'),
  tasksByStatus: () => api.get('/dashboard/tasks-by-status'),
  tasksPerUser: () => api.get('/dashboard/tasks-per-user'),
  overdueByTeam: () => api.get('/dashboard/overdue-by-team'),
};

export default api;
