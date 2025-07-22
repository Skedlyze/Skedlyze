const db = require('../db/knex');
const { google } = require('googleapis');

// Initialize Google Calendar API
const getCalendarAPI = (accessToken) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );
  
  oauth2Client.setCredentials({
    access_token: accessToken
  });
  
  return google.calendar({ version: 'v3', auth: oauth2Client });
};

// Get user's Google Calendar events
const getCalendarEvents = async (req, res) => {
  try {
    const user = await db('users')
      .where({ id: req.user.id })
      .select('access_token')
      .first();

    if (!user.access_token) {
      return res.status(400).json({ error: 'No access token available' });
    }

    const calendar = getCalendarAPI(user.access_token);
    const { timeMin, timeMax, maxResults = 10 } = req.query;

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin || new Date().toISOString(),
      timeMax: timeMax || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      maxResults: parseInt(maxResults),
      singleEvents: true,
      orderBy: 'startTime'
    });

    res.json(response.data.items || []);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
};

// Create a new calendar event
const createCalendarEvent = async (req, res) => {
  try {
    const user = await db('users')
      .where({ id: req.user.id })
      .select('access_token')
      .first();

    if (!user.access_token) {
      return res.status(400).json({ error: 'No access token available' });
    }

    const { summary, description, start, end, location } = req.body;

    const calendar = getCalendarAPI(user.access_token);
    const event = {
      summary,
      description,
      location,
      start: {
        dateTime: start,
        timeZone: 'UTC'
      },
      end: {
        dateTime: end,
        timeZone: 'UTC'
      }
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event
    });

    res.status(201).json(response.data);
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ error: 'Failed to create calendar event' });
  }
};

// Update a calendar event
const updateCalendarEvent = async (req, res) => {
  try {
    const user = await db('users')
      .where({ id: req.user.id })
      .select('access_token')
      .first();

    if (!user.access_token) {
      return res.status(400).json({ error: 'No access token available' });
    }

    const { eventId } = req.params;
    const { summary, description, start, end, location } = req.body;

    const calendar = getCalendarAPI(user.access_token);
    const event = {
      summary,
      description,
      location,
      start: {
        dateTime: start,
        timeZone: 'UTC'
      },
      end: {
        dateTime: end,
        timeZone: 'UTC'
      }
    };

    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId,
      resource: event
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error updating calendar event:', error);
    res.status(500).json({ error: 'Failed to update calendar event' });
  }
};

// Delete a calendar event
const deleteCalendarEvent = async (req, res) => {
  try {
    const user = await db('users')
      .where({ id: req.user.id })
      .select('access_token')
      .first();

    if (!user.access_token) {
      return res.status(400).json({ error: 'No access token available' });
    }

    const { eventId } = req.params;
    const calendar = getCalendarAPI(user.access_token);

    await calendar.events.delete({
      calendarId: 'primary',
      eventId
    });

    res.json({ message: 'Calendar event deleted successfully' });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    res.status(500).json({ error: 'Failed to delete calendar event' });
  }
};

// Sync all user tasks to calendar
const syncAllTasksToCalendar = async (req, res) => {
  try {
    const user = await db('users')
      .where({ id: req.user.id })
      .select('access_token')
      .first();

    if (!user.access_token) {
      return res.status(400).json({ error: 'No access token available' });
    }

    const tasks = await db('tasks')
      .where({ 
        user_id: req.user.id,
        synced_to_calendar: false,
        due_date: 'not null'
      })
      .select('*');

    const calendar = getCalendarAPI(user.access_token);
    const syncedTasks = [];

    for (const task of tasks) {
      try {
        const event = {
          summary: task.title,
          description: task.description || '',
          start: {
            dateTime: task.due_date,
            timeZone: 'UTC'
          },
          end: {
            dateTime: task.end_time || new Date(new Date(task.due_date).getTime() + 60 * 60 * 1000).toISOString(),
            timeZone: 'UTC'
          }
        };

        const response = await calendar.events.insert({
          calendarId: 'primary',
          resource: event
        });

        // Update task with calendar event ID
        await db('tasks')
          .where({ id: task.id })
          .update({
            google_calendar_event_id: response.data.id,
            synced_to_calendar: true
          });

        syncedTasks.push({
          taskId: task.id,
          eventId: response.data.id
        });
      } catch (error) {
        console.error(`Error syncing task ${task.id}:`, error);
      }
    }

    res.json({
      message: `Synced ${syncedTasks.length} tasks to calendar`,
      syncedTasks
    });
  } catch (error) {
    console.error('Error syncing tasks to calendar:', error);
    res.status(500).json({ error: 'Failed to sync tasks to calendar' });
  }
};

// Get calendar sync status
const getSyncStatus = async (req, res) => {
  try {
    const user = await db('users')
      .where({ id: req.user.id })
      .select('calendar_sync_enabled', 'access_token')
      .first();

    const taskStats = await db('tasks')
      .where({ user_id: req.user.id })
      .select(
        db.raw('COUNT(*) as total_tasks'),
        db.raw('COUNT(CASE WHEN synced_to_calendar = true THEN 1 END) as synced_tasks'),
        db.raw('COUNT(CASE WHEN synced_to_calendar = false THEN 1 END) as unsynced_tasks')
      )
      .first();

    const syncStatus = {
      enabled: user.calendar_sync_enabled,
      hasAccessToken: !!user.access_token,
      taskStats,
      syncPercentage: taskStats.total_tasks > 0 
        ? Math.round((taskStats.synced_tasks / taskStats.total_tasks) * 100) 
        : 0
    };

    res.json(syncStatus);
  } catch (error) {
    console.error('Error fetching sync status:', error);
    res.status(500).json({ error: 'Failed to fetch sync status' });
  }
};

// Refresh Google access token
const refreshAccessToken = async (req, res) => {
  try {
    const user = await db('users')
      .where({ id: req.user.id })
      .select('refresh_token')
      .first();

    if (!user.refresh_token) {
      return res.status(400).json({ error: 'No refresh token available' });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL
    );

    oauth2Client.setCredentials({
      refresh_token: user.refresh_token
    });

    const { credentials } = await oauth2Client.refreshAccessToken();

    // Update user's tokens
    await db('users')
      .where({ id: req.user.id })
      .update({
        access_token: credentials.access_token,
        token_expires_at: new Date(Date.now() + (credentials.expires_in * 1000)),
        updated_at: new Date()
      });

    res.json({ message: 'Access token refreshed successfully' });
  } catch (error) {
    console.error('Error refreshing access token:', error);
    res.status(500).json({ error: 'Failed to refresh access token' });
  }
};

module.exports = {
  getCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  syncAllTasksToCalendar,
  getSyncStatus,
  refreshAccessToken
}; 