exports.up = function(knex) {
  return knex.schema.createTable('tasks', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.string('title').notNullable();
    table.text('description').nullable();
    table.enum('priority', ['low', 'medium', 'high']).defaultTo('medium');
    table.enum('status', ['pending', 'in_progress', 'completed', 'cancelled']).defaultTo('pending');
    table.enum('category', ['work', 'personal', 'health', 'learning', 'social', 'other']).defaultTo('other');
    
    // Scheduling
    table.datetime('due_date').nullable();
    table.datetime('start_time').nullable();
    table.datetime('end_time').nullable();
    table.boolean('all_day').defaultTo(false);
    
    // Gamification
    table.integer('experience_reward').defaultTo(10);
    table.boolean('is_completed').defaultTo(false);
    table.datetime('completed_at').nullable();
    table.integer('completion_time_minutes').nullable();
    
    // Google Calendar integration
    table.string('google_calendar_event_id').nullable();
    table.boolean('synced_to_calendar').defaultTo(false);
    
    // Recurring tasks
    table.boolean('is_recurring').defaultTo(false);
    table.string('recurrence_rule').nullable(); // RRULE format
    
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('tasks');
}; 