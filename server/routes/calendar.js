const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');

// Get user's available calendars
router.get('/calendars', calendarController.getAvailableCalendars);

// Get user's Google Calendar events
router.get('/events', calendarController.getCalendarEvents);

// Create a new calendar event
router.post('/events', calendarController.createCalendarEvent);

// Update a calendar event
router.put('/events/:eventId', calendarController.updateCalendarEvent);

// Delete a calendar event
router.delete('/events/:eventId', calendarController.deleteCalendarEvent);

// Sync all user tasks to calendar
router.post('/sync-tasks', calendarController.syncAllTasksToCalendar);

// Get calendar sync status
router.get('/sync-status', calendarController.getSyncStatus);

// Refresh Google access token
router.post('/refresh-token', calendarController.refreshAccessToken);

module.exports = router; 