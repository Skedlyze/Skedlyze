exports.up = function(knex) {
  return knex.raw(`
    INSERT INTO user_gamification_data (
      user_id, level, experience_points, total_experience_earned,
      current_streak_days, longest_streak_days, last_activity_date,
      total_tasks_created, total_tasks_completed, completion_rate,
      first_login_date, created_at, updated_at
    )
    SELECT 
      id as user_id,
      level,
      experience_points,
      experience_points as total_experience_earned,
      streak_days as current_streak_days,
      streak_days as longest_streak_days,
      last_activity_date,
      total_tasks_created,
      total_tasks_completed,
      CASE 
        WHEN total_tasks_created > 0 THEN (total_tasks_completed::decimal / total_tasks_created) * 100
        ELSE 0
      END as completion_rate,
      created_at as first_login_date,
      created_at,
      updated_at
    FROM users
    WHERE id NOT IN (SELECT user_id FROM user_gamification_data)
  `);
};

exports.down = function(knex) {
  return knex('user_gamification_data').del();
}; 