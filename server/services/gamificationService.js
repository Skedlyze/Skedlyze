const db = require('../db/knex');
const achievementService = require('./achievementService');

class GamificationService {
  // Initialize gamification data for a new user
  static async initializeUserData(userId) {
    try {
      const [gamificationData] = await db('user_gamification_data').insert({
        user_id: userId,
        first_login_date: new Date(),
        last_activity_date: new Date()
      }).returning('*');

      return gamificationData;
    } catch (error) {
      console.error('Error initializing user gamification data:', error);
      throw error;
    }
  }

  // Get user's gamification data
  static async getUserData(userId) {
    try {
      let gamificationData = await db('user_gamification_data')
        .where({ user_id: userId })
        .first();

      // If no gamification data exists, create it
      if (!gamificationData) {
        gamificationData = await this.initializeUserData(userId);
      }

      return gamificationData;
    } catch (error) {
      console.error('Error fetching user gamification data:', error);
      throw error;
    }
  }

  // Update user's experience points and level
  static async addExperience(userId, experiencePoints, reason = 'task_completion') {
    try {
      const gamificationData = await this.getUserData(userId);
      
      const newTotalExperience = gamificationData.total_experience_earned + experiencePoints;
      const newExperiencePoints = gamificationData.experience_points + experiencePoints;
      
      // Calculate new level using formula: 50 + 50L where L is the level
      // Level 1: 100 XP, Level 2: 150 XP, Level 3: 200 XP, etc.
      let newLevel = 1;
      let totalRequired = 0;
      
      for (let level = 1; level <= 100; level++) { // Cap at level 100 to prevent infinite loop
        const requiredForLevel = 50 + (50 * level);
        totalRequired += requiredForLevel;
        
        if (newExperiencePoints >= totalRequired) {
          newLevel = level + 1;
        } else {
          break;
        }
      }
      
      const updates = {
        experience_points: newExperiencePoints,
        total_experience_earned: newTotalExperience,
        level: newLevel,
        last_activity_date: new Date()
      };

      // Check for level up
      const levelUp = newLevel > gamificationData.level;
      
      const [updatedData] = await db('user_gamification_data')
        .where({ user_id: userId })
        .update(updates)
        .returning('*');

      // Check for level-up achievements after gaining experience
      if (levelUp) {
        try {
          await achievementService.checkLevelUpAchievements(userId);
        } catch (achievementError) {
          console.error('Error checking level-up achievements:', achievementError);
        }
      }

      return {
        ...updatedData,
        levelUp,
        experienceGained: experiencePoints,
        reason
      };
    } catch (error) {
      console.error('Error adding experience:', error);
      throw error;
    }
  }

  // Remove experience points and handle level down
  static async removeExperience(userId, experiencePoints, reason = 'task_uncompletion') {
    try {
      const gamificationData = await this.getUserData(userId);
      
      const newExperiencePoints = Math.max(0, gamificationData.experience_points - experiencePoints);
      
      // Calculate new level using formula: 50 + 50L where L is the level
      let newLevel = 1;
      let totalRequired = 0;
      
      for (let level = 1; level <= 100; level++) { // Cap at level 100 to prevent infinite loop
        const requiredForLevel = 50 + (50 * level);
        totalRequired += requiredForLevel;
        
        if (newExperiencePoints >= totalRequired) {
          newLevel = level + 1;
        } else {
          break;
        }
      }
      
      const updates = {
        experience_points: newExperiencePoints,
        level: newLevel,
        last_activity_date: new Date()
      };

      // Check for level down
      const levelDown = newLevel < gamificationData.level;
      
      const [updatedData] = await db('user_gamification_data')
        .where({ user_id: userId })
        .update(updates)
        .returning('*');

      return {
        ...updatedData,
        levelDown,
        experienceLost: experiencePoints,
        reason
      };
    } catch (error) {
      console.error('Error removing experience:', error);
      throw error;
    }
  }

  // Update task completion statistics
  static async updateTaskStats(userId, taskCompleted = false, taskCreated = false) {
    try {
      const gamificationData = await this.getUserData(userId);
      
      const updates = {
        last_activity_date: new Date()
      };

      if (taskCreated) {
        updates.total_tasks_created = gamificationData.total_tasks_created + 1;
      }

      if (taskCompleted) {
        updates.total_tasks_completed = gamificationData.total_tasks_completed + 1;
        updates.tasks_completed_today = gamificationData.tasks_completed_today + 1;
        updates.tasks_completed_this_week = gamificationData.tasks_completed_this_week + 1;
        updates.tasks_completed_this_month = gamificationData.tasks_completed_this_month + 1;
      }

      // Update completion rate
      const newTotalCreated = updates.total_tasks_created || gamificationData.total_tasks_created;
      const newTotalCompleted = updates.total_tasks_completed || gamificationData.total_tasks_completed;
      updates.completion_rate = newTotalCreated > 0 ? (newTotalCompleted / newTotalCreated) * 100 : 0;

      const [updatedData] = await db('user_gamification_data')
        .where({ user_id: userId })
        .update(updates)
        .returning('*');

      return updatedData;
    } catch (error) {
      console.error('Error updating task stats:', error);
      throw error;
    }
  }

  // Update streak information
  static async updateStreak(userId) {
    try {
      const gamificationData = await this.getUserData(userId);
      const today = new Date();
      const lastActivity = gamificationData.last_activity_date ? new Date(gamificationData.last_activity_date) : null;
      
      let newStreak = gamificationData.current_streak_days;
      let streakStartDate = gamificationData.streak_start_date;

      if (!lastActivity) {
        // First activity
        newStreak = 1;
        streakStartDate = today;
      } else {
        const daysDifference = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
        
        if (daysDifference === 1) {
          // Consecutive day
          newStreak = gamificationData.current_streak_days + 1;
        } else if (daysDifference === 0) {
          // Same day, keep current streak
          newStreak = gamificationData.current_streak_days;
        } else {
          // Streak broken, reset to 1
          newStreak = 1;
          streakStartDate = today;
        }
      }

      const updates = {
        current_streak_days: newStreak,
        longest_streak_days: Math.max(newStreak, gamificationData.longest_streak_days),
        streak_start_date: streakStartDate,
        last_activity_date: today
      };

      const [updatedData] = await db('user_gamification_data')
        .where({ user_id: userId })
        .update(updates)
        .returning('*');

      // Check for streak achievements after updating streak
      try {
        await achievementService.checkStreakAchievements(userId);
      } catch (achievementError) {
        console.error('Error checking streak achievements:', achievementError);
      }

      return updatedData;
    } catch (error) {
      console.error('Error updating streak:', error);
      throw error;
    }
  }

  // Unlock an achievement for a user
  static async unlockAchievement(userId, achievementId) {
    try {
      const gamificationData = await this.getUserData(userId);
      
      // Check if achievement is already unlocked
      const unlockedAchievements = JSON.parse(gamificationData.unlocked_achievements || '[]');
      if (unlockedAchievements.includes(achievementId)) {
        return { alreadyUnlocked: true, gamificationData };
      }

      // Add achievement to unlocked list
      unlockedAchievements.push(achievementId);
      
      const updates = {
        total_achievements_earned: gamificationData.total_achievements_earned + 1,
        unlocked_achievements: JSON.stringify(unlockedAchievements),
        last_activity_date: new Date()
      };

      const [updatedData] = await db('user_gamification_data')
        .where({ user_id: userId })
        .update(updates)
        .returning('*');

      // Add to user_achievements table
      await db('user_achievements').insert({
        user_id: userId,
        achievement_id: achievementId,
        earned_at: new Date()
      });

      return { 
        achievementUnlocked: true, 
        gamificationData: updatedData,
        achievementId 
      };
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      throw error;
    }
  }

  // Get user's achievements
  static async getUserAchievements(userId) {
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
  }

  // Update category statistics
  static async updateCategoryStats(userId, category, taskCompleted = false) {
    try {
      const gamificationData = await this.getUserData(userId);
      const categoryStats = JSON.parse(gamificationData.category_stats || '{}');
      
      if (!categoryStats[category]) {
        categoryStats[category] = {
          total_created: 0,
          total_completed: 0,
          completion_rate: 0
        };
      }

      if (taskCompleted) {
        categoryStats[category].total_completed += 1;
      } else {
        categoryStats[category].total_created += 1;
      }

      categoryStats[category].completion_rate = 
        categoryStats[category].total_created > 0 
          ? (categoryStats[category].total_completed / categoryStats[category].total_created) * 100 
          : 0;

      const [updatedData] = await db('user_gamification_data')
        .where({ user_id: userId })
        .update({
          category_stats: JSON.stringify(categoryStats),
          last_activity_date: new Date()
        })
        .returning('*');

      return updatedData;
    } catch (error) {
      console.error('Error updating category stats:', error);
      throw error;
    }
  }

  // Reset daily/weekly/monthly counters (should be called by a cron job)
  static async resetPeriodicCounters(userId, resetType = 'daily') {
    try {
      const updates = {};
      
      switch (resetType) {
        case 'daily':
          updates.tasks_completed_today = 0;
          break;
        case 'weekly':
          updates.tasks_completed_this_week = 0;
          break;
        case 'monthly':
          updates.tasks_completed_this_month = 0;
          break;
      }

      const [updatedData] = await db('user_gamification_data')
        .where({ user_id: userId })
        .update(updates)
        .returning('*');

      return updatedData;
    } catch (error) {
      console.error('Error resetting periodic counters:', error);
      throw error;
    }
  }

  // Get leaderboard data (for future features)
  static async getLeaderboard(limit = 10) {
    try {
      const leaderboard = await db('user_gamification_data')
        .join('users', 'user_gamification_data.user_id', 'users.id')
        .select(
          'users.name',
          'users.picture',
          'user_gamification_data.level',
          'user_gamification_data.experience_points',
          'user_gamification_data.current_streak_days',
          'user_gamification_data.total_tasks_completed'
        )
        .orderBy('user_gamification_data.experience_points', 'desc')
        .limit(limit);

      return leaderboard;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  }
}

module.exports = GamificationService; 