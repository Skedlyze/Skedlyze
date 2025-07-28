const db = require('../db/knex');

// Get available goals for onboarding
const getAvailableGoals = async (req, res) => {
  try {
    const goals = [
      {
        id: 'productivity',
        name: 'Productivity',
        description: 'Boost your efficiency and get more done',
        icon: '⚡',
        color: '#4CAF50',
        benefits: ['Better time management', 'Increased output', 'Reduced stress']
      },
      {
        id: 'health',
        name: 'Health & Wellness',
        description: 'Improve your physical and mental well-being',
        icon: '💪',
        color: '#2196F3',
        benefits: ['More energy', 'Better mood', 'Improved focus']
      },
      {
        id: 'focus',
        name: 'Focus & Concentration',
        description: 'Develop deep work habits and eliminate distractions',
        icon: '🎯',
        color: '#FF9800',
        benefits: ['Better concentration', 'Higher quality work', 'Reduced stress']
      },
      {
        id: 'learning',
        name: 'Learning & Growth',
        description: 'Expand your knowledge and develop new skills',
        icon: '📚',
        color: '#9C27B0',
        benefits: ['Skill development', 'Career growth', 'Personal satisfaction']
      },
      {
        id: 'social',
        name: 'Social Connections',
        description: 'Strengthen relationships and build community',
        icon: '🤝',
        color: '#E91E63',
        benefits: ['Better relationships', 'Support network', 'Happiness']
      },
      {
        id: 'creativity',
        name: 'Creativity & Innovation',
        description: 'Unlock your creative potential and think outside the box',
        icon: '🎨',
        color: '#FF5722',
        benefits: ['Innovative thinking', 'Problem solving', 'Personal expression']
      }
    ];

    res.json(goals);
  } catch (error) {
    console.error('Error fetching available goals:', error);
    res.status(500).json({ error: 'Failed to fetch available goals' });
  }
};

// Set user's selected goal and generate default tasks
const setUserGoal = async (req, res) => {
  try {
    const { goal } = req.body;
    const userId = req.user.id;

    console.log('🎯 Setting goal for user:', userId, 'Goal:', goal);

    // Validate goal
    const validGoals = ['productivity', 'health', 'focus', 'learning', 'social', 'creativity'];
    if (!validGoals.includes(goal)) {
      return res.status(400).json({ error: 'Invalid goal selected' });
    }

    // Update user's goal
    await db('users')
      .where({ id: userId })
      .update({
        selected_goal: goal,
        updated_at: new Date()
      });

    console.log('✅ User goal updated');

    // Get default tasks for the selected goal
    const defaultTasks = await db('default_tasks')
      .where({ goal, is_active: true })
      .orderBy('sort_order', 'asc');

    console.log('📋 Found default tasks:', defaultTasks.length);

    // Generate user tasks from default tasks
    const today = new Date();
    const userTasks = [];

    for (const defaultTask of defaultTasks) {
      const task = {
        user_id: userId,
        title: defaultTask.title,
        description: defaultTask.description,
        category: defaultTask.category,
        priority: defaultTask.priority,
        experience_reward: defaultTask.experience_reward,
        status: 'pending',
        is_completed: false,
        created_at: new Date(),
        updated_at: new Date()
      };

      // Set due dates based on task frequency
      if (defaultTask.is_daily) {
        task.due_date = new Date(today);
        task.due_date.setHours(23, 59, 59, 999); // End of day
      } else if (defaultTask.is_weekly) {
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
        task.due_date = endOfWeek;
      }

      userTasks.push(task);
    }

    console.log('🔄 Generated user tasks:', userTasks.length);

    // Insert the generated tasks
    if (userTasks.length > 0) {
      const insertedTasks = await db('tasks').insert(userTasks).returning('*');
      console.log('✅ Inserted tasks:', insertedTasks.length);
    } else {
      console.log('⚠️ No tasks to insert');
    }

    // Get the updated user data
    const user = await db('users')
      .where({ id: userId })
      .select('*')
      .first();

    // Check task count after insertion
    const taskCount = await db('tasks')
      .where({ user_id: userId })
      .count('* as count')
      .first();

    console.log('📊 Final task count for user:', taskCount.count);

    res.json({
      message: 'Goal set successfully and default tasks generated',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        selected_goal: user.selected_goal,
        level: user.level,
        experience_points: user.experience_points
      },
      tasksGenerated: userTasks.length,
      totalTasks: parseInt(taskCount.count)
    });
  } catch (error) {
    console.error('❌ Error setting user goal:', error);
    res.status(500).json({ error: 'Failed to set user goal' });
  }
};

// Check if user needs onboarding (has no tasks)
const needsOnboarding = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('🔍 Checking onboarding status for user:', userId);

    const taskCount = await db('tasks')
      .where({ user_id: userId })
      .count('* as count')
      .first();

    const hasTasks = parseInt(taskCount.count) > 0;
    console.log('📊 Task count for user:', taskCount.count, 'Has tasks:', hasTasks);

    res.json({
      needsOnboarding: !hasTasks,
      taskCount: parseInt(taskCount.count)
    });
  } catch (error) {
    console.error('❌ Error checking onboarding status:', error);
    res.status(500).json({ error: 'Failed to check onboarding status' });
  }
};

// Generate new daily/weekly tasks for existing users
const generateDefaultTasks = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's selected goal
    const user = await db('users')
      .where({ id: userId })
      .select('selected_goal')
      .first();

    if (!user.selected_goal) {
      return res.status(400).json({ error: 'No goal selected. Please complete onboarding first.' });
    }

    // Get default tasks for the user's goal
    const defaultTasks = await db('default_tasks')
      .where({ 
        goal: user.selected_goal, 
        is_active: true 
      })
      .orderBy('sort_order', 'asc');

    const today = new Date();
    const newTasks = [];

    for (const defaultTask of defaultTasks) {
      // Check if this task already exists for today/this week
      let existingTaskQuery = db('tasks')
        .where({ 
          user_id: userId,
          title: defaultTask.title
        });

      if (defaultTask.is_daily) {
        existingTaskQuery = existingTaskQuery.whereRaw('DATE(due_date) = CURDATE()');
      } else if (defaultTask.is_weekly) {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        existingTaskQuery = existingTaskQuery
          .where('due_date', '>=', startOfWeek)
          .where('due_date', '<=', endOfWeek);
      }

      const existingTask = await existingTaskQuery.first();

      // Only create if task doesn't already exist for the current period
      if (!existingTask) {
        const task = {
          user_id: userId,
          title: defaultTask.title,
          description: defaultTask.description,
          category: defaultTask.category,
          priority: defaultTask.priority,
          experience_reward: defaultTask.experience_reward,
          status: 'pending',
          is_completed: false,
          created_at: new Date(),
          updated_at: new Date()
        };

        // Set due dates based on task frequency
        if (defaultTask.is_daily) {
          task.due_date = new Date(today);
          task.due_date.setHours(23, 59, 59, 999);
        } else if (defaultTask.is_weekly) {
          const endOfWeek = new Date(today);
          endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
          task.due_date = endOfWeek;
        }

        newTasks.push(task);
      }
    }

    // Insert new tasks
    if (newTasks.length > 0) {
      await db('tasks').insert(newTasks);
    }

    res.json({
      message: 'Default tasks generated successfully',
      tasksGenerated: newTasks.length,
      newTasks: newTasks
    });

  } catch (error) {
    console.error('Error generating default tasks:', error);
    res.status(500).json({ error: 'Failed to generate default tasks' });
  }
};

// Reset user data (for testing or fresh start)
const resetUserData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Clear all user data
    await db('tasks').where({ user_id: userId }).del();
    
    await db('users')
      .where({ id: userId })
      .update({
        selected_goal: null,
        level: 1,
        experience_points: 0,
        streak_days: 0,
        last_activity_date: null,
        total_tasks_completed: 0,
        total_tasks_created: 0,
        updated_at: new Date()
      });

    res.json({
      message: 'User data reset successfully. You will be redirected to onboarding.'
    });

  } catch (error) {
    console.error('Error resetting user data:', error);
    res.status(500).json({ error: 'Failed to reset user data' });
  }
};

// Wipe all data (admin function)
const wipeAllData = async (req, res) => {
  try {
    await db('tasks').del();
    await db('users').del();
    await db('default_tasks').del();
    
    res.json({
      message: 'All data wiped successfully. Database is now empty.'
    });

  } catch (error) {
    console.error('Error wiping all data:', error);
    res.status(500).json({ error: 'Failed to wipe all data' });
  }
};

module.exports = {
  getAvailableGoals,
  setUserGoal,
  needsOnboarding,
  generateDefaultTasks,
  resetUserData,
  wipeAllData
}; 