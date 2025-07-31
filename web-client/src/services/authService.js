import axios from 'axios';

// Configure axios to include credentials
axios.defaults.withCredentials = true;

const API_BASE_URL = '/api';

const authService = {
  // Google OAuth login
  loginWithGoogle: () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Check authentication status
  getAuthStatus: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/status`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/logout`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default authService; 