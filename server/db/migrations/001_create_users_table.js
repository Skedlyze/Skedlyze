exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.increments('id').primary();
    table.string('google_id').unique().notNullable();
    table.string('email').unique().notNullable();
    table.string('name').notNullable();
    table.string('picture').nullable();
    table.string('access_token').nullable();
    table.string('refresh_token').nullable();
    table.timestamp('token_expires_at').nullable();
    
    // Gamification fields
    table.integer('level').defaultTo(1);
    table.integer('experience_points').defaultTo(0);
    table.integer('streak_days').defaultTo(0);
    table.date('last_activity_date').nullable();
    table.integer('total_tasks_completed').defaultTo(0);
    table.integer('total_tasks_created').defaultTo(0);
    
    // Preferences
    table.jsonb('preferences').defaultTo('{}');
    table.boolean('calendar_sync_enabled').defaultTo(false);
    
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
}; 