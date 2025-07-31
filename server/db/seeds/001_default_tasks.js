exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('default_tasks').del()
    .then(function () {
      // Inserts seed entries
      return knex('default_tasks').insert([
        // PRODUCTIVITY GOAL TASKS
        {
          goal: 'productivity',
          title: 'Plan your day',
          description: 'Take 5 minutes to review your schedule and set priorities for the day',
          category: 'work',
          priority: 'high',
          experience_reward: 15,
          estimated_minutes: 5,
          is_daily: true,
          is_weekly: false,
          tags: JSON.stringify(['planning', 'organization']),
          sort_order: 1
        },
        {
          goal: 'productivity',
          title: 'Clear your workspace',
          description: 'Organize your desk and digital files for better focus',
          category: 'work',
          priority: 'medium',
          experience_reward: 10,
          estimated_minutes: 10,
          is_daily: true,
          is_weekly: false,
          tags: JSON.stringify(['organization', 'workspace']),
          sort_order: 2
        },
        {
          goal: 'productivity',
          title: 'Review weekly goals',
          description: 'Check your progress and adjust your weekly objectives',
          category: 'work',
          priority: 'medium',
          experience_reward: 20,
          estimated_minutes: 15,
          is_daily: false,
          is_weekly: true,
          tags: JSON.stringify(['planning', 'review']),
          sort_order: 3
        },
        {
          goal: 'productivity',
          title: 'Batch similar tasks',
          description: 'Group similar activities together to work more efficiently',
          category: 'work',
          priority: 'medium',
          experience_reward: 12,
          estimated_minutes: 20,
          is_daily: true,
          is_weekly: false,
          tags: JSON.stringify(['efficiency', 'batching']),
          sort_order: 4
        },

        // HEALTH GOAL TASKS
        {
          goal: 'health',
          title: '10-minute workout',
          description: 'Quick exercise session - could be jogging, yoga, or bodyweight exercises',
          category: 'health',
          priority: 'high',
          experience_reward: 20,
          estimated_minutes: 10,
          is_daily: true,
          is_weekly: false,
          tags: JSON.stringify(['exercise', 'fitness']),
          sort_order: 1
        },
        {
          goal: 'health',
          title: 'Drink 8 glasses of water',
          description: 'Stay hydrated throughout the day',
          category: 'health',
          priority: 'medium',
          experience_reward: 8,
          estimated_minutes: 1,
          is_daily: true,
          is_weekly: false,
          tags: JSON.stringify(['hydration', 'wellness']),
          sort_order: 2
        },
        {
          goal: 'health',
          title: 'Take a 5-minute break',
          description: 'Step away from your screen and stretch or walk around',
          category: 'health',
          priority: 'medium',
          experience_reward: 5,
          estimated_minutes: 5,
          is_daily: true,
          is_weekly: false,
          tags: JSON.stringify(['breaks', 'wellness']),
          sort_order: 3
        },
        {
          goal: 'health',
          title: 'Prepare a healthy meal',
          description: 'Cook or prepare a nutritious meal for yourself',
          category: 'health',
          priority: 'medium',
          experience_reward: 15,
          estimated_minutes: 30,
          is_daily: true,
          is_weekly: false,
          tags: JSON.stringify(['nutrition', 'cooking']),
          sort_order: 4
        },

        // FOCUS GOAL TASKS
        {
          goal: 'focus',
          title: 'Deep work session',
          description: 'Work on a single task without interruptions for 25 minutes',
          category: 'work',
          priority: 'high',
          experience_reward: 25,
          estimated_minutes: 25,
          is_daily: true,
          is_weekly: false,
          tags: JSON.stringify(['deep-work', 'focus']),
          sort_order: 1
        },
        {
          goal: 'focus',
          title: 'Meditation session',
          description: 'Practice mindfulness or meditation for 10 minutes',
          category: 'personal',
          priority: 'medium',
          experience_reward: 15,
          estimated_minutes: 10,
          is_daily: true,
          is_weekly: false,
          tags: JSON.stringify(['meditation', 'mindfulness']),
          sort_order: 2
        },
        {
          goal: 'focus',
          title: 'Eliminate distractions',
          description: 'Turn off notifications and create a focused environment',
          category: 'work',
          priority: 'medium',
          experience_reward: 8,
          estimated_minutes: 5,
          is_daily: true,
          is_weekly: false,
          tags: JSON.stringify(['focus', 'productivity']),
          sort_order: 3
        },
        {
          goal: 'focus',
          title: 'Single-tasking practice',
          description: 'Complete one task completely before moving to the next',
          category: 'work',
          priority: 'medium',
          experience_reward: 12,
          estimated_minutes: 20,
          is_daily: true,
          is_weekly: false,
          tags: JSON.stringify(['focus', 'single-tasking']),
          sort_order: 4
        },

        // LEARNING GOAL TASKS
        {
          goal: 'learning',
          title: 'Read for 20 minutes',
          description: 'Read a book, article, or educational content',
          category: 'learning',
          priority: 'medium',
          experience_reward: 18,
          estimated_minutes: 20,
          is_daily: true,
          is_weekly: false,
          tags: JSON.stringify(['reading', 'education']),
          sort_order: 1
        },
        {
          goal: 'learning',
          title: 'Learn something new',
          description: 'Watch a tutorial, take an online course, or practice a new skill',
          category: 'learning',
          priority: 'medium',
          experience_reward: 20,
          estimated_minutes: 30,
          is_daily: true,
          is_weekly: false,
          tags: JSON.stringify(['learning', 'skill-development']),
          sort_order: 2
        },
        {
          goal: 'learning',
          title: 'Practice a skill',
          description: 'Dedicate time to improving a specific skill or hobby',
          category: 'learning',
          priority: 'medium',
          experience_reward: 15,
          estimated_minutes: 25,
          is_daily: true,
          is_weekly: false,
          tags: JSON.stringify(['practice', 'skill-development']),
          sort_order: 3
        },
        {
          goal: 'learning',
          title: 'Reflect on learning',
          description: 'Write down what you learned today and how to apply it',
          category: 'learning',
          priority: 'low',
          experience_reward: 10,
          estimated_minutes: 10,
          is_daily: true,
          is_weekly: false,
          tags: JSON.stringify(['reflection', 'learning']),
          sort_order: 4
        },

        // SOCIAL GOAL TASKS
        {
          goal: 'social',
          title: 'Connect with a friend',
          description: 'Call, message, or meet up with a friend or family member',
          category: 'social',
          priority: 'medium',
          experience_reward: 15,
          estimated_minutes: 15,
          is_daily: true,
          is_weekly: false,
          tags: JSON.stringify(['social', 'relationships']),
          sort_order: 1
        },
        {
          goal: 'social',
          title: 'Express gratitude',
          description: 'Thank someone or write down three things you\'re grateful for',
          category: 'social',
          priority: 'low',
          experience_reward: 8,
          estimated_minutes: 5,
          is_daily: true,
          is_weekly: false,
          tags: JSON.stringify(['gratitude', 'mindfulness']),
          sort_order: 2
        },
        {
          goal: 'social',
          title: 'Join a group activity',
          description: 'Participate in a community event, club, or group activity',
          category: 'social',
          priority: 'medium',
          experience_reward: 20,
          estimated_minutes: 60,
          is_daily: false,
          is_weekly: true,
          tags: JSON.stringify(['community', 'social']),
          sort_order: 3
        },
        {
          goal: 'social',
          title: 'Practice active listening',
          description: 'Have a conversation where you focus entirely on the other person',
          category: 'social',
          priority: 'medium',
          experience_reward: 12,
          estimated_minutes: 20,
          is_daily: true,
          is_weekly: false,
          tags: JSON.stringify(['listening', 'communication']),
          sort_order: 4
        },

        // CREATIVITY GOAL TASKS
        {
          goal: 'creativity',
          title: 'Creative expression',
          description: 'Draw, write, paint, or engage in any creative activity',
          category: 'personal',
          priority: 'medium',
          experience_reward: 18,
          estimated_minutes: 30,
          is_daily: true,
          is_weekly: false,
          tags: JSON.stringify(['creativity', 'art']),
          sort_order: 1
        },
        {
          goal: 'creativity',
          title: 'Brainstorm ideas',
          description: 'Spend time generating new ideas or solutions to problems',
          category: 'personal',
          priority: 'medium',
          experience_reward: 15,
          estimated_minutes: 20,
          is_daily: true,
          is_weekly: false,
          tags: JSON.stringify(['brainstorming', 'ideation']),
          sort_order: 2
        },
        {
          goal: 'creativity',
          title: 'Try something new',
          description: 'Experiment with a new hobby, recipe, or activity',
          category: 'personal',
          priority: 'medium',
          experience_reward: 20,
          estimated_minutes: 45,
          is_daily: false,
          is_weekly: true,
          tags: JSON.stringify(['experimentation', 'new-experiences']),
          sort_order: 3
        },
        {
          goal: 'creativity',
          title: 'Creative problem solving',
          description: 'Approach a challenge with an unconventional solution',
          category: 'personal',
          priority: 'medium',
          experience_reward: 16,
          estimated_minutes: 25,
          is_daily: true,
          is_weekly: false,
          tags: JSON.stringify(['problem-solving', 'creativity']),
          sort_order: 4
        }
      ]);
    });
}; 