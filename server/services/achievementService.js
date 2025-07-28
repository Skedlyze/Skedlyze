const db = require('../db/knex');
const GamificationService = require('./gamificationService');

// Check for task completion achievements
const checkTaskCompletionAchievements = async (userId) => {
  try {
    const gamificationData = await GamificationService.getUserData(userId);

    // Get all task completion achievements
    const achievements = await db('achievements')
      .where({ type: 'task_completion' })
      .select('*');

    for (const achievement of achievements) {
      // Check if user meets the requirement
      if (gamificationData.total_tasks_completed >= achievement.requirement_value) {
        // Check if user already has this achievement
        const existingAchievement = await db('user_achievements')
          .where({ 
            user_id: userId, 
            achievement_id: achievement.id 
          })
          .first();

        if (!existingAchievement) {
          // Award the achievement
          await db('user_achievements').insert({
            user_id: userId,
            achievement_id: achievement.id,
            earned_at: new Date(),
            is_read: false
          });

          // Award experience points using the gamification service
          if (achievement.experience_reward > 0) {
            await GamificationService.addExperience(userId, achievement.experience_reward, 'achievement');
          }
        }
      }
    }
  } catch (error) {
    console.error('Error checking task completion achievements:', error);
  }
};

// Check for streak achievements
const checkStreakAchievements = async (userId) => {
  try {
    const gamificationData = await GamificationService.getUserData(userId);

    // Get all streak achievements
    const achievements = await db('achievements')
      .where({ type: 'streak' })
      .select('*');

    for (const achievement of achievements) {
      // Check if user meets the requirement
      if (gamificationData.current_streak_days >= achievement.requirement_value) {
        // Check if user already has this achievement
        const existingAchievement = await db('user_achievements')
          .where({ 
            user_id: userId, 
            achievement_id: achievement.id 
          })
          .first();

        if (!existingAchievement) {
          // Award the achievement
          await db('user_achievements').insert({
            user_id: userId,
            achievement_id: achievement.id,
            earned_at: new Date(),
            is_read: false
          });

          // Award experience points using the gamification service
          if (achievement.experience_reward > 0) {
            await GamificationService.addExperience(userId, achievement.experience_reward, 'achievement');
          }
        }
      }
    }
  } catch (error) {
    console.error('Error checking streak achievements:', error);
  }
};

// Check for level up achievements
const checkLevelUpAchievements = async (userId) => {
  try {
    const gamificationData = await GamificationService.getUserData(userId);

    // Get all level up achievements
    const achievements = await db('achievements')
      .where({ type: 'level_up' })
      .select('*');

    for (const achievement of achievements) {
      // Check if user meets the requirement
      if (gamificationData.level >= achievement.requirement_value) {
        // Check if user already has this achievement
        const existingAchievement = await db('user_achievements')
          .where({ 
            user_id: userId, 
            achievement_id: achievement.id 
          })
          .first();

        if (!existingAchievement) {
          // Award the achievement
          await db('user_achievements').insert({
            user_id: userId,
            achievement_id: achievement.id,
            earned_at: new Date(),
            is_read: false
          });

          // Award experience points using the gamification service
          if (achievement.experience_reward > 0) {
            await GamificationService.addExperience(userId, achievement.experience_reward, 'achievement');
          }
        }
      }
    }
  } catch (error) {
    console.error('Error checking level up achievements:', error);
  }
};

// Check all achievements for a user
const checkAllAchievements = async (userId) => {
  try {
    console.log(`🔍 Checking all achievements for user ${userId}`);
    
    // Check all types of achievements
    await checkTaskCompletionAchievements(userId);
    await checkStreakAchievements(userId);
    await checkLevelUpAchievements(userId);
    
    console.log(`✅ Achievement check completed for user ${userId}`);
  } catch (error) {
    console.error('Error checking all achievements:', error);
  }
};

// Update user streak
const updateUserStreak = async (userId) => {
  try {
    const user = await db('users')
      .where({ id: userId })
      .select('streak_days', 'last_activity_date')
      .first();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActivity = user.last_activity_date 
      ? new Date(user.last_activity_date)
      : null;

    let newStreakDays = user.streak_days;

    if (!lastActivity || lastActivity < today) {
      // Check if last activity was yesterday (to continue streak)
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastActivity && lastActivity >= yesterday) {
        // Continue streak
        newStreakDays = user.streak_days + 1;
      } else {
        // Reset streak
        newStreakDays = 1;
      }

      // Update user streak
      await db('users')
        .where({ id: userId })
        .update({
          streak_days: newStreakDays,
          last_activity_date: today
        });

      // Check for streak achievements
      await checkStreakAchievements(userId);
    }
  } catch (error) {
    console.error('Error updating user streak:', error);
  }
};

// Get user's achievements
const getUserAchievements = async (userId) => {
  try {
    const achievements = await db('user_achievements')
      .join('achievements', 'user_achievements.achievement_id', 'achievements.id')
      .where({ 'user_achievements.user_id': userId })
      .select(
        'achievements.*',
        'user_achievements.earned_at',
        'user_achievements.is_read'
      )
      .orderBy('user_achievements.earned_at', 'desc');

    return achievements;
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    throw error;
  }
};

// Initialize default achievements
const initializeDefaultAchievements = async () => {
  try {
    const existingAchievements = await db('achievements').count('* as count').first();
    
    if (existingAchievements.count > 0) {
      return; // Achievements already exist
    }

    const defaultAchievements = [
      // Task completion achievements
      {
        name: 'First Steps',
        description: 'Complete your first task',
        type: 'task_completion',
        requirement_value: 1,
        experience_reward: 25,
        is_hidden: false
      },
      {
        name: 'Task Master',
        description: 'Complete 10 tasks',
        type: 'task_completion',
        requirement_value: 10,
        experience_reward: 50,
        is_hidden: false
      },
      {
        name: 'Productivity Pro',
        description: 'Complete 50 tasks',
        type: 'task_completion',
        requirement_value: 50,
        experience_reward: 100,
        is_hidden: false
      },
      {
        name: 'Task Champion',
        description: 'Complete 100 tasks',
        type: 'task_completion',
        requirement_value: 100,
        experience_reward: 200,
        is_hidden: false
      },

      // Streak achievements
      {
        name: 'Getting Started',
        description: 'Maintain a 3-day streak',
        type: 'streak',
        requirement_value: 3,
        experience_reward: 30,
        is_hidden: false
      },
      {
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        type: 'streak',
        requirement_value: 7,
        experience_reward: 75,
        is_hidden: false
      },
      {
        name: 'Fortnight Fighter',
        description: 'Maintain a 14-day streak',
        type: 'streak',
        requirement_value: 14,
        experience_reward: 150,
        is_hidden: false
      },
      {
        name: 'Monthly Master',
        description: 'Maintain a 30-day streak',
        type: 'streak',
        requirement_value: 30,
        experience_reward: 300,
        is_hidden: false
      },

      // Level up achievements
      {
        name: 'Level 5',
        description: 'Reach level 5',
        type: 'level_up',
        requirement_value: 5,
        experience_reward: 50,
        is_hidden: false
      },
      {
        name: 'Level 10',
        description: 'Reach level 10',
        type: 'level_up',
        requirement_value: 10,
        experience_reward: 100,
        is_hidden: false
      },
      {
        name: 'Level 25',
        description: 'Reach level 25',
        type: 'level_up',
        requirement_value: 25,
        experience_reward: 250,
        is_hidden: false
      },
      {
        name: 'Level 50',
        description: 'Reach level 50',
        type: 'level_up',
        requirement_value: 50,
        experience_reward: 500,
        is_hidden: false
      }
    ];

    await db('achievements').insert(defaultAchievements);
    console.log('✅ Default achievements initialized');
  } catch (error) {
    console.error('Error initializing default achievements:', error);
  }
};

module.exports = {
  checkTaskCompletionAchievements,
  checkStreakAchievements,
  checkLevelUpAchievements,
  checkAllAchievements,
  getUserAchievements,
  updateUserStreak,
  initializeDefaultAchievements
}; 