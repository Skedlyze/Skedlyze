const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Get all tasks for the authenticated user
router.get('/', taskController.getUserTasks);

// Get tasks by category
router.get('/category/:category', taskController.getTasksByCategory);

// Get tasks by status
router.get('/status/:status', taskController.getTasksByStatus);

// Get tasks due today
router.get('/due/today', taskController.getTasksDueToday);

// Get tasks due this week
router.get('/due/week', taskController.getTasksDueThisWeek);

// Get a specific task
router.get('/:id', taskController.getTask);

// Create a new task
router.post('/', taskController.createTask);

// Update a task
router.put('/:id', taskController.updateTask);

// Delete a task
router.delete('/:id', taskController.deleteTask);

// Complete a task (with gamification)
router.patch('/:id/complete', taskController.completeTask);

// Sync task to Google Calendar
router.post('/:id/sync-calendar', taskController.syncTaskToCalendar);

// Remove task from Google Calendar
router.delete('/:id/sync-calendar', taskController.removeTaskFromCalendar);

module.exports = router; 