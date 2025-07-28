const db = require('./db/knex');
const GamificationService = require('./services/gamificationService');

async function initTestUser() {
  try {
    console.log('🔧 Initializing test user gamification data...');
    
    // Check if test user exists
    const user = await db('users').where({ id: 1 }).first();
    if (!user) {
      console.log('❌ Test user (ID: 1) not found. Creating...');
      await db('users').insert({
        id: 1,
        google_id: 'test-google-id',
        email: 'test@example.com',
        name: 'Test User',
        level: 0,
        experience_points: 0,
        streak_days: 0,
        total_tasks_completed: 0,
        total_tasks_created: 0,
        preferences: JSON.stringify({}),
        calendar_sync_enabled: false
      });
      console.log('✅ Test user created');
    } else {
      console.log('✅ Test user already exists');
    }

    // Initialize gamification data
    const gamificationData = await GamificationService.getUserData(1);
    console.log('✅ Gamification data initialized:', {
      user_id: gamificationData.user_id,
      level: gamificationData.level,
      experience_points: gamificationData.experience_points
    });

    console.log('🎉 Test user setup complete!');
  } catch (error) {
    console.error('❌ Error initializing test user:', error);
  } finally {
    await db.destroy();
  }
}

initTestUser(); 