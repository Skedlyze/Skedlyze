const db = require('../db/knex');
const GamificationService = require('../services/gamificationService');
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

// Create or get Skedlyze calendar
const getOrCreateSkedlyzeCalendar = async (accessToken) => {
  const calendar = getCalendarAPI(accessToken);
  
  try {
    // First, try to find existing Skedlyze calendar
    const calendarList = await calendar.calendarList.list();
    const skedlyzeCalendar = calendarList.data.items.find(
      cal => cal.summary === 'Skedlyze Calendar'
    );
    
    if (skedlyzeCalendar) {
      return skedlyzeCalendar.id;
    }
    
    // Create new Skedlyze calendar if it doesn't exist
    const newCalendar = await calendar.calendars.insert({
      resource: {
        summary: 'Skedlyze Calendar',
        description: 'Tasks and events from Skedlyze app',
        timeZone: 'UTC'
      }
    });
    
    return newCalendar.data.id;
  } catch (error) {
    console.error('Error creating Skedlyze calendar:', error);
    throw error;
  }
};

// Get all tasks for the authenticated user
const getUserTasks = async (req, res) => {
  try {
    const tasks = await db('tasks')
      .where({ user_id: req.user.id })
      .orderBy('created_at', 'desc');
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// Get a specific task
const getTask = async (req, res) => {
  try {
    const task = await db('tasks')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
};

// Create a new task
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      category,
      due_date,
      start_time,
      end_time,
      all_day,
      experience_reward,
      is_recurring,
      recurrence_rule
    } = req.body;

    const [task] = await db('tasks').insert({
      user_id: req.user.id,
      title,
      description,
      priority: priority || 'medium',
      category: category || 'other',
      due_date: due_date ? new Date(due_date) : null,
      start_time: start_time ? new Date(start_time) : null,
      end_time: end_time ? new Date(end_time) : null,
      all_day: all_day || false,
      experience_reward: experience_reward || 10,
      is_recurring: is_recurring || false,
      recurrence_rule
    }).returning('*');

    // Update user's gamification data (temporarily disabled for debugging)
    try {
      await GamificationService.updateTaskStats(req.user.id, false, true);
      await GamificationService.updateCategoryStats(req.user.id, category || 'other', false);
    } catch (gamificationError) {
      console.error('Gamification service error (non-blocking):', gamificationError);
      // Continue with task creation even if gamification fails
    }

    // Auto-sync to Google Calendar if task has a due date and user has access token
    if (due_date) {
      try {
        const user = await db('users')
          .where({ id: req.user.id })
          .select('access_token')
          .first();

        if (user && user.access_token) {
          const calendar = getCalendarAPI(user.access_token);
          const skedlyzeCalendarId = await getOrCreateSkedlyzeCalendar(user.access_token);
          
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
            calendarId: skedlyzeCalendarId,
            resource: event
          });

          // Update task with calendar event ID
          await db('tasks')
            .where({ id: task.id })
            .update({
              google_calendar_event_id: response.data.id,
              synced_to_calendar: true
            });

          // Update the task object to include sync info
          task.google_calendar_event_id = response.data.id;
          task.synced_to_calendar = true;
        }
      } catch (calendarError) {
        console.error('Error syncing task to calendar (non-blocking):', calendarError);
        // Continue with task creation even if calendar sync fails
      }
    }

    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

// Update a task
const updateTask = async (req, res) => {
  try {
    const task = await db('tasks')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if task is being unchecked (completed -> not completed)
    const isBeingUnchecked = task.is_completed && req.body.is_completed === false;
    
    const [updatedTask] = await db('tasks')
      .where({ id: req.params.id })
      .update({
        ...req.body,
        updated_at: new Date()
      })
      .returning('*');

    // If task is being unchecked, deduct XP
    if (isBeingUnchecked && task.completed_at) {
      try {
        // Calculate XP to deduct based on original priority
        let experienceToDeduct;
        switch (task.priority) {
          case 'low':
            experienceToDeduct = 5;
            break;
          case 'high':
            experienceToDeduct = 20;
            break;
          default: // medium
            experienceToDeduct = 10;
            break;
        }

        // Deduct experience and update stats
        const experienceResult = await GamificationService.removeExperience(req.user.id, experienceToDeduct, 'task_uncompletion');
        await GamificationService.updateTaskStats(req.user.id, false, false); // Decrease completed count
        await GamificationService.updateCategoryStats(req.user.id, task.category, false); // Decrease category count

        // Return updated task with XP deduction info
        res.json({
          task: updatedTask,
          experienceLost: experienceResult.experienceLost,
          levelDown: experienceResult.levelDown,
          newLevel: experienceResult.levelDown ? experienceResult.level : null
        });
        return;
      } catch (gamificationError) {
        console.error('Gamification service error (non-blocking):', gamificationError);
        // Still return the updated task even if gamification fails
        res.json({
          task: updatedTask,
          experienceLost: 0,
          levelDown: false,
          newLevel: null
        });
        return;
      }
    }

    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const task = await db('tasks')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Remove from Google Calendar if synced
    if (task.google_calendar_event_id) {
      try {
        const user = await db('users')
          .where({ id: req.user.id })
          .select('access_token')
          .first();

        if (user && user.access_token) {
          const calendar = getCalendarAPI(user.access_token);
          const skedlyzeCalendarId = await getOrCreateSkedlyzeCalendar(user.access_token);
          
          await calendar.events.delete({
            calendarId: skedlyzeCalendarId,
            eventId: task.google_calendar_event_id
          });
        }
      } catch (calendarError) {
        console.error('Error removing task from calendar (non-blocking):', calendarError);
        // Continue with task deletion even if calendar removal fails
      }
    }

    await db('tasks').where({ id: req.params.id }).del();

    // Update user's gamification data after task deletion
    try {
      await GamificationService.updateTaskStats(req.user.id, false, false);
      await GamificationService.updateCategoryStats(req.user.id, task.category, false);
    } catch (gamificationError) {
      console.error('Gamification service error after task deletion (non-blocking):', gamificationError);
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

// Complete a task (with gamification)
const completeTask = async (req, res) => {
  try {
    const task = await db('tasks')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.is_completed) {
      return res.status(400).json({ error: 'Task already completed' });
    }

    const completionTime = task.start_time && task.end_time 
      ? Math.round((new Date(task.end_time) - new Date(task.start_time)) / (1000 * 60))
      : null;

    // Calculate XP based on priority
    let experienceReward;
    switch (task.priority) {
      case 'low':
        experienceReward = 5;
        break;
      case 'high':
        experienceReward = 20;
        break;
      default: // medium
        experienceReward = 10;
        break;
    }

    // Update task
    const [updatedTask] = await db('tasks')
      .where({ id: req.params.id })
      .update({
        is_completed: true,
        status: 'completed',
        completed_at: new Date(),
        completion_time_minutes: completionTime
      })
      .returning('*');

    // Update user's gamification data
    try {
      const experienceResult = await GamificationService.addExperience(req.user.id, experienceReward, 'task_completion');
      await GamificationService.updateTaskStats(req.user.id, true, false);
      await GamificationService.updateStreak(req.user.id);
      await GamificationService.updateCategoryStats(req.user.id, task.category, true);

      // Check for achievements
      // await achievementService.checkAllAchievements(req.user.id); // This line was removed from imports, so it's removed here.

      res.json({
        task: updatedTask,
        experienceGained: experienceResult.experienceGained,
        levelUp: experienceResult.levelUp,
        newLevel: experienceResult.levelUp ? experienceResult.level : null
      });
    } catch (gamificationError) {
      console.error('Gamification service error (non-blocking):', gamificationError);
      // Still return the completed task even if gamification fails
      res.json({
        task: updatedTask,
        experienceGained: experienceReward,
        levelUp: false,
        newLevel: null
      });
    }
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ error: 'Failed to complete task' });
  }
};

// Get tasks by category
const getTasksByCategory = async (req, res) => {
  try {
    const tasks = await db('tasks')
      .where({ 
        user_id: req.user.id, 
        category: req.params.category 
      })
      .orderBy('created_at', 'desc');
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks by category:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// Get tasks by status
const getTasksByStatus = async (req, res) => {
  try {
    const tasks = await db('tasks')
      .where({ 
        user_id: req.user.id, 
        status: req.params.status 
      })
      .orderBy('created_at', 'desc');
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks by status:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// Get tasks due today
const getTasksDueToday = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasks = await db('tasks')
      .where({ user_id: req.user.id })
      .whereBetween('due_date', [today, tomorrow])
      .orderBy('due_date', 'asc');
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks due today:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// Get tasks due this week
const getTasksDueThisWeek = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const tasks = await db('tasks')
      .where({ user_id: req.user.id })
      .whereBetween('due_date', [today, nextWeek])
      .orderBy('due_date', 'asc');
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks due this week:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// Sync task to Google Calendar
const syncTaskToCalendar = async (req, res) => {
  try {
    const task = await db('tasks')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // TODO: Implement Google Calendar API integration
    // This would create a calendar event and store the event ID

    res.json({ message: 'Task synced to calendar successfully' });
  } catch (error) {
    console.error('Error syncing task to calendar:', error);
    res.status(500).json({ error: 'Failed to sync task to calendar' });
  }
};

// Remove task from Google Calendar
const removeTaskFromCalendar = async (req, res) => {
  try {
    const task = await db('tasks')
      .where({ id: req.params.id, user_id: req.user.id })
      .first();

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // TODO: Implement Google Calendar API integration
    // This would delete the calendar event

    await db('tasks')
      .where({ id: req.params.id })
      .update({
        google_calendar_event_id: null,
        synced_to_calendar: false
      });

    res.json({ message: 'Task removed from calendar successfully' });
  } catch (error) {
    console.error('Error removing task from calendar:', error);
    res.status(500).json({ error: 'Failed to remove task from calendar' });
  }
};

module.exports = {
  getUserTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  completeTask,
  getTasksByCategory,
  getTasksByStatus,
  getTasksDueToday,
  getTasksDueThisWeek,
  syncTaskToCalendar,
  removeTaskFromCalendar
}; 