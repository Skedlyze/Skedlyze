import axios from 'axios';

const API_BASE_URL = '/api';

const calendarService = {
  // Get available calendars
  getAvailableCalendars: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/calendar/calendars`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching available calendars:', error);
      throw error;
    }
  },

  // Get calendar events
  getEvents: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/calendar/events`, {
        params,
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }
  },

  // Create a new calendar event
  createEvent: async (eventData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/calendar/events`, eventData, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  },

  // Update a calendar event
  updateEvent: async (eventId, eventData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/calendar/events/${eventId}`, eventData, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw error;
    }
  },

  // Delete a calendar event
  deleteEvent: async (eventId, calendarId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/calendar/events/${eventId}`, {
        params: { calendarId },
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw error;
    }
  },

  // Sync all tasks to calendar
  syncTasksToCalendar: async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/calendar/sync-tasks`, {}, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error syncing tasks to calendar:', error);
      throw error;
    }
  },

  // Get calendar sync status
  getSyncStatus: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/calendar/sync-status`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error getting sync status:', error);
      throw error;
    }
  },

  // Refresh access token
  refreshToken: async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/calendar/refresh-token`, {}, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }
};

export default calendarService; 