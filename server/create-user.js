const db = require('./db/knex');

async function createTestUser() {
  try {
    // Check if test user already exists
    const existingUser = await db('users').where({ id: 1 }).first();
    
    if (existingUser) {
      console.log('✅ Test user already exists');
      return;
    }

    // Create test user with ID 1 to match the mock user
    const [user] = await db('users').insert({
      id: 1, // Force ID to match mock user
      email: 'test@example.com',
      name: 'Test User',
      google_id: 'test-google-id',
      level: 0,
      experience_points: 0,
      total_tasks_created: 0,
      total_tasks_completed: 0,
      streak_days: 0,
      last_activity_date: null,
      preferences: JSON.stringify({
        theme: 'light',
        notifications: true,
        calendar_sync: false
      }),
      calendar_sync_enabled: false
    }).returning('*');

    console.log('✅ Test user created successfully:', user);
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await db.destroy();
  }
}

createTestUser(); 