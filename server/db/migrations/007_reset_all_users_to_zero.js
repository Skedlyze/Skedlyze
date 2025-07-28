exports.up = function(knex) {
  return knex('users').update({
    level: 0,
    experience_points: 0,
    streak_days: 0,
    total_tasks_completed: 0,
    total_tasks_created: 0,
    last_activity_date: null,
    preferences: JSON.stringify({}),
    calendar_sync_enabled: false
  });
};

exports.down = function(knex) {
  // This migration is irreversible as we don't store the original values
  return Promise.resolve();
}; 