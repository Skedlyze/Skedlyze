const db = require('./db/knex');
const UserManagementService = require('./services/userManagementService');

async function setupSpecialUsers() {
  try {
    console.log('🔧 Setting up special users...');
    
    // Check if special users exist
    const newUserEmail = UserManagementService.SPECIAL_EMAILS.NEW_USER;
    const adminEmail = UserManagementService.SPECIAL_EMAILS.ADMIN;
    
    // Check for new user
    let newUser = await db('users').where({ email: newUserEmail }).first();
    if (!newUser) {
      console.log(`❌ New user (${newUserEmail}) not found. Creating...`);
      [newUser] = await db('users').insert({
        google_id: 'new-user-google-id',
        email: newUserEmail,
        name: 'New User',
        level: 0,
        experience_points: 0,
        streak_days: 0,
        total_tasks_completed: 0,
        total_tasks_created: 0,
        preferences: JSON.stringify({}),
        calendar_sync_enabled: false
      }).returning('*');
      console.log('✅ New user created');
    } else {
      console.log('✅ New user already exists');
    }

    // Check for admin user
    let adminUser = await db('users').where({ email: adminEmail }).first();
    if (!adminUser) {
      console.log(`❌ Admin user (${adminEmail}) not found. Creating...`);
      [adminUser] = await db('users').insert({
        google_id: 'admin-google-id',
        email: adminEmail,
        name: 'Admin User',
        level: 5,
        experience_points: 450,
        streak_days: 3,
        total_tasks_completed: 12,
        total_tasks_created: 15,
        preferences: JSON.stringify({}),
        calendar_sync_enabled: false
      }).returning('*');
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user already exists');
    }

    // Initialize gamification data for both users
    console.log('🔧 Initializing gamification data...');
    
    await UserManagementService.initializeUserData(newUser.id, newUserEmail);
    await UserManagementService.initializeUserData(adminUser.id, adminEmail);

    // Show user types
    console.log('\n📊 User Types:');
    console.log(`- ${newUserEmail}: ${UserManagementService.getUserType(newUserEmail)}`);
    console.log(`- ${adminEmail}: ${UserManagementService.getUserType(adminEmail)}`);

    // Show current stats
    const newUserData = await UserManagementService.getUserInfo(newUser.id);
    const adminUserData = await UserManagementService.getUserInfo(adminUser.id);

    console.log('\n📈 Current Stats:');
    console.log(`New User (${newUserEmail}):`);
    console.log(`  - Level: ${newUserData.gamificationData.level}`);
    console.log(`  - XP: ${newUserData.gamificationData.experience_points}`);
    console.log(`  - Tasks Completed: ${newUserData.gamificationData.total_tasks_completed}`);
    console.log(`  - Achievements: ${newUserData.gamificationData.total_achievements_earned}`);

    console.log(`\nAdmin User (${adminEmail}):`);
    console.log(`  - Level: ${adminUserData.gamificationData.level}`);
    console.log(`  - XP: ${adminUserData.gamificationData.experience_points}`);
    console.log(`  - Tasks Completed: ${adminUserData.gamificationData.total_tasks_completed}`);
    console.log(`  - Achievements: ${adminUserData.gamificationData.total_achievements_earned}`);

    console.log('\n🎉 Special users setup complete!');
  } catch (error) {
    console.error('❌ Error setting up special users:', error);
  } finally {
    await db.destroy();
  }
}

setupSpecialUsers(); 