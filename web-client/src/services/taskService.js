import axios from 'axios';

const API_BASE_URL = '/api';

// Configure axios to include credentials
axios.defaults.withCredentials = true;

// Tasks API
export const taskService = {
  // Get all tasks for the authenticated user
  getAll: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tasks`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  // Get a specific task
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tasks/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  },

  // Create a new task
  create: async (taskData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/tasks`, taskData);
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  // Update a task
  update: async (id, taskData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/tasks/${id}`, taskData);
      return response.data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  // Delete a task
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/tasks/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  // Complete a task
  complete: async (id) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/tasks/${id}/complete`);
      return response.data;
    } catch (error) {
      console.error('Error completing task:', error);
      throw error;
    }
  },

  // Get tasks by category
  getByCategory: async (category) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tasks/category/${category}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks by category:', error);
      throw error;
    }
  },

  // Get tasks by status
  getByStatus: async (status) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tasks/status/${status}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks by status:', error);
      throw error;
    }
  },

  // Get tasks due today
  getDueToday: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tasks/due/today`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks due today:', error);
      throw error;
    }
  },

  // Get tasks due this week
  getDueThisWeek: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tasks/due/week`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks due this week:', error);
      throw error;
    }
  }
}; 