const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Get user profile
router.get('/profile', userController.getProfile);

// Update user profile
router.put('/profile', userController.updateProfile);

// Get user statistics and progress
router.get('/stats', userController.getUserStats);

// Get user achievements
router.get('/achievements', userController.getUserAchievements);

// Mark achievement as read
router.patch('/achievements/:id/read', userController.markAchievementAsRead);

// Get user level and experience
router.get('/level', userController.getUserLevel);

// Update user preferences
router.put('/preferences', userController.updatePreferences);

// Toggle calendar sync
router.patch('/calendar-sync', userController.toggleCalendarSync);

// Get user streak information
router.get('/streak', userController.getUserStreak);



module.exports = router; 