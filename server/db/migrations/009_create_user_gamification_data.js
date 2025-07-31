exports.up = function(knex) {
  return knex.schema.createTable('user_gamification_data', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE').unique();
    
    // Core gamification stats
    table.integer('level').defaultTo(0).notNullable();
    table.integer('experience_points').defaultTo(0).notNullable();
    table.integer('total_experience_earned').defaultTo(0).notNullable();
    
    // Streak tracking
    table.integer('current_streak_days').defaultTo(0).notNullable();
    table.integer('longest_streak_days').defaultTo(0).notNullable();
    table.date('last_activity_date').nullable();
    table.date('streak_start_date').nullable();
    
    // Task statistics
    table.integer('total_tasks_created').defaultTo(0).notNullable();
    table.integer('total_tasks_completed').defaultTo(0).notNullable();
    table.integer('tasks_completed_today').defaultTo(0).notNullable();
    table.integer('tasks_completed_this_week').defaultTo(0).notNullable();
    table.integer('tasks_completed_this_month').defaultTo(0).notNullable();
    
    // Achievement tracking
    table.integer('total_achievements_earned').defaultTo(0).notNullable();
    table.jsonb('unlocked_achievements').defaultTo('[]').notNullable(); // Array of achievement IDs
    
    // Progress tracking
    table.decimal('completion_rate', 5, 2).defaultTo(0.00).notNullable(); // Percentage
    table.integer('consecutive_days_active').defaultTo(0).notNullable();
    table.date('first_login_date').nullable();
    
    // Game state
    table.jsonb('current_quests').defaultTo('[]').notNullable(); // Active quests
    table.jsonb('completed_quests').defaultTo('[]').notNullable(); // Completed quests
    table.jsonb('inventory').defaultTo('{}').notNullable(); // User's virtual items
    table.jsonb('badges').defaultTo('[]').notNullable(); // Earned badges
    
    // Performance metrics
    table.decimal('average_task_completion_time', 8, 2).nullable(); // in minutes
    table.integer('fastest_task_completion_minutes').nullable();
    table.integer('longest_task_completion_minutes').nullable();
    
    // Category-specific stats
    table.jsonb('category_stats').defaultTo('{}').notNullable(); // Stats per category
    
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('user_gamification_data');
}; 