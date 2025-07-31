const db = require('./db/knex');
const achievementService = require('./services/achievementService');

async function initAchievements() {
  try {
    console.log('🏆 Initializing default achievements...');
    
    await achievementService.initializeDefaultAchievements();
    
    console.log('✅ Default achievements initialized successfully!');
  } catch (error) {
    console.error('❌ Error initializing achievements:', error);
  } finally {
    await db.destroy();
  }
}

initAchievements(); 