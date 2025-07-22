const db = require('../db/knex');

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await db('users')
      .where({ id: req.user.id })
      .select('id', 'google_id', 'email', 'name', 'picture', 'level', 'experience_points', 'streak_days', 'total_tasks_completed', 'total_tasks_created', 'preferences', 'calendar_sync_enabled', 'created_at', 'updated_at')
      .first();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, preferences } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (preferences) updateData.preferences = JSON.stringify(preferences);

    const [updatedUser] = await db('users')
      .where({ id: req.user.id })
      .update({
        ...updateData,
        updated_at: new Date()
      })
      .returning('*');

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
};

// Get user statistics and progress
const getUserStats = async (req, res) => {
  try {
    const user = await db('users')
      .where({ id: req.user.id })
      .select('level', 'experience_points', 'streak_days', 'total_tasks_completed', 'total_tasks_created', 'last_activity_date')
      .first();

    // Get task statistics
    const taskStats = await db('tasks')
      .where({ user_id: req.user.id })
      .select(
        db.raw('COUNT(*) as total_tasks'),
        db.raw('COUNT(CASE WHEN is_completed = true THEN 1 END) as completed_tasks'),
        db.raw('COUNT(CASE WHEN is_completed = false THEN 1 END) as pending_tasks'),
        db.raw('AVG(CASE WHEN completion_time_minutes IS NOT NULL THEN completion_time_minutes END) as avg_completion_time')
      )
      .first();

    // Get category breakdown
    const categoryStats = await db('tasks')
      .where({ user_id: req.user.id })
      .select('category')
      .count('* as count')
      .groupBy('category');

    const stats = {
      user,
      taskStats,
      categoryStats,
      experienceToNextLevel: 100 - (user.experience_points % 100),
      completionRate: user.total_tasks_created > 0 
        ? Math.round((user.total_tasks_completed / user.total_tasks_created) * 100) 
        : 0
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
};

// Get user achievements
const getUserAchievements = async (req, res) => {
  try {
    const achievements = await db('user_achievements')
      .join('achievements', 'user_achievements.achievement_id', 'achievements.id')
      .where({ 'user_achievements.user_id': req.user.id })
      .select(
        'achievements.*',
        'user_achievements.earned_at',
        'user_achievements.is_read'
      )
      .orderBy('user_achievements.earned_at', 'desc');

    res.json(achievements);
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    res.status(500).json({ error: 'Failed to fetch user achievements' });
  }
};

// Mark achievement as read
const markAchievementAsRead = async (req, res) => {
  try {
    await db('user_achievements')
      .where({ 
        user_id: req.user.id, 
        achievement_id: req.params.id 
      })
      .update({ is_read: true });

    res.json({ message: 'Achievement marked as read' });
  } catch (error) {
    console.error('Error marking achievement as read:', error);
    res.status(500).json({ error: 'Failed to mark achievement as read' });
  }
};

// Get user level and experience
const getUserLevel = async (req, res) => {
  try {
    const user = await db('users')
      .where({ id: req.user.id })
      .select('level', 'experience_points')
      .first();

    const levelInfo = {
      currentLevel: user.level,
      currentExperience: user.experience_points,
      experienceToNextLevel: 100 - (user.experience_points % 100),
      totalExperienceForNextLevel: 100,
      progressPercentage: (user.experience_points % 100)
    };

    res.json(levelInfo);
  } catch (error) {
    console.error('Error fetching user level:', error);
    res.status(500).json({ error: 'Failed to fetch user level' });
  }
};

// Update user preferences
const updatePreferences = async (req, res) => {
  try {
    const { preferences } = req.body;

    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({ error: 'Invalid preferences format' });
    }

    await db('users')
      .where({ id: req.user.id })
      .update({
        preferences: JSON.stringify(preferences),
        updated_at: new Date()
      });

    res.json({ message: 'Preferences updated successfully' });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
};

// Toggle calendar sync
const toggleCalendarSync = async (req, res) => {
  try {
    const user = await db('users')
      .where({ id: req.user.id })
      .select('calendar_sync_enabled')
      .first();

    const newSyncStatus = !user.calendar_sync_enabled;

    await db('users')
      .where({ id: req.user.id })
      .update({
        calendar_sync_enabled: newSyncStatus,
        updated_at: new Date()
      });

    res.json({ 
      message: `Calendar sync ${newSyncStatus ? 'enabled' : 'disabled'}`,
      calendar_sync_enabled: newSyncStatus
    });
  } catch (error) {
    console.error('Error toggling calendar sync:', error);
    res.status(500).json({ error: 'Failed to toggle calendar sync' });
  }
};

// Get user streak information
const getUserStreak = async (req, res) => {
  try {
    const user = await db('users')
      .where({ id: req.user.id })
      .select('streak_days', 'last_activity_date')
      .first();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActivity = user.last_activity_date 
      ? new Date(user.last_activity_date)
      : null;

    const streakInfo = {
      currentStreak: user.streak_days,
      lastActivityDate: lastActivity,
      hasActivityToday: lastActivity && lastActivity >= today,
      nextMilestone: getNextStreakMilestone(user.streak_days)
    };

    res.json(streakInfo);
  } catch (error) {
    console.error('Error fetching user streak:', error);
    res.status(500).json({ error: 'Failed to fetch user streak' });
  }
};

// Helper function to get next streak milestone
const getNextStreakMilestone = (currentStreak) => {
  const milestones = [1, 3, 7, 14, 30, 60, 100, 365];
  const nextMilestone = milestones.find(milestone => milestone > currentStreak);
  
  return nextMilestone ? {
    days: nextMilestone,
    daysRemaining: nextMilestone - currentStreak
  } : null;
};

module.exports = {
  getProfile,
  updateProfile,
  getUserStats,
  getUserAchievements,
  markAchievementAsRead,
  getUserLevel,
  updatePreferences,
  toggleCalendarSync,
  getUserStreak
}; 