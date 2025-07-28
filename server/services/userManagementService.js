const db = require('../db/knex');
const GamificationService = require('./gamificationService');

class UserManagementService {
  // Define special user types
  static USER_TYPES = {
    NEW_USER: 'new_user',
    ADMIN: 'admin',
    EXISTING_USER: 'existing_user'
  };

  // Define special email addresses
  static SPECIAL_EMAILS = {
    NEW_USER: 'airbomberofaqua@gmail.com',
    ADMIN: 'marcrespo518@gmail.com'
  };

  // Determine user type based on email
  static getUserType(email) {
    if (email === this.SPECIAL_EMAILS.NEW_USER) {
      return this.USER_TYPES.NEW_USER;
    } else if (email === this.SPECIAL_EMAILS.ADMIN) {
      return this.USER_TYPES.ADMIN;
    } else {
      return this.USER_TYPES.EXISTING_USER;
    }
  }

  // Check if user should start with zero data
  static shouldStartWithZeroData(email) {
    const userType = this.getUserType(email);
    return userType === this.USER_TYPES.NEW_USER;
  }

  // Initialize user data based on their type
  static async initializeUserData(userId, email, userType = null) {
    try {
      if (!userType) {
        userType = this.getUserType(email);
      }

      console.log(`🔧 Initializing user data for ${email} (Type: ${userType})`);

      let gamificationData;

      switch (userType) {
        case this.USER_TYPES.NEW_USER:
          // New user starts with zero data
          gamificationData = await this.initializeNewUserData(userId);
          console.log('✅ New user initialized with zero data');
          break;

        case this.USER_TYPES.ADMIN:
          // Admin keeps current stats (or gets admin privileges)
          gamificationData = await this.initializeAdminUserData(userId);
          console.log('✅ Admin user initialized with current stats');
          break;

        case this.USER_TYPES.EXISTING_USER:
          // Existing users get migrated data or zero data based on preference
          gamificationData = await this.initializeExistingUserData(userId);
          console.log('✅ Existing user initialized');
          break;

        default:
          // Default to new user behavior
          gamificationData = await this.initializeNewUserData(userId);
          console.log('✅ Default user initialized with zero data');
      }

      return gamificationData;
    } catch (error) {
      console.error('Error initializing user data:', error);
      throw error;
    }
  }

  // Initialize new user with zero data
  static async initializeNewUserData(userId) {
    // Check if gamification data already exists
    let gamificationData = await db('user_gamification_data')
      .where({ user_id: userId })
      .first();

    if (!gamificationData) {
      // Create new gamification data
      [gamificationData] = await db('user_gamification_data').insert({
        user_id: userId,
        level: 0,
        experience_points: 0,
        total_experience_earned: 0,
        current_streak_days: 0,
        longest_streak_days: 0,
        total_tasks_created: 0,
        total_tasks_completed: 0,
        tasks_completed_today: 0,
        tasks_completed_this_week: 0,
        tasks_completed_this_month: 0,
        total_achievements_earned: 0,
        unlocked_achievements: JSON.stringify([]),
        completion_rate: 0.00,
        consecutive_days_active: 0,
        first_login_date: new Date(),
        last_activity_date: new Date(),
        current_quests: JSON.stringify([]),
        completed_quests: JSON.stringify([]),
        inventory: JSON.stringify({}),
        badges: JSON.stringify([]),
        category_stats: JSON.stringify({})
      }).returning('*');
    } else {
      // Reset existing data to zero
      [gamificationData] = await db('user_gamification_data')
        .where({ user_id: userId })
        .update({
          level: 0,
          experience_points: 0,
          total_experience_earned: 0,
          current_streak_days: 0,
          longest_streak_days: 0,
          total_tasks_created: 0,
          total_tasks_completed: 0,
          tasks_completed_today: 0,
          tasks_completed_this_week: 0,
          tasks_completed_this_month: 0,
          total_achievements_earned: 0,
          unlocked_achievements: JSON.stringify([]),
          completion_rate: 0.00,
          consecutive_days_active: 0,
          last_activity_date: new Date(),
          current_quests: JSON.stringify([]),
          completed_quests: JSON.stringify([]),
          inventory: JSON.stringify({}),
          badges: JSON.stringify([]),
          category_stats: JSON.stringify({})
        })
        .returning('*');
    }

    return gamificationData;
  }

  // Initialize admin user (keeps current stats or gets admin privileges)
  static async initializeAdminUserData(userId) {
    // Check if admin already has gamification data
    let gamificationData = await db('user_gamification_data')
      .where({ user_id: userId })
      .first();

    if (!gamificationData) {
      // Create admin with some starter stats (not zero)
      [gamificationData] = await db('user_gamification_data').insert({
        user_id: userId,
        level: 5, // Admin starts at level 5
        experience_points: 450, // Some XP to show progress
        total_experience_earned: 450,
        current_streak_days: 3, // Some streak
        longest_streak_days: 7,
        total_tasks_created: 15, // Some tasks
        total_tasks_completed: 12,
        tasks_completed_today: 2,
        tasks_completed_this_week: 5,
        tasks_completed_this_month: 12,
        total_achievements_earned: 3, // Some achievements
        unlocked_achievements: JSON.stringify([1, 2, 3]), // First few achievements
        completion_rate: 80.00, // Good completion rate
        consecutive_days_active: 3,
        first_login_date: new Date(),
        last_activity_date: new Date(),
        current_quests: JSON.stringify([]),
        completed_quests: JSON.stringify([1, 2]), // Some completed quests
        inventory: JSON.stringify({ 'admin_badge': true }),
        badges: JSON.stringify(['admin', 'early_adopter']),
        category_stats: JSON.stringify({
          work: { total_created: 8, total_completed: 7, completion_rate: 87.5 },
          personal: { total_created: 4, total_completed: 3, completion_rate: 75.0 },
          health: { total_created: 3, total_completed: 2, completion_rate: 66.7 }
        })
      }).returning('*');
    }

    return gamificationData;
  }

  // Initialize existing user (migrate data or start fresh)
  static async initializeExistingUserData(userId) {
    // Check if user already has gamification data
    let gamificationData = await db('user_gamification_data')
      .where({ user_id: userId })
      .first();

    if (!gamificationData) {
      // For existing users, start with zero data (can be changed later)
      gamificationData = await this.initializeNewUserData(userId);
    }

    return gamificationData;
  }

  // Get user info with type
  static async getUserInfo(userId) {
    try {
      const user = await db('users')
        .where({ id: userId })
        .first();

      if (!user) {
        return null;
      }

      const userType = this.getUserType(user.email);
      const gamificationData = await GamificationService.getUserData(userId);

      return {
        ...user,
        userType,
        gamificationData,
        isNewUser: userType === this.USER_TYPES.NEW_USER,
        isAdmin: userType === this.USER_TYPES.ADMIN
      };
    } catch (error) {
      console.error('Error getting user info:', error);
      throw error;
    }
  }

  // Reset user to new user status (for testing)
  static async resetUserToNew(userId) {
    try {
      // Delete existing gamification data
      await db('user_gamification_data')
        .where({ user_id: userId })
        .del();

      // Delete user achievements
      await db('user_achievements')
        .where({ user_id: userId })
        .del();

      // Delete user tasks
      await db('tasks')
        .where({ user_id: userId })
        .del();

      // Reinitialize as new user
      const user = await db('users')
        .where({ id: userId })
        .first();

      if (user) {
        return await this.initializeNewUserData(userId);
      }

      return null;
    } catch (error) {
      console.error('Error resetting user:', error);
      throw error;
    }
  }

  // Get all users with their types
  static async getAllUsersWithTypes() {
    try {
      const users = await db('users')
        .leftJoin('user_gamification_data', 'users.id', 'user_gamification_data.user_id')
        .select(
          'users.id',
          'users.email',
          'users.name',
          'users.created_at',
          'user_gamification_data.level',
          'user_gamification_data.experience_points',
          'user_gamification_data.total_tasks_completed'
        );

      return users.map(user => ({
        ...user,
        userType: this.getUserType(user.email),
        isNewUser: this.getUserType(user.email) === this.USER_TYPES.NEW_USER,
        isAdmin: this.getUserType(user.email) === this.USER_TYPES.ADMIN
      }));
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }
}

module.exports = UserManagementService; 