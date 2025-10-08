import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't intercept login/register requests
    if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/register')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }
        
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token } = response.data;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  
  register: (email: string, username: string, password: string) =>
    api.post('/auth/register', { email, username, password }),
  
  logout: () =>
    api.post('/auth/logout'),
  
  getCurrentUser: () => {
    const token = localStorage.getItem('access_token');
    return api.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, new_password: newPassword }),
  
  deleteAccount: () =>
    api.delete('/users/me'),
  
  changePassword: (oldPassword: string, newPassword: string) =>
    api.post('/users/me/change-password', { old_password: oldPassword, new_password: newPassword }),
};

// Todos API
export const todosAPI = {
  list: (params?: { status?: string; priority?: string }) =>
    api.get('/todos', { params }),
  
  create: (data: { title: string; description?: string; priority?: string; due_date?: string }) =>
    api.post('/todos', data),
  
  get: (id: number) =>
    api.get(`/todos/${id}`),
  
  update: (id: number, data: any) =>
    api.put(`/todos/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/todos/${id}`),
  
  harvestCompleted: () =>
    api.post('/todos/harvest-completed'),
};

// Admin API
export const adminAPI = {
  getUsers: (params?: { skip?: number; limit?: number; is_active?: boolean }) =>
    api.get('/admin/users', { params }),
  
  getUser: (userId: number) =>
    api.get(`/admin/users/${userId}`),
  
  updateUserRole: (userId: number, role: string) =>
    api.put(`/admin/users/${userId}/role?role=${role}`),
  
  updateUserStatus: (userId: number, is_active: boolean) =>
    api.put(`/admin/users/${userId}/status?is_active=${is_active}`),
  
  deleteUser: (userId: number) =>
    api.delete(`/admin/users/${userId}`),
  
  getStats: () =>
    api.get('/admin/stats'),
};
