import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        // Add any necessary auth headers here
        config.headers.Authorization = `Bearer ${user.accessToken}`;
      }
    } catch (error) {
      console.error('Error adding auth headers:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.log('Unauthorized access, redirecting to login');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: () => api.get('/auth/google'),
  logout: () => api.get('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  getStatus: () => api.get('/auth/status'),
};

// Tasks API
export const tasksAPI = {
  getAll: () => api.get('/tasks'),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (taskData) => api.post('/tasks', taskData),
  update: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  delete: (id) => api.delete(`/tasks/${id}`),
  complete: (id) => api.patch(`/tasks/${id}/complete`),
  getByCategory: (category) => api.get(`/tasks/category/${category}`),
  getByStatus: (status) => api.get(`/tasks/status/${status}`),
  getDueToday: () => api.get('/tasks/due/today'),
  getDueThisWeek: () => api.get('/tasks/due/week'),
  syncToCalendar: (id) => api.post(`/tasks/${id}/sync-calendar`),
  removeFromCalendar: (id) => api.delete(`/tasks/${id}/sync-calendar`),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  getStats: () => api.get('/users/stats'),
  getAchievements: () => api.get('/users/achievements'),
  markAchievementAsRead: (id) => api.patch(`/users/achievements/${id}/read`),
  getLevel: () => api.get('/users/level'),
  updatePreferences: (preferences) => api.put('/users/preferences', { preferences }),
  toggleCalendarSync: () => api.patch('/users/calendar-sync'),
  getStreak: () => api.get('/users/streak'),
};

// Calendar API
export const calendarAPI = {
  getEvents: (params) => api.get('/calendar/events', { params }),
  createEvent: (eventData) => api.post('/calendar/events', eventData),
  updateEvent: (eventId, eventData) => api.put(`/calendar/events/${eventId}`, eventData),
  deleteEvent: (eventId) => api.delete(`/calendar/events/${eventId}`),
  syncAllTasks: () => api.post('/calendar/sync-tasks'),
  getSyncStatus: () => api.get('/calendar/sync-status'),
  refreshToken: () => api.post('/calendar/refresh-token'),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api; 