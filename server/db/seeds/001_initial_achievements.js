const achievementService = require('../../services/achievementService');

exports.seed = async function(knex) {
  // Initialize default achievements
  await achievementService.initializeDefaultAchievements();
}; 