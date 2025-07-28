import axios from 'axios';

const API_BASE_URL = '/api';

const onboardingService = {
  // Get available goals for onboarding
  getAvailableGoals: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/onboarding/goals`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching available goals:', error);
      throw error;
    }
  },

  // Set user's selected goal and generate default tasks
  setUserGoal: async (goal) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/onboarding/set-goal`, { goal }, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error setting user goal:', error);
      throw error;
    }
  },

  // Check if user needs onboarding (has no tasks)
  needsOnboarding: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/onboarding/needs-onboarding`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      throw error;
    }
  },

  // Generate new default tasks for existing users
  generateDefaultTasks: async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/onboarding/generate-tasks`, {}, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error generating default tasks:', error);
      throw error;
    }
  },

  // Reset user data (for testing or fresh start)
  resetUserData: async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/onboarding/reset`, {}, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error resetting user data:', error);
      throw error;
    }
  },

  // Wipe all data (admin function)
  wipeAllData: async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/onboarding/wipe-all`, {}, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error wiping all data:', error);
      throw error;
    }
  }
};

export default onboardingService; 