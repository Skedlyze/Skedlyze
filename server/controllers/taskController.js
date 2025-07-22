const db = require('../db/knex');
const { google } = require('googleapis');
const achievementService = require('../services/achievementService');

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

    // Update user's total tasks created
    await db('users')
      .where({ id: req.user.id })
      .increment('total_tasks_created', 1);

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

    const [updatedTask] = await db('tasks')
      .where({ id: req.params.id })
      .update({
        ...req.body,
        updated_at: new Date()
      })
      .returning('*');

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
      // TODO: Implement Google Calendar deletion
    }

    await db('tasks').where({ id: req.params.id }).del();

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

    // Update user stats and award experience
    const [user] = await db('users')
      .where({ id: req.user.id })
      .increment({
        total_tasks_completed: 1,
        experience_points: task.experience_reward
      })
      .returning('*');

    // Check for level up
    const newLevel = Math.floor(user.experience_points / 100) + 1;
    if (newLevel > user.level) {
      await db('users')
        .where({ id: req.user.id })
        .update({ level: newLevel });
    }

    // Check for achievements
    await achievementService.checkTaskCompletionAchievements(req.user.id);

    res.json({
      task: updatedTask,
      experienceGained: task.experience_reward,
      newLevel: newLevel > user.level ? newLevel : null
    });
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