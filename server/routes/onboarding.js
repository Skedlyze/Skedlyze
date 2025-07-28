const express = require('express');
const router = express.Router();
const onboardingController = require('../controllers/onboardingController');

// Get available goals for onboarding
router.get('/goals', onboardingController.getAvailableGoals);

// Set user's selected goal and generate default tasks
router.post('/set-goal', onboardingController.setUserGoal);

// Check if user needs onboarding (has no tasks)
router.get('/needs-onboarding', onboardingController.needsOnboarding);

// Generate new default tasks for existing users
router.post('/generate-tasks', onboardingController.generateDefaultTasks);

// Reset user data (for testing or fresh start)
router.post('/reset', onboardingController.resetUserData);

// Wipe all data (admin function)
router.post('/wipe-all', onboardingController.wipeAllData);

module.exports = router; 